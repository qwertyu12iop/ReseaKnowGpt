'use client'

import { ChatMode } from '@/types/chat'
import { useI18n } from '@/contexts/I18nContext'

interface ModeSelectorProps {
  mode: ChatMode
  onChange: (mode: ChatMode) => void
}

export default function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const { t } = useI18n()

  const modes = [
    {
      key: 'theory' as ChatMode,
      label: t('mode.theory'),
      desc: t('mode.theory.desc'),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
          <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
        </svg>
      ),
      activeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40',
      inactiveClass:
        'text-[var(--text-muted)] border-transparent hover:bg-[var(--input-bg)] hover:text-[var(--text-secondary)]',
    },
    {
      key: 'technical' as ChatMode,
      label: t('mode.technical'),
      desc: t('mode.technical.desc'),
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      activeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      inactiveClass:
        'text-[var(--text-muted)] border-transparent hover:bg-[var(--input-bg)] hover:text-[var(--text-secondary)]',
    },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--chat-surface)] border border-[var(--border-color)]">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          title={m.desc}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 ${
            mode === m.key ? m.activeClass : m.inactiveClass
          }`}
        >
          {m.icon}
          <span className="hidden sm:inline">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
