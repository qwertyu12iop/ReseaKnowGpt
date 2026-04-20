'use client'

import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import type { Source } from '@/types/chat'

interface MessageSourcesProps {
  sources?: Source[]
  loading?: boolean
}

const PREVIEW_COUNT = 3

export default function MessageSources({ sources, loading }: MessageSourcesProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="inline-block w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        {t('chat.sources.searching')}
      </div>
    )
  }

  if (!sources || sources.length === 0) return null

  const visible = expanded ? sources : sources.slice(0, PREVIEW_COUNT)
  const hasMore = sources.length > PREVIEW_COUNT

  return (
    <div className="mt-4 pt-3 border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 016.5 2H20v20H6.5a2.5 2.5 0 010-5H20" />
          </svg>
          {t('chat.sources.title')} · {sources.length}
        </div>
        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            {expanded ? t('chat.sources.collapse') : t('chat.sources.expand')}
          </button>
        )}
      </div>

      <ol className="flex flex-col gap-1.5">
        {visible.map((src, i) => (
          <li key={src.id} className="flex gap-2 text-xs">
            <span className="shrink-0 mt-0.5 w-5 h-5 inline-flex items-center justify-center rounded bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[10px]">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors leading-snug line-clamp-2"
                title={src.title}
              >
                {src.title}
              </a>
              <div className="mt-0.5 text-[11px] text-[var(--text-muted)] flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                {src.authors.length > 0 && (
                  <span className="truncate max-w-[280px]">
                    {src.authors.slice(0, 3).join(', ')}
                    {src.authors.length > 3 && ' et al.'}
                  </span>
                )}
                {src.year && <span>· {src.year}</span>}
                {src.venue && (
                  <span className="truncate max-w-[200px]" title={src.venue}>
                    · {src.venue}
                  </span>
                )}
                {typeof src.citedByCount === 'number' && src.citedByCount > 0 && (
                  <span>
                    · {src.citedByCount.toLocaleString()} {t('chat.sources.citations')}
                  </span>
                )}
                {src.isOpenAccess && (
                  <span className="px-1 py-px rounded bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/25 text-[10px]">
                    OA
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-2 text-[10px] text-[var(--text-muted)]">{t('chat.sources.hint')}</p>
    </div>
  )
}
