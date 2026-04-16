'use client'

import { useState, useCallback } from 'react'
import { useConversation } from '@/contexts/ConversationContext'
import { useI18n } from '@/contexts/I18nContext'
import ModeSelector from './ModeSelector'
import MessageList from './MessageList'
import ChatInput from './ChatInput'
import WelcomeScreen from './WelcomeScreen'

export default function ChatArea() {
  const { conversations, activeConversationId, mode, isLoading, setMode, sendMessage } =
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

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--chat-bg)] shrink-0">
        <span className="text-sm font-medium text-[var(--text-secondary)] truncate max-w-[160px] sm:max-w-xs">
          {activeConversation ? activeConversation.title : t('chat.new')}
        </span>
        <ModeSelector mode={mode} onChange={setMode} />
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
