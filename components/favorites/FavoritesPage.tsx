'use client'

import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import type { FavoriteEntry, FavoriteItemType } from '@/types/favorite'
import { FavoriteCard } from './favorite-card'

type TabKey = 'all' | FavoriteItemType

/** 始终展示；工坊收藏无前端入口时多为 0，有数据再显示对应 Tab */
const BASE_TABS: Array<{ key: TabKey; labelKey: string }> = [
  { key: 'all', labelKey: 'favorites.tab.all' },
  { key: 'paper_catalog', labelKey: 'favorites.tab.paper' },
  { key: 'conversation', labelKey: 'favorites.tab.conversation' },
]

export default function FavoritesPage() {
  const { t, locale } = useI18n()
  const { user, setShowAuthModal } = useAuth()
  const { entries, loading, error, toggle, refresh } = useFavorites()
  const [tab, setTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return entries.filter((entry) => {
      if (tab !== 'all' && entry.itemType !== tab) return false
      if (!kw) return true
      const title =
        entry.detail && 'title' in entry.detail ? entry.detail.title.toLowerCase() : ''
      const note = (entry.note ?? '').toLowerCase()
      return title.includes(kw) || note.includes(kw)
    })
  }, [entries, tab, search])

  const counts = useMemo(() => {
    const base: Record<TabKey, number> = {
      all: entries.length,
      paper_catalog: 0,
      conversation: 0,
      workshop_tool: 0,
    }
    for (const e of entries) {
      base[e.itemType] = (base[e.itemType] ?? 0) + 1
    }
    return base
  }, [entries])

  const visibleTabs = useMemo(() => {
    const tabs = [...BASE_TABS]
    if (counts.workshop_tool > 0) {
      tabs.push({ key: 'workshop_tool', labelKey: 'favorites.tab.workshop' })
    }
    return tabs
  }, [counts.workshop_tool])

  useEffect(() => {
    if (tab === 'workshop_tool' && counts.workshop_tool === 0) setTab('all')
  }, [tab, counts.workshop_tool])

  const handleRemove = async (entry: FavoriteEntry) => {
    const ok = window.confirm(t('favorites.delete_confirm'))
    if (!ok) return
    await toggle(entry.itemType, entry.itemId)
  }

  if (!user) {
    return (
      <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
        <UnauthState onSignIn={() => setShowAuthModal(true)} />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--chat-surface)] to-[var(--chat-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow shadow-pink-500/20">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {t('favorites.title')}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">{t('favorites.subtitle')}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/25">
              {t('favorites.count').replace('{count}', String(entries.length))}
            </span>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('favorites.search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {visibleTabs.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  tab === item.key
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--chat-surface)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
              >
                {t(item.labelKey as Parameters<typeof t>[0])}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    tab === item.key
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--border-color)]/50 text-[var(--text-muted)]'
                  }`}
                >
                  {counts[item.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {error && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            <span>
              {t('favorites.load_failed')} · {error}
            </span>
            <button
              onClick={refresh}
              className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors"
            >
              {locale === 'zh' ? '重试' : 'Retry'}
            </button>
          </div>
        )}

        {loading && entries.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-40 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((entry) => (
              <FavoriteCard key={entry.id} entry={entry} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  const { t } = useI18n()
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-color)] px-6 py-16 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-[var(--input-bg)] flex items-center justify-center mb-3">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--text-muted)]"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-1">{t('favorites.empty.title')}</p>
      <p className="text-xs text-[var(--text-muted)]">{t('favorites.empty.desc')}</p>
    </div>
  )
}

function UnauthState({ onSignIn }: { onSignIn: () => void }) {
  const { t } = useI18n()
  return (
    <div className="h-full flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/20">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1">
          {t('favorites.unauth.title')}
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">{t('favorites.unauth.desc')}</p>
        <button
          onClick={onSignIn}
          className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          {t('auth.login')}
        </button>
      </div>
    </div>
  )
}
