'use client'

import { useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { useAuth } from '@/contexts/AuthContext'
import { usePapers } from '@/hooks/use-papers'
import { CATEGORY_CONFIGS } from '@/lib/literature/categories'
import type { Paper, PaperCategory } from '@/types/paper'
import { PaperCard } from './paper-card'
import { PaperSummaryModal } from './paper-summary-modal'

const SORT_OPTIONS: Array<{ key: 'citations' | 'year' | 'recent'; zh: string; en: string }> = [
  { key: 'citations', zh: '按引用', en: 'Citations' },
  { key: 'year', zh: '按年份', en: 'Year' },
  { key: 'recent', zh: '最新收录', en: 'Recent' },
]

export default function LiteraturePage() {
  const { t, locale } = useI18n()
  const { requireAuth } = useAuth()
  const {
    items,
    total,
    page,
    pageSize,
    loading,
    error,
    category,
    setCategory,
    search,
    setSearch,
    sort,
    setSort,
    setPage,
  } = usePapers()

  const [activePaper, setActivePaper] = useState<Paper | null>(null)

  const handleOpenSummary = (paper: Paper) => {
    if (!requireAuth()) return
    setActivePaper(paper)
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--chat-surface)] to-[var(--chat-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow shadow-blue-500/20">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[var(--text-primary)]">
                {t('literature.title')}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">{t('literature.subtitle')}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/25">
              {total} {locale === 'zh' ? '篇' : 'papers'}
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
              placeholder={t('literature.search.placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('all')}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                category === 'all'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--chat-surface)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
              }`}
            >
              {locale === 'zh' ? '全部' : 'All'}
            </button>
            {CATEGORY_CONFIGS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key as PaperCategory)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  category === cat.key
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--input-bg)] text-[var(--text-secondary)] hover:bg-[var(--chat-surface)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
                }`}
              >
                {locale === 'zh' ? cat.labelZh : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-1.5 mt-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  sort === opt.key
                    ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {locale === 'zh' ? opt.zh : opt.en}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-40 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((paper) => (
                <PaperCard key={paper.id} paper={paper} onOpenSummary={handleOpenSummary} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {locale === 'zh' ? '上一页' : 'Previous'}
                </button>
                <span className="text-xs text-[var(--text-muted)] px-2">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {locale === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <PaperSummaryModal paper={activePaper} onClose={() => setActivePaper(null)} />
    </div>
  )
}

function EmptyState() {
  const { locale } = useI18n()
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-color)] px-6 py-16 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-[var(--input-bg)] flex items-center justify-center mb-3">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--text-muted)]"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-1">
        {locale === 'zh' ? '文献库暂无数据' : 'No papers yet'}
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        {locale === 'zh'
          ? '调用 /api/papers/crawl 触发爬取，或切换其他分类'
          : 'Run /api/papers/crawl to populate, or pick another category'}
      </p>
    </div>
  )
}
