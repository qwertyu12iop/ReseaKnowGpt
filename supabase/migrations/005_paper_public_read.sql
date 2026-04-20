-- ============================================================
-- 允许未登录（匿名）用户浏览公共文献目录与 AI 精读缓存
-- 注意：写入策略不变，仍仅限后端 service_role
-- ============================================================

drop policy if exists "已登录用户可查看公共文献" on paper_catalog;
drop policy if exists "所有人可查看公共文献" on paper_catalog;

create policy "所有人可查看公共文献"
  on paper_catalog for select
  to anon, authenticated
  using (true);

drop policy if exists "已登录用户可查看 AI 精读" on paper_summary;
drop policy if exists "所有人可查看 AI 精读" on paper_summary;

create policy "所有人可查看 AI 精读"
  on paper_summary for select
  to anon, authenticated
  using (true);
