-- ============================================================
-- ReseaKnowGpt 数据库初始化
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 启用 pgvector 扩展（向量检索）
create extension if not exists vector with schema extensions;

-- ============================================================
-- 1. 通用：自动更新 updated_at 的触发器函数
-- ============================================================
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. 用户信息扩展表（profiles）
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text,
  avatar_url text,
  bio text,
  institution text,
  research_field text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- 新用户注册时自动创建 profile
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- 3. 对话表（conversations）
-- ============================================================
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default '新对话',
  mode text not null default 'theory'
    check (mode in ('theory', 'technical')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_user_id on conversations(user_id);
create index idx_conversations_updated_at on conversations(updated_at desc);

create trigger conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at();

-- ============================================================
-- 4. 消息表（messages）
-- ============================================================
create table messages (
  id bigint primary key generated always as identity,
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  mode text not null default 'theory'
    check (mode in ('theory', 'technical')),
  sources jsonb default '[]',
  created_at timestamptz default now()
);

create index idx_messages_conversation_id on messages(conversation_id);
create index idx_messages_created_at on messages(conversation_id, created_at);

-- ============================================================
-- 5. 文献表（literature）
-- ============================================================
create table literature (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  authors text[] default '{}',
  abstract text,
  tags text[] default '{}',
  file_path text,
  file_size bigint,
  page_count int,
  status text default 'pending'
    check (status in ('pending', 'processing', 'ready', 'error')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_literature_user_id on literature(user_id);
create index idx_literature_status on literature(status);

create trigger literature_updated_at
  before update on literature
  for each row execute function update_updated_at();

-- ============================================================
-- 6. 文档分块表（document_chunks）— RAG 向量检索
-- ============================================================
create table document_chunks (
  id bigint primary key generated always as identity,
  literature_id bigint not null references literature(id) on delete cascade,
  content text not null,
  metadata jsonb default '{}',
  embedding vector(1536),
  created_at timestamptz default now()
);

create index idx_chunks_literature_id on document_chunks(literature_id);

-- 向量索引（IVFFlat，适合中等规模数据集）
create index idx_chunks_embedding on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- ============================================================
-- 7. 收藏表（favorites）
-- ============================================================
create table favorites (
  id bigint primary key generated always as identity,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null
    check (item_type in ('literature', 'conversation', 'workshop_tool')),
  item_id text not null,
  note text,
  created_at timestamptz default now(),
  unique(user_id, item_type, item_id)
);

create index idx_favorites_user_id on favorites(user_id);
create index idx_favorites_type on favorites(user_id, item_type);

-- ============================================================
-- 8. 向量相似度检索函数（RAG 核心）
-- ============================================================
create or replace function match_documents(
  query_embedding vector(1536),
  match_threshold float default 0.78,
  match_count int default 5,
  filter_literature_id bigint default null
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  literature_id bigint,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    dc.metadata,
    dc.literature_id,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  where 1 - (dc.embedding <=> query_embedding) > match_threshold
    and (filter_literature_id is null or dc.literature_id = filter_literature_id)
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ============================================================
-- 9. Row Level Security（行级安全策略）
-- ============================================================

-- profiles: 用户只能读写自己的资料
alter table profiles enable row level security;

create policy "用户可查看自己的资料"
  on profiles for select
  using (auth.uid() = id);

create policy "用户可更新自己的资料"
  on profiles for update
  using (auth.uid() = id);

-- conversations: 用户只能操作自己的对话
alter table conversations enable row level security;

create policy "用户可查看自己的对话"
  on conversations for select
  using (auth.uid() = user_id);

create policy "用户可创建对话"
  on conversations for insert
  with check (auth.uid() = user_id);

create policy "用户可更新自己的对话"
  on conversations for update
  using (auth.uid() = user_id);

create policy "用户可删除自己的对话"
  on conversations for delete
  using (auth.uid() = user_id);

-- messages: 通过 conversation 间接鉴权
alter table messages enable row level security;

create policy "用户可查看自己对话的消息"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "用户可在自己的对话中发消息"
  on messages for insert
  with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

-- literature: 用户只能操作自己的文献
alter table literature enable row level security;

create policy "用户可查看自己的文献"
  on literature for select
  using (auth.uid() = user_id);

create policy "用户可上传文献"
  on literature for insert
  with check (auth.uid() = user_id);

create policy "用户可更新自己的文献"
  on literature for update
  using (auth.uid() = user_id);

create policy "用户可删除自己的文献"
  on literature for delete
  using (auth.uid() = user_id);

-- document_chunks: 通过 literature 间接鉴权
alter table document_chunks enable row level security;

create policy "用户可查看自己文献的分块"
  on document_chunks for select
  using (
    exists (
      select 1 from literature l
      where l.id = document_chunks.literature_id
        and l.user_id = auth.uid()
    )
  );

-- favorites: 用户只能操作自己的收藏
alter table favorites enable row level security;

create policy "用户可查看自己的收藏"
  on favorites for select
  using (auth.uid() = user_id);

create policy "用户可添加收藏"
  on favorites for insert
  with check (auth.uid() = user_id);

create policy "用户可删除自己的收藏"
  on favorites for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 10. Storage Bucket（文献文件存储）
-- ============================================================
insert into storage.buckets (id, name, public)
values ('literature-files', 'literature-files', false)
on conflict (id) do nothing;

create policy "用户可上传文献文件"
  on storage.objects for insert
  with check (
    bucket_id = 'literature-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "用户可查看自己的文献文件"
  on storage.objects for select
  using (
    bucket_id = 'literature-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "用户可删除自己的文献文件"
  on storage.objects for delete
  using (
    bucket_id = 'literature-files'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
