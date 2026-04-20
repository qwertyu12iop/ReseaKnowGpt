-- ============================================================
-- 补充：允许用户更新自己对话中的消息（用于写入 sources / 编辑消息）
-- ============================================================

create policy "用户可更新自己对话的消息"
  on messages for update
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );
