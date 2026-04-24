'use client'

import { useState, useCallback, useRef, ReactNode } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import Link from 'next/link'

export const LANGUAGES = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'typescript', label: 'TypeScript', icon: 'TS' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'c', label: 'C', icon: 'C' },
  { value: 'go', label: 'Go', icon: '🔷' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'sql', label: 'SQL', icon: '🗃️' },
  { value: 'html', label: 'HTML/CSS', icon: '🌐' },
]

export interface HistoryItem {
  lang: string
  input: string
  output: string
  timestamp: number
}

interface WorkshopToolBaseProps {
  title: string
  desc: string
  gradient: string
  shadowColor: string
  icon: ReactNode
  langLabel: string
  inputLabel: string
  inputPlaceholder: string
  submitText: string
  switchingText: string
  resultTitle: string
  copyText: string
  copiedText: string
  emptyText: string
  clearText: string
  historyText: string
  maxLines?: number
  onSubmit: (lang: string, input: string) => Promise<void>
  history: HistoryItem[]
  loading: boolean
  output: string
  error: string
  copied: boolean
}

export default function WorkshopToolBase({
  title,
  desc,
  gradient,
  shadowColor,
  icon,
  langLabel,
  inputLabel,
  inputPlaceholder,
  submitText,
  switchingText,
  resultTitle,
  copyText,
  copiedText,
  emptyText,
  clearText,
  historyText,
  maxLines = 0,
  onSubmit,
  history,
  loading,
  output,
  error,
  copied,
}: WorkshopToolBaseProps) {
  const { t, locale } = useI18n()
  const [lang, setLang] = useState('')
  const [input, setInput] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [inputError, setInputError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInputChange = useCallback(
    (value: string) => {
      if (maxLines && maxLines > 0) {
        const lines = value.split('\n').length
        if (lines > maxLines) {
          setInputError(
            locale === 'zh'
              ? `代码最多 ${maxLines} 行`
              : `Maximum ${maxLines} lines`
          )
          return
        }
      }
      setInputError('')
      setInput(value)
    },
    [maxLines, locale]
  )

  const handleSubmit = useCallback(async () => {
    if (!lang || !input.trim()) return
    await onSubmit(lang, input.trim())
  }, [lang, input, onSubmit])

  const handleCopy = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      /* clipboard not available */
    }
  }, [output])

  const handleClear = useCallback(() => {
    setLang('')
    setInput('')
    setInputError('')
    textareaRef.current?.focus()
  }, [])

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setLang(item.lang)
    setInput(item.input)
    setShowHistory(false)
  }, [])

  const selectedLangLabel = LANGUAGES.find((l) => l.value === lang)?.label ?? ''
  const lineCount = input.split('\n').length

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[var(--border-color)] bg-[var(--chat-bg)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center gap-4">
          <Link
            href="/workshop"
            className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t('workshop.back_to_workshop')}
          </Link>
          <div className="h-4 w-px bg-[var(--border-color)]" />
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md ${shadowColor}`}
            >
              {icon}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[var(--text-primary)]">
                {title}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                {desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-12rem)]">
          {/* Left: Input Panel */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 flex flex-col gap-5">
              {/* Language Select */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                  {langLabel}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => !loading && setLang(l.value)}
                      disabled={loading}
                      className={`group relative flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg border transition-all duration-200 ${
                        lang === l.value
                          ? 'border-[var(--accent)] bg-[var(--accent-light)] shadow-sm shadow-[var(--shadow-accent)]'
                          : loading
                            ? 'border-[var(--border-color)] opacity-50 cursor-not-allowed'
                            : 'border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--card-hover)]'
                      }`}
                    >
                      <span className="text-base leading-none">{l.icon}</span>
                      <span
                        className={`text-[10px] font-medium transition-colors ${
                          lang === l.value
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                    {inputLabel}
                  </label>
                  {maxLines > 0 && (
                    <span
                      className={`text-[10px] font-mono ${
                        lineCount > maxLines
                          ? 'text-red-400'
                          : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {lineCount}/{maxLines}
                    </span>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={inputPlaceholder}
                  rows={8}
                  disabled={loading}
                  className={`flex-1 w-full rounded-lg border bg-[var(--input-bg)] px-4 py-3 text-sm text-[var(--text-primary)] font-mono placeholder:text-[var(--text-muted)] focus:ring-1 transition-all duration-200 min-h-[120px] resize-none ${
                    inputError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-[var(--border-color)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/30'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                />
                {inputError && (
                  <p className="text-[10px] text-red-400 mt-1">{inputError}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={!lang || !input.trim() || !!inputError || loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-white text-sm font-medium shadow-md transition-all duration-200 active:scale-[0.98] bg-gradient-to-r ${
                    gradient.includes('indigo')
                      ? 'from-indigo-500 to-purple-600 shadow-indigo-500/25 hover:shadow-indigo-500/30'
                      : 'from-amber-500 to-orange-600 shadow-amber-500/25 hover:shadow-amber-500/30'
                  } disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {switchingText}
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      {submitText}
                    </>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  disabled={loading}
                  className="py-2.5 px-4 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {clearText}
                </button>
                {history.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    disabled={loading}
                    className={`py-2.5 px-4 rounded-lg border text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      showHistory
                        ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </button>
                )}
              </div>

              <p className="text-[10px] text-[var(--text-muted)] text-center">
                Ctrl/⌘ + Enter
              </p>
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 animate-fade-up">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  {historyText}
                </h3>
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => loadFromHistory(item)}
                      className="text-left p-3 rounded-lg border border-[var(--border-color)] hover:border-[var(--border-strong)] hover:bg-[var(--card-hover)] transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--accent-light)] text-[var(--accent)]">
                          {item.lang}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate font-mono">
                        {item.input.slice(0, 50)}...
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Result Panel */}
          <div className="flex flex-col">
            <div className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden flex flex-col">
              {/* Result header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--chat-surface)]/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    {resultTitle}
                  </span>
                  {selectedLangLabel && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--accent-light)] text-[var(--accent)]">
                      {selectedLangLabel}
                    </span>
                  )}
                </div>
                {output && (
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      copied
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                        : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {copied ? (
                      <>
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
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {copiedText}
                      </>
                    ) : (
                      <>
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                        {copyText}
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Result content */}
              <div className="flex-1 overflow-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-2 border-[var(--border-color)]" />
                      <div
                        className={`absolute inset-0 rounded-full border-2 border-transparent animate-spin ${
                          gradient.includes('indigo')
                            ? 'border-t-indigo-500'
                            : 'border-t-amber-500'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                          gradient.includes('indigo')
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <span className="text-sm text-[var(--text-muted)]">
                        {switchingText}
                      </span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full gap-5 py-20 px-6 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-sm">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {locale === 'zh' ? '处理出错' : 'Error Occurred'}
                      </p>
                      <p className="text-xs text-red-400/90 text-center max-w-xs leading-relaxed">
                        {error}
                      </p>
                    </div>
                    {error && (
                      <button
                        onClick={handleSubmit}
                        className="mt-2 px-6 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-medium border border-red-500/20 transition-all duration-200"
                      >
                        {locale === 'zh' ? '重新尝试' : 'Try Again'}
                      </button>
                    )}
                  </div>
                ) : output ? (
                  <pre className="p-5 text-sm leading-relaxed font-mono text-[var(--text-primary)] whitespace-pre-wrap break-words selection:bg-[var(--accent)]/20">
                    <code>{output}</code>
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-20 px-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient.includes('indigo') ? 'from-indigo-500/10 to-purple-500/10' : 'from-amber-500/10 to-orange-500/10'} border border-[var(--border-color)] flex items-center justify-center`}
                    >
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--text-muted)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-50"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-[var(--text-muted)]">{emptyText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

