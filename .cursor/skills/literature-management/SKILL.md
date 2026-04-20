---
name: literature-management
description: >-
  文献库管理模块。通过 OpenAlex + arXiv 等官方学术 API 爬取分类文献，存入
  Supabase 公共目录表。支持按分类浏览、全文搜索、原文跳转、AI 精读（按需生成
  + 永久缓存）。当开发文献列表、爬取任务、AI 精读、分类标签管理时使用。
---

# 文献库管理

## 模块功能

1. **分类爬取**：从 OpenAlex（高被引）+ arXiv（最新预印本）按分类关键词词典拉取论文
2. **公共库浏览**：所有登录用户共享同一份目录，按分类/关键词/排序筛选
3. **AI 精读**：点按钮调 DeepSeek 生成中文精读（300~500 字 + 3~5 条核心要点），结果永久缓存
4. **原文跳转**：卡片右下角直接打开 OA PDF / 原始落地页
5. **个人 PDF 库**（保留）：用户仍可上传 PDF 到 Supabase Storage，走 `literature` 表

## 数据库设计

详见 `supabase/migrations/003_paper_catalog.sql`：

- `paper_catalog` — 公共文献目录，字段含 `external_id`（唯一去重键）、`source`、`category`、`cited_by_count`、`tags` 等
- `paper_summary` — AI 精读缓存表，`paper_id` 主键，一篇论文至多一份中文精读
- RLS：登录用户可读，写入仅限后端 service_role
- 已扩展 `favorites.item_type` 支持收藏公共文献

## 文件结构

```
lib/literature/
  openalex.ts              → OpenAlex 客户端（chat 用 searchOpenAlex / 爬虫用 searchOpenAlexCatalog）
  arxiv.ts                 → arXiv 客户端（轻量 Atom XML 解析）
  categories.ts            → 分类 × 关键词词典

lib/supabase/
  admin.ts                 → service_role 客户端（绕过 RLS，仅后端用）

services/
  paper-crawler.ts         → 按分类爬取 + upsert paper_catalog
  paper-summary.ts         → 获取或生成 AI 精读（带缓存）
  papers.ts                → 浏览器端 API 封装（fetchPapers / fetchPaperSummary）

hooks/
  use-papers.ts            → 列表状态（分页 + 分类 + 搜索 + 排序）

components/literature/
  LiteraturePage.tsx       → 文献库主页（真数据）
  paper-card.tsx           → 论文卡片
  paper-summary-modal.tsx  → AI 精读弹窗

app/api/papers/
  route.ts                 → GET /api/papers 列表
  crawl/route.ts           → POST /api/papers/crawl 触发爬取（Bearer CRAWL_SECRET）
  summary/route.ts         → POST /api/papers/summary 按需 AI 精读
```

## 使用流程

### 首次初始化

1. 在 Supabase SQL Editor 执行 `supabase/migrations/003_paper_catalog.sql`
2. `.env.local` 补充：
   - `SUPABASE_SERVICE_ROLE_KEY`（Supabase Dashboard → Settings → API）
   - `CRAWL_SECRET`（自己定义一串随机字符串）
3. 触发首次爬取（全分类约 2~3 分钟，每分类 40 条）：
   ```bash
   curl -X POST http://localhost:3005/api/papers/crawl \
     -H "Authorization: Bearer $CRAWL_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"category":"all"}'
   ```
   或只爬单个分类：`{"category":"ai"}`

### 定期更新

建议用 Vercel Cron 或本地 cron 每天调用一次 `POST /api/papers/crawl`。
`upsert(external_id)` 会自动去重，不会重复入库。

## 展示策略（重要设计决策）

| 行为 | 实现 |
|---|---|
| 列表 | 直接展示 OpenAlex/arXiv 官方英文摘要（2~3 行截断） |
| 原文按钮 | 跳 `pdf_url ?? url`，新窗口打开 |
| AI 精读按钮 | 点击后调 `/api/papers/summary` — 命中缓存秒返回，未命中调 LLM 约 10s |
| 收藏 | 写入 `favorites` 表（`item_type='paper_catalog'`） |

**为什么不"全部 AI 概括"**：
- 官方摘要由作者撰写最准确
- AI 精读按需生成 + 永久缓存，显著节省 token
- 爬虫一次拉 100+ 条论文若都预生成精读成本过高

## 分类扩展

在 `lib/literature/categories.ts` 添加新 `CategoryConfig` 对象，同时更新：
- `types/paper.ts` 的 `PaperCategory` 联合类型
- `types/supabase.ts` 的 `PaperCategory`
- `supabase/migrations/003_paper_catalog.sql` 的 `check (category in (...))` 约束
