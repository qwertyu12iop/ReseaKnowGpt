'use client'

import { useState, useCallback } from 'react'
import { useConversation } from '@/contexts/ConversationContext'
import { useI18n } from '@/contexts/I18nContext'
import ModeSelector from './ModeSelector'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'

export default function ChatArea() {
  const { conversations, activeConversationId, mode, isLoading, setMode, sendMessage, newChat } =
    useConversation()
  const { t } = useI18n()
  const [promptValue, setPromptValue] = useState('')

  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null
  const messages = activeConversation?.messages ?? []

  const handleSend = useCallback(
    (content: string) => {
      setPromptValue('')
      sendMessage(content)
    },
    [sendMessage],
  )

  const handlePromptClick = useCallback((prompt: string) => {
    setPromptValue(prompt)
  }, [])

  const handleModeChange = useCallback(
    (nextMode: typeof mode) => {
      if (nextMode === mode) return
      setMode(nextMode)
      setPromptValue('')
      newChat()
    },
    [mode, newChat, setMode],
  )

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <header className="relative z-10 flex min-h-12 shrink-0 flex-row items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--chat-bg)] px-4 py-2.5 sm:min-h-14 sm:px-6 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${mode === 'theory' ? 'bg-indigo-400' : 'bg-emerald-400'} shadow-[0_0_8px_currentColor]`}
          />
          <span className="min-w-0 truncate text-sm font-medium text-[var(--text-secondary)] sm:max-w-xs">
            {activeConversation ? activeConversation.title : t('chat.new')}
          </span>
        </div>
        <div className="shrink-0">
          <ModeSelector mode={mode} onChange={handleModeChange} />
        </div>
      </header>

      {/* Messages or welcome */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <WelcomeScreen mode={mode} onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <MessageList messages={messages} isLoading={isLoading} />
        )}
        <ChatInput
          mode={mode}
          isLoading={isLoading}
          initialValue={promptValue}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}
