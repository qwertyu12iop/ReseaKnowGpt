'use client'

import { useI18n } from '@/contexts/I18nContext'
import type { Paper } from '@/types/paper'

interface PaperCardProps {
  paper: Paper
  onOpenSummary: (paper: Paper) => void
}

function formatCitations(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function PaperCard({ paper, onOpenSummary }: PaperCardProps) {
  const { t, locale } = useI18n()
  const authorsText = paper.authors.slice(0, 3).join(', ')
  const moreAuthors = paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : ''
  const targetUrl = paper.pdfUrl ?? paper.url

  return (
    <div className="group flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)] transition-all duration-200">
      <div className="flex items-start gap-2 mb-2">
        <h3 className="flex-1 text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
          {paper.title}
        </h3>
        <span
          className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${
            paper.source === 'arxiv'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
          }`}
        >
          {paper.source === 'arxiv' ? 'arXiv' : 'OpenAlex'}
        </span>
      </div>

      <p className="text-xs text-[var(--text-muted)] mb-2 line-clamp-1">
        {authorsText}
        {moreAuthors}
        {paper.venue ? ` · ${paper.venue}` : ''}
        {paper.year ? ` · ${paper.year}` : ''}
      </p>

      {paper.abstract && (
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-3">
          {paper.abstract}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap mt-auto">
        {paper.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-[10px] bg-[var(--input-bg)] text-[var(--text-muted)] border border-[var(--border-color)]"
          >
            {tag}
          </span>
        ))}
        {paper.citedByCount > 0 && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {formatCitations(paper.citedByCount)} {locale === 'zh' ? '引用' : 'cites'}
          </span>
        )}
        {paper.isOpenAccess && (
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {locale === 'zh' ? '开放获取' : 'OA'}
          </span>
        )}

        <div className="ml-auto flex gap-1.5">
          <button
            onClick={() => onOpenSummary(paper)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
            title={t('literature.ai_summary')}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l2.09 5.26L20 8l-4 4 1.18 6-5.18-3-5.18 3L8 12 4 8l5.91-.74z" />
            </svg>
            {t('literature.ai_summary')}
          </button>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {t('literature.read_original')}
          </a>
        </div>
      </div>
    </div>
  )
}
