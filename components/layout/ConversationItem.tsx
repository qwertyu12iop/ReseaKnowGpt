'use client'

import { useState } from 'react'
import { Conversation } from '@/types/chat'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useI18n } from '@/contexts/I18nContext'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onClick: () => void
  onDelete: (id: string) => void
  deleteLabel?: string
}

export default function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  deleteLabel = '删除',
}: ConversationItemProps) {
  const { t } = useI18n()
  const { isFavorited, toggle } = useFavorites()
  const [toggling, setToggling] = useState(false)
  const favorited = isFavorited('conversation', conversation.id)
  const isTheory = conversation.mode === 'theory'
  const modeColor = isTheory
    ? 'bg-gradient-to-br from-indigo-500/25 to-violet-500/25 text-indigo-300 ring-1 ring-indigo-400/25'
    : 'bg-gradient-to-br from-emerald-500/25 to-teal-500/25 text-emerald-300 ring-1 ring-emerald-400/25'

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (toggling) return
    setToggling(true)
    try {
      await toggle('conversation', conversation.id)
    } finally {
      setToggling(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent text-[var(--text-primary)]'
          : 'hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]'
      }`}
    >
      {isActive && (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500"
        />
      )}
      <span className="flex-1 truncate text-xs leading-5">{conversation.title}</span>
      <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${modeColor}`}>
        {isTheory ? '理' : '技'}
      </span>
      <button
        onClick={handleToggleFavorite}
        disabled={toggling}
        className={`shrink-0 p-0.5 rounded transition-all ${
          favorited
            ? 'opacity-100 text-pink-400 hover:text-pink-300'
            : 'opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-pink-400'
        }`}
        title={favorited ? t('favorites.remove') : t('favorites.add')}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={favorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(conversation.id)
        }}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all p-0.5 rounded"
        title={deleteLabel}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </svg>
      </button>
    </div>
  )
}
