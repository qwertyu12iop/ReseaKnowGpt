'use client'

import { useState, useRef, KeyboardEvent, useEffect } from 'react'
import { ChatMode } from '@/types/chat'
import { useI18n } from '@/contexts/I18nContext'

interface ChatInputProps {
  mode: ChatMode
  isLoading: boolean
  initialValue?: string
  onSend: (content: string) => void
}

export default function ChatInput({ mode, isLoading, initialValue = '', onSend }: ChatInputProps) {
  const isComposingRef = useRef(false)
  const { t } = useI18n()
  const [input, setInput] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [prevInitialValue, setPrevInitialValue] = useState(initialValue)

  if (initialValue !== prevInitialValue) {
    setPrevInitialValue(initialValue)
    if (initialValue) {
      setInput(initialValue)
    }
  }

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px'
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 中文输入法等场景下，首次 Enter 用于上屏，不应触发发送
    if (isComposingRef.current || e.nativeEvent.isComposing || e.keyCode === 229) {
      return
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isTheory = mode === 'theory'
  const placeholder = isTheory
    ? t('chat.input.theory.placeholder')
    : t('chat.input.technical.placeholder')

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div
          className={`flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all duration-200 glass-panel focus-within:ring-2 focus-within:ring-offset-0 ${
            isTheory
              ? 'focus-within:border-indigo-400/50 focus-within:ring-indigo-500/20'
              : 'focus-within:border-emerald-400/50 focus-within:ring-emerald-500/20'
          }`}
        >
          <div
            className={`shrink-0 mb-1.5 w-2 h-2 rounded-full ${isTheory ? 'bg-indigo-400' : 'bg-emerald-400'} shadow-[0_0_8px_currentColor]`}
          />

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false
            }}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] leading-relaxed py-0 disabled:opacity-50"
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`shrink-0 mb-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? isTheory
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-500/40 hover:shadow-indigo-500/60 hover:-translate-y-0.5'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-md shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-0.5'
                : 'bg-[var(--chat-surface)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[10px] text-[var(--text-muted)] mt-1.5">
          {t('chat.input.hint')}
        </p>
      </div>
    </div>
  )
}
