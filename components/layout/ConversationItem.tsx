'use client'

import { Conversation } from '@/types/chat'

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
  const isTheory = conversation.mode === 'theory'
  const modeColor = isTheory
    ? 'bg-indigo-500/20 text-indigo-400'
    : 'bg-emerald-500/20 text-emerald-400'

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-all duration-150 ${
        isActive
          ? 'bg-[var(--accent-light)] text-[var(--text-primary)]'
          : 'hover:bg-[var(--sidebar-hover)] text-[var(--text-secondary)]'
      }`}
    >
      <span className="flex-1 truncate text-xs leading-5">{conversation.title}</span>
      <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-medium ${modeColor}`}>
        {isTheory ? '理' : '技'}
      </span>
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
