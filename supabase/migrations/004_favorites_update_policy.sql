-- ============================================================
-- 为 favorites 表补充 update 策略，允许用户编辑自己的收藏备注
-- （001 迁移仅定义了 select/insert/delete 策略）
-- ============================================================

drop policy if exists "用户可更新自己的收藏" on favorites;

create policy "用户可更新自己的收藏"
  on favorites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
