'use client'

import { Message } from '@/types/chat'
import { useI18n } from '@/contexts/I18nContext'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { t } = useI18n()
  const isUser = message.role === 'user'
  const isTheory = message.mode === 'theory'

  return (
    <div className={`flex gap-3 sm:gap-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white text-xs font-semibold">
            U
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow shadow-indigo-500/20">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        )}
      </div>

      <div
        className={`flex flex-col gap-1 max-w-[80%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}
      >
        <div
          className={`flex items-center gap-2 text-xs text-[var(--text-muted)] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <span>{isUser ? t('chat.you') : t('chat.bot')}</span>
          {!isUser && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isTheory ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              {isTheory ? t('mode.theory.badge') : t('mode.technical.badge')}
            </span>
          )}
        </div>

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap ${
            isUser
              ? 'bg-[var(--input-bg)] text-[var(--text-primary)] rounded-tr-sm'
              : 'bg-[var(--chat-surface)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
