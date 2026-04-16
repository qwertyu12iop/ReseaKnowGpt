---
name: literature-management
description: >-
  文献库管理模块。文献存储在 Supabase 中，支持上传、检索、分类、阅读、
  向量化入库等功能。当开发文献上传、文献列表、文献详情、PDF 解析、
  文献分类标签管理时使用。
---

# 文献库管理

## 模块功能

1. **文献上传**：支持 PDF 上传到 Supabase Storage，元数据入 `literature` 表
2. **文献列表**：分页、搜索、按分类/标签筛选
3. **文献详情**：查看元数据、摘要、关联知识块
4. **文献向量化**：上传后自动触发 PDF 解析 → 分块 → Embedding → 入库
5. **文献引用**：在 Chat 技术实践模式中引用文献内容

## 数据库设计

```sql
create table literature (
  id bigint primary key generated always as identity,
  title text not null,
  authors text[],
  abstract text,
  tags text[],
  file_path text,
  file_size bigint,
  page_count int,
  status text default 'pending',  -- pending / processing / ready / error
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## 文件结构

```
components/literature/
  LiteraturePage.tsx       → 文献库主页面
  LiteratureList.tsx       → 文献列表（含搜索筛选）
  LiteratureCard.tsx       → 文献卡片
  LiteratureUpload.tsx     → 上传对话框
  LiteratureDetail.tsx     → 文献详情页

services/
  literature.ts            → 文献 CRUD 操作
  pdf-parser.ts            → PDF 解析（文本提取）

hooks/
  use-literature.ts        → 文献列表状态管理
```

## 上传处理流程

```
选择 PDF → 上传到 Supabase Storage
        → 创建 literature 记录（status: processing）
        → 后台异步：PDF 解析 → 分块 → Embedding → 存入 document_chunks
        → 更新 status: ready
```
