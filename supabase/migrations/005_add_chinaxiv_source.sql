-- ============================================================
-- 扩展 paper_catalog.source 约束，增加 'chinaxiv' 来源
-- ChinaXiv（http://chinaxiv.org）是中国的开放预印本平台
-- ============================================================

alter table paper_catalog
  drop constraint if exists paper_catalog_source_check;

alter table paper_catalog
  add constraint paper_catalog_source_check
    check (source in ('openalex', 'arxiv', 'semantic_scholar', 'chinaxiv'));
