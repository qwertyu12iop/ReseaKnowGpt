import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type { ChatMode, Conversation } from '@/types/chat'

type Profile = Database['public']['Tables']['profiles']['Row']
type ConversationRow = Database['public']['Tables']['conversations']['Row']

export interface InitialAppData {
  user: User | null
  profile: Profile | null
  conversations: Conversation[]
}

/**
 * 在服务端预取首屏所需数据：当前会话用户、用户资料、会话列表。
 * - 未登录时返回空数据，不发起额外请求
 * - 使用 React cache 在同一次请求内复用结果
 */
export const getInitialAppData = cache(async (): Promise<InitialAppData> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, profile: null, conversations: [] }
  }

  const profilePromise = supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const convsPromise = supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const [profileRes, convsRes] = await Promise.all([profilePromise, convsPromise])

  const convRows = (convsRes.data ?? []) as ConversationRow[]
  const conversations: Conversation[] = convRows.map((row) => ({
    id: row.id,
    title: row.title,
    mode: row.mode as ChatMode,
    messages: [],
    createdAt: new Date(row.created_at),
  }))

  return {
    user,
    profile: profileRes.data ?? null,
    conversations,
  }
})
