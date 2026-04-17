'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { ChatMode, Conversation, Message } from '@/types/chat'

function buildTitle(content: string): string {
  return content.length > 32 ? content.slice(0, 32) + '…' : content
}

interface ConversationContextValue {
  conversations: Conversation[]
  activeConversationId: string | null
  mode: ChatMode
  isLoading: boolean
  setMode: (mode: ChatMode) => void
  setActiveConversationId: (id: string | null) => void
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => void
  deleteConversation: (id: string) => void
  newChat: () => void
}

const ConversationContext = createContext<ConversationContextValue | null>(null)

export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>('theory')
  const [isLoading] = useState(false)
  const { user } = useAuth()

  const supabaseRef = useRef(createClient())

  // 登录后加载该用户的所有对话
  useEffect(() => {
    if (!user) return

    const loadConversations = async () => {
      const { data: convRows } = await supabaseRef.current
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (!convRows) return

      const loaded: Conversation[] = convRows.map((row) => ({
        id: row.id,
        title: row.title,
        mode: row.mode as ChatMode,
        messages: [],
        createdAt: new Date(row.created_at),
      }))

      setConversations(loaded)
    }

    loadConversations()

    return () => {
      setConversations([])
      setActiveConversationIdState(null)
    }
  }, [user])

  // 加载某个对话的消息
  const loadMessages = useCallback(
    async (conversationId: string) => {
      const existing = conversations.find((c) => c.id === conversationId)
      if (existing && existing.messages.length > 0) return

      const { data: msgRows } = await supabaseRef.current
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (!msgRows) return

      const messages: Message[] = msgRows.map((row) => ({
        id: String(row.id),
        role: row.role as 'user' | 'assistant',
        content: row.content,
        mode: row.mode as ChatMode,
        timestamp: new Date(row.created_at),
      }))

      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, messages } : c)),
      )
    },
    [conversations],
  )

  // 切换对话时自动加载消息
  const setActiveConversationId = useCallback(
    (id: string | null) => {
      setActiveConversationIdState(id)
      if (id) loadMessages(id)
    },
    [loadMessages],
  )

  const newChat = useCallback(() => {
    setActiveConversationIdState(null)
  }, [])

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setActiveConversationIdState((prev) => (prev === id ? null : prev))

    await supabaseRef.current.from('conversations').delete().eq('id', id)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) return

      if (!activeConversationId) {
        // 新建对话 + 第一条消息
        const { data: newConv } = await supabaseRef.current
          .from('conversations')
          .insert({
            user_id: user.id,
            title: buildTitle(content),
            mode,
          })
          .select()
          .single()

        if (!newConv) return

        const { data: newMsg } = await supabaseRef.current
          .from('messages')
          .insert({
            conversation_id: newConv.id,
            role: 'user',
            content,
            mode,
          })
          .select()
          .single()

        const msg: Message = {
          id: String(newMsg!.id),
          role: 'user',
          content,
          mode,
          timestamp: new Date(newMsg!.created_at),
        }

        const conv: Conversation = {
          id: newConv.id,
          title: newConv.title,
          mode: newConv.mode as ChatMode,
          messages: [msg],
          createdAt: new Date(newConv.created_at),
        }

        setConversations((prev) => [conv, ...prev])
        setActiveConversationIdState(newConv.id)
      } else {
        // 往已有对话追加消息
        const { data: newMsg } = await supabaseRef.current
          .from('messages')
          .insert({
            conversation_id: activeConversationId,
            role: 'user',
            content,
            mode,
          })
          .select()
          .single()

        if (!newMsg) return

        const msg: Message = {
          id: String(newMsg.id),
          role: 'user',
          content,
          mode,
          timestamp: new Date(newMsg.created_at),
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId ? { ...c, messages: [...c.messages, msg] } : c,
          ),
        )

        // 更新对话的 updated_at
        await supabaseRef.current
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversationId)
      }
    },
    [activeConversationId, mode, user],
  )

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversationId,
        mode,
        isLoading,
        setMode,
        setActiveConversationId,
        loadMessages,
        sendMessage,
        deleteConversation,
        newChat,
      }}
    >
      {children}
    </ConversationContext.Provider>
  )
}

export function useConversation() {
  const ctx = useContext(ConversationContext)
  if (!ctx) throw new Error('useConversation must be used within ConversationProvider')
  return ctx
}
