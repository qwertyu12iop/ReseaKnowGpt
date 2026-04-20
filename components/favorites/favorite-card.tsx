'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import type { FavoriteEntry } from '@/types/favorite'

interface FavoriteCardProps {
  entry: FavoriteEntry
  onRemove: (entry: FavoriteEntry) => void
}

function formatDate(iso: string, locale: string): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

export function FavoriteCard({ entry, onRemove }: FavoriteCardProps) {
  const { t, locale } = useI18n()
  const detail = entry.detail

  const typeLabel = (() => {
    switch (entry.itemType) {
      case 'paper_catalog':
        return t('favorites.type.paper')
      case 'conversation':
        return t('favorites.type.conversation')
      case 'workshop_tool':
        return t('favorites.type.workshop')
    }
  })()

  const typeColor = (() => {
    switch (entry.itemType) {
      case 'paper_catalog':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25'
      case 'conversation':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
      case 'workshop_tool':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/25'
    }
  })()

  const title =
    detail?.kind === 'workshop_tool'
      ? detail.title
      : detail && 'title' in detail
        ? detail.title
        : locale === 'zh'
          ? '内容已删除或不可访问'
          : 'Content missing or inaccessible'

  return (
    <div className="group flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] transition-all duration-200">
      <div className="flex items-start gap-2 mb-2">
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeColor}`}
        >
          {typeLabel}
        </span>
        <h3 className="flex-1 text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {title}
        </h3>
        <button
          onClick={() => onRemove(entry)}
          title={t('favorites.remove')}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label={t('favorites.remove')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {detail?.kind === 'paper_catalog' && <PaperBody detail={detail} />}
      {detail?.kind === 'conversation' && <ConversationBody detail={detail} />}

      <div className="flex items-center gap-2 flex-wrap mt-auto pt-3">
        <span className="text-[10px] text-[var(--text-muted)]">
          {t('favorites.added_at')} · {formatDate(entry.createdAt, locale)}
        </span>
        {entry.note && (
          <span className="ml-1 px-2 py-0.5 rounded text-[10px] bg-[var(--input-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] line-clamp-1">
            {entry.note}
          </span>
        )}

        <div className="ml-auto flex gap-1.5">
          {detail?.kind === 'paper_catalog' && (
            <a
              href={detail.pdfUrl ?? detail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
            >
              {t('favorites.view_original')}
            </a>
          )}
          {detail?.kind === 'conversation' && (
            <Link
              href="/chat"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            >
              {t('favorites.open_chat')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function PaperBody({
  detail,
}: {
  detail: Extract<FavoriteEntry['detail'], { kind: 'paper_catalog' }>
}) {
  const { locale } = useI18n()
  const authorsText = detail.authors.slice(0, 3).join(', ')
  const moreAuthors = detail.authors.length > 3 ? ` +${detail.authors.length - 3}` : ''
  return (
    <>
      <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-1">
        {authorsText}
        {moreAuthors}
        {detail.venue ? ` · ${detail.venue}` : ''}
        {detail.year ? ` · ${detail.year}` : ''}
      </p>
      {detail.abstract && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
          {detail.abstract}
        </p>
      )}
      <div className="flex items-center gap-1.5 flex-wrap mt-3">
        {detail.citedByCount > 0 && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {formatCitations(detail.citedByCount)} {locale === 'zh' ? '引用' : 'cites'}
          </span>
        )}
        {detail.isOpenAccess && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {locale === 'zh' ? '开放获取' : 'OA'}
          </span>
        )}
        {detail.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-[10px] bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  )
}

function ConversationBody({
  detail,
}: {
  detail: Extract<FavoriteEntry['detail'], { kind: 'conversation' }>
}) {
  const { t, locale } = useI18n()
  return (
    <p className="text-xs text-[var(--text-muted)]">
      <span className="px-1.5 py-0.5 rounded bg-[var(--input-bg)] border border-[var(--border-color)] mr-2">
        {detail.mode === 'theory' ? t('mode.theory.badge') : t('mode.technical.badge')}
      </span>
      {locale === 'zh' ? '更新于' : 'Updated'} · {formatDate(detail.updatedAt, locale)}
    </p>
  )
}

function formatCitations(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
