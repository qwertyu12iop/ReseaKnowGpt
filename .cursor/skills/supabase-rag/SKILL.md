---
name: supabase-rag
description: >-
  Supabase + pgvector 实现 RAG（检索增强生成）。包括文档分块、向量嵌入存储、
  相似度检索、上下文拼装等完整 RAG 管道。当涉及向量数据库、知识库检索、
  文档嵌入、Embedding、语义搜索时使用。
---

# Supabase RAG 管道

## 架构

```
文档上传 → 文本提取 → 分块(Chunking) → Embedding → 存入 Supabase(pgvector)
                                                         ↓
用户查询 → Query Embedding → 相似度检索(match_documents) → Top-K 结果
                                                         ↓
                                              拼装上下文 → LLM 生成回答
```

## 数据库表结构

```sql
-- 文档块表
create table document_chunks (
  id bigint primary key generated always as identity,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(1536),
  literature_id bigint references literature(id),
  created_at timestamptz default now()
);

-- 相似度检索函数
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 5
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
) language plpgsql as $$
begin
  return query
  select
    dc.id, dc.content, dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;
```

## 关键文件

```
lib/supabase.ts           → Supabase 客户端初始化
services/embedding.ts      → 调用 Embedding API 生成向量
services/rag-pipeline.ts   → RAG 完整管道：检索 + 拼装 + 生成
services/chunking.ts       → 文档分块策略
```

## 分块策略

- 默认按段落分块，每块 500-1000 tokens
- 保留 100 tokens 重叠（overlap）确保上下文连贯
- 对 PDF 按页 + 段落双维度分块，metadata 中记录页码

## 检索优化

- 设置合理的 `match_threshold`（建议 0.75-0.85）
- 返回 Top 5-10 结果，按相关度排序
- 结果去重（同一文献相邻块合并）
