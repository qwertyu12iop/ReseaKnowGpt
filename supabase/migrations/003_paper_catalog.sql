-- ============================================================
-- 公共文献目录（爬取自 OpenAlex / arXiv 等学术数据源）
-- 所有登录用户共享阅读，写入仅限后端 service_role
-- ============================================================

create table paper_catalog (
  id bigint primary key generated always as identity,
  external_id text not null,                                  -- 'openalex:W123' / 'arxiv:2301.00001'
  source text not null check (source in ('openalex','arxiv','semantic_scholar')),
  title text not null,
  authors text[] default '{}',
  abstract text,
  year int,
  venue text,
  doi text,
  url text not null,
  pdf_url text,
  category text not null check (category in ('ai','systems','algorithms','network','security','theory','database','hci')),
  tags text[] default '{}',
  cited_by_count int default 0,
  is_open_access boolean default false,
  fetched_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(external_id)
);

create index idx_paper_catalog_category on paper_catalog(category, cited_by_count desc);
create index idx_paper_catalog_year on paper_catalog(year desc);
create index idx_paper_catalog_cited on paper_catalog(cited_by_count desc);
create index idx_paper_catalog_search on paper_catalog
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(abstract,'')));

-- ============================================================
-- AI 精读缓存表（按需生成，永久缓存，节省 token）
-- ============================================================
create table paper_summary (
  paper_id bigint primary key references paper_catalog(id) on delete cascade,
  summary_zh text,
  summary_en text,
  key_points jsonb default '[]',      -- [{ title: string, content: string }]
  model text,                         -- 生成时使用的模型
  generated_at timestamptz default now()
);

-- ============================================================
-- RLS：登录用户可读，写入仅限 service_role
-- ============================================================
alter table paper_catalog enable row level security;
alter table paper_summary enable row level security;

create policy "已登录用户可查看公共文献"
  on paper_catalog for select
  using (auth.role() = 'authenticated');

create policy "已登录用户可查看 AI 精读"
  on paper_summary for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- 扩展 favorites.item_type 以允许收藏公共文献
-- ============================================================
alter table favorites drop constraint if exists favorites_item_type_check;
alter table favorites add constraint favorites_item_type_check
  check (item_type in ('literature', 'conversation', 'workshop_tool', 'paper_catalog'));

-- ============================================================
-- 便捷视图：带 AI 精读状态的文献列表
-- ============================================================
create or replace view paper_catalog_with_summary as
  select
    p.*,
    (ps.paper_id is not null) as has_summary
  from paper_catalog p
  left join paper_summary ps on ps.paper_id = p.id;
