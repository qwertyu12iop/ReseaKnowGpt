'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { fetchPaperSummary } from '@/services/papers'
import type { Paper, PaperSummary } from '@/types/paper'

interface PaperSummaryModalProps {
  paper: Paper | null
  onClose: () => void
}

export function PaperSummaryModal({ paper, onClose }: PaperSummaryModalProps) {
  const { t, locale } = useI18n()
  const [summary, setSummary] = useState<PaperSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paperId = paper?.id ?? null
  useEffect(() => {
    if (paperId == null) return
    const controller = new AbortController()
    let cancelled = false

    setSummary(null)

    setError(null)

    setLoading(true)
    const run = async () => {
      try {
        const s = await fetchPaperSummary(paperId, controller.signal)
        if (!cancelled) setSummary(s)
      } catch (err) {
        if (cancelled || controller.signal.aborted) return
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [paperId])

  useEffect(() => {
    if (!paper) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [paper, onClose])

  if (!paper) return null

  const targetUrl = paper.pdfUrl ?? paper.url

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--modal-bg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-6 py-5 border-b border-[var(--border-color)]">
          <div className="w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l2.09 5.26L20 8l-4 4 1.18 6-5.18-3-5.18 3L8 12 4 8l5.91-.74z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-medium text-[var(--accent)] mb-0.5">
              {t('literature.ai_summary')}
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
              {paper.authors.slice(0, 3).join(', ')}
              {paper.venue ? ` · ${paper.venue}` : ''}
              {paper.year ? ` · ${paper.year}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--input-bg)] transition-colors"
            aria-label="close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border-color)] border-t-[var(--accent)] animate-spin" />
              <p className="text-xs text-[var(--text-muted)]">{t('literature.summary_loading')}</p>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {summary && !loading && (
            <>
              <section>
                <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  {t('literature.summary_overview')}
                </h4>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {summary.summaryZh ?? summary.summaryEn}
                </p>
              </section>

              {summary.keyPoints.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    {t('literature.summary_keypoints')}
                  </h4>
                  <ul className="space-y-2.5">
                    {summary.keyPoints.map((kp, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-4 py-3"
                      >
                        <div className="text-xs font-semibold text-[var(--accent)] mb-1">
                          {kp.title}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {kp.content}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {paper.abstract && (
                <section>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    {t('literature.summary_abstract')}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {paper.abstract}
                  </p>
                </section>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex items-center justify-between gap-3">
          <span className="text-[10px] text-[var(--text-muted)]">
            {summary?.model ? `${t('literature.generated_by')} · ${summary.model}` : '\u00A0'}
          </span>
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            <svg
              width="12"
              height="12"
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
            {locale === 'zh' ? '查看原文' : 'Read Original'}
          </a>
        </div>
      </div>
    </div>
  )
}
