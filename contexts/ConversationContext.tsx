'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { streamChat } from '@/services/chat-theory'
import { fetchSources } from '@/services/fetch-sources'
import { ChatMode, Conversation, Message, Source } from '@/types/chat'

function buildTitle(content: string): string {
  return content.length > 32 ? content.slice(0, 32) + '…' : content
}

interface ConversationContextValue {
  conversations: Conversation[]
  activeConversationId: string | null
  mode: ChatMode
  isLoading: boolean
  isFetchingConversations: boolean
  setMode: (mode: ChatMode) => void
  setActiveConversationId: (id: string | null) => void
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (content: string) => void
  deleteConversation: (id: string) => void
  newChat: () => void
}

const ConversationContext = createContext<ConversationContextValue | null>(null)

interface ConversationProviderProps {
  children: React.ReactNode
  initialConversations?: Conversation[]
}

export function ConversationProvider({
  children,
  initialConversations = [],
}: ConversationProviderProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>('theory')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const supabaseRef = useRef(createClient())
  // 跟踪当前会话列表所属的用户，避免对相同用户重复拉取
  const loadedUserIdRef = useRef<string | null>(
    initialConversations.length > 0 ? (user?.id ?? null) : null,
  )
  // 仅用于客户端登录后过渡场景的骨架屏
  const [isFetchingConversations, setIsFetchingConversations] = useState(false)

  // 始终保持最新会话列表，sendMessage 流式回调可避开闭包陷阱
  const conversationsRef = useRef(conversations)
  useEffect(() => {
    conversationsRef.current = conversations
  }, [conversations])

  // 当用户变化（登录/切换账号/登出）时同步会话列表
  useEffect(() => {
    if (!user) {
      if (loadedUserIdRef.current !== null) {
        setConversations([])
        setActiveConversationIdState(null)
        loadedUserIdRef.current = null
      }
      return
    }

    if (loadedUserIdRef.current === user.id) return

    let cancelled = false
    setIsFetchingConversations(true)

    const loadConversations = async () => {
      const { data: convRows } = await supabaseRef.current
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (cancelled) return

      const loaded: Conversation[] = (convRows ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        mode: row.mode as ChatMode,
        messages: [],
        createdAt: new Date(row.created_at),
      }))

      setConversations(loaded)
      loadedUserIdRef.current = user.id
      setIsFetchingConversations(false)
    }

    loadConversations()

    return () => {
      cancelled = true
      setIsFetchingConversations(false)
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
        sources: Array.isArray(row.sources) ? (row.sources as unknown as Source[]) : undefined,
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
      if (!user || isLoading) return

      setIsLoading(true)

      const supabase = supabaseRef.current
      let conversationId = activeConversationId
      let historyForApi: { role: 'user' | 'assistant'; content: string }[] = []

      try {
        // 1) 写入用户消息（按是否新建对话分两支）
        if (!conversationId) {
          const { data: newConv, error: convErr } = await supabase
            .from('conversations')
            .insert({
              user_id: user.id,
              title: buildTitle(content),
              mode,
            })
            .select()
            .single()

          if (convErr || !newConv) throw new Error(convErr?.message ?? '创建对话失败')

          const { data: newMsg, error: msgErr } = await supabase
            .from('messages')
            .insert({
              conversation_id: newConv.id,
              role: 'user',
              content,
              mode,
            })
            .select()
            .single()

          if (msgErr || !newMsg) throw new Error(msgErr?.message ?? '保存消息失败')

          const userMsg: Message = {
            id: String(newMsg.id),
            role: 'user',
            content,
            mode,
            timestamp: new Date(newMsg.created_at),
          }

          const conv: Conversation = {
            id: newConv.id,
            title: newConv.title,
            mode: newConv.mode as ChatMode,
            messages: [userMsg],
            createdAt: new Date(newConv.created_at),
          }

          setConversations((prev) => [conv, ...prev])
          setActiveConversationIdState(newConv.id)
          conversationId = newConv.id
          historyForApi = [{ role: 'user', content }]
        } else {
          const existing = conversationsRef.current.find((c) => c.id === conversationId)
          const prevMessages = existing?.messages ?? []

          const { data: newMsg, error: msgErr } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              role: 'user',
              content,
              mode,
            })
            .select()
            .single()

          if (msgErr || !newMsg) throw new Error(msgErr?.message ?? '保存消息失败')

          const userMsg: Message = {
            id: String(newMsg.id),
            role: 'user',
            content,
            mode,
            timestamp: new Date(newMsg.created_at),
          }

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, messages: [...c.messages, userMsg] } : c,
            ),
          )

          historyForApi = [
            ...prevMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user' as const, content },
          ]
        }

        // 2) 调用 LLM 流式生成
        const tempId = `streaming-${Date.now()}`
        let assistantContent = ''
        let assistantInserted = false
        const cid = conversationId

        const fullText = await streamChat({
          mode,
          messages: historyForApi,
          onDelta: (chunk) => {
            assistantContent += chunk
            if (!assistantInserted) {
              assistantInserted = true
              const placeholder: Message = {
                id: tempId,
                role: 'assistant',
                content: assistantContent,
                mode,
                timestamp: new Date(),
              }
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === cid ? { ...c, messages: [...c.messages, placeholder] } : c,
                ),
              )
            } else {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === cid
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === tempId ? { ...m, content: assistantContent } : m,
                        ),
                      }
                    : c,
                ),
              )
            }
          },
        })

        // 3) 落库 assistant 消息 + 刷新 updated_at
        let assistantMsgId: string | null = null
        if (fullText) {
          const { data: savedMsg } = await supabase
            .from('messages')
            .insert({
              conversation_id: cid,
              role: 'assistant',
              content: fullText,
              mode,
            })
            .select()
            .single()

          if (savedMsg) {
            const realId = String(savedMsg.id)
            const realTs = new Date(savedMsg.created_at)
            assistantMsgId = realId
            const enableSources = mode === 'theory'
            setConversations((prev) =>
              prev.map((c) =>
                c.id === cid
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === tempId
                          ? {
                              ...m,
                              id: realId,
                              timestamp: realTs,
                              sourcesLoading: enableSources,
                            }
                          : m,
                      ),
                    }
                  : c,
              ),
            )
          }

          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', cid)
        }

        // 4) 理论模式：异步检索真实文献并写回（不阻塞 UI）
        if (mode === 'theory' && assistantMsgId && fullText) {
          const msgIdForUpdate = assistantMsgId
          fetchSources(content, fullText)
            .then(async ({ sources }) => {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === cid
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === msgIdForUpdate ? { ...m, sources, sourcesLoading: false } : m,
                        ),
                      }
                    : c,
                ),
              )
              if (sources.length > 0) {
                await supabaseRef.current
                  .from('messages')
                  .update({ sources: sources as unknown as never })
                  .eq('id', Number(msgIdForUpdate))
              }
            })
            .catch(() => {
              setConversations((prev) =>
                prev.map((c) =>
                  c.id === cid
                    ? {
                        ...c,
                        messages: c.messages.map((m) =>
                          m.id === msgIdForUpdate ? { ...m, sourcesLoading: false } : m,
                        ),
                      }
                    : c,
                ),
              )
            })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '生成回答失败'
        const errMsg: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ ${msg}`,
          mode,
          timestamp: new Date(),
        }
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, messages: [...c.messages, errMsg] } : c,
          ),
        )
      } finally {
        setIsLoading(false)
      }
    },
    [activeConversationId, isLoading, mode, user],
  )

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        activeConversationId,
        mode,
        isLoading,
        isFetchingConversations,
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
