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
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white text-xs font-semibold ring-1 ring-white/10">
            U
          </div>
        ) : (
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md ring-1 ring-white/10 ${
              isTheory
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-500/30'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
            }`}
          >
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
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ring-1 ${
                isTheory
                  ? 'bg-indigo-500/15 text-indigo-300 ring-indigo-400/25'
                  : 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/25'
              }`}
            >
              {isTheory ? t('mode.theory.badge') : t('mode.technical.badge')}
            </span>
          )}
        </div>

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap backdrop-blur-sm border ${
            isUser
              ? 'bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border-indigo-400/20 text-[var(--text-primary)] rounded-tr-sm'
              : 'bg-[var(--chat-surface)] border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  )
}
