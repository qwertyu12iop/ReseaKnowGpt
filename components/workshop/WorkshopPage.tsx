'use client'

import { useI18n } from '@/contexts/I18nContext'
import Link from 'next/link'

const TOOLS = [
  {
    id: 'generate',
    href: '/workshop/code-generate',
    available: true,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/20',
    steps: [
      '描述需求 / Describe requirement',
      '选择语言 / Choose language',
      '生成代码 / Generate code',
      '复制使用 / Copy & use',
    ],
  },
  {
    id: 'language',
    href: '/workshop/language-switch',
    available: true,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/20',
    steps: [
      '选择语言 / Select language',
      '确认切换 / Confirm switch',
      '应用界面 / Apply interface',
    ],
  },
]

const LANGUAGES = [
  { name: 'Python', color: 'text-blue-500' },
  { name: 'TypeScript', color: 'text-blue-400' },
  { name: 'Java', color: 'text-red-500' },
  { name: 'C++', color: 'text-indigo-500' },
  { name: 'Go', color: 'text-cyan-500' },
  { name: 'Rust', color: 'text-orange-600' },
  { name: 'LaTeX', color: 'text-emerald-500' },
  { name: 'SQL', color: 'text-amber-500' },
]

export default function WorkshopPage() {
  const { t, locale } = useI18n()

  const toolLabels: Record<string, string> = {
    generate: t('workshop.generate'),
    language: t('workshop.language'),
  }

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[var(--chat-surface)] via-[var(--chat-bg)] to-[var(--chat-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-4 ring-white/10 shrink-0 transform hover:rotate-3 transition-transform duration-300">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
                <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  {t('workshop.title')}
                </h1>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                  {t('common.new_badge')}
                </span>
              </div>
              <p className="text-base text-[var(--text-secondary)] mt-2 font-medium max-w-2xl">{t('workshop.subtitle')}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 px-3 py-1.5 rounded-full bg-[var(--chat-surface)] border border-[var(--border-color)] w-fit mx-auto sm:mx-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-sm">
                  <span className="text-[10px] font-black text-white">C</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('workshop.coze_powered')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6 text-center sm:text-left">
          {locale === 'zh' ? '核心工作流' : 'Core Workflows'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TOOLS.map((tool) => {
            const inner = (
              <>
                {/* Gradient blob */}
                <div
                  className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-md ${tool.shadowColor}`}
                  >
                    {tool.icon}
                  </div>
                  {tool.available ? (
                    <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      {t('workshop.try_now')}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {t('workshop.coming_soon')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  {toolLabels[tool.id]}
                </h3>

                {/* Steps */}
                <div className="flex items-center gap-0 mt-3 overflow-x-auto">
                  {tool.steps.map((step, i) => (
                    <div key={i} className="flex items-center shrink-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white text-[10px] font-bold opacity-80`}
                        >
                          {i + 1}
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 text-center max-w-[64px] leading-tight">
                          {locale === 'zh' ? step.split(' / ')[0] : step.split(' / ')[1]}
                        </p>
                      </div>
                      {i < tool.steps.length - 1 && (
                        <div className="w-6 h-px bg-[var(--border-color)] mx-1 shrink-0 mb-6" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action */}
                {tool.available ? (
                  <div className="mt-4 w-full py-2 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-[var(--accent)]/20 text-xs text-[var(--accent)] font-medium text-center group-hover:from-indigo-500/15 group-hover:to-purple-500/15 transition-all duration-200">
                    {t('workshop.try_now')} →
                  </div>
                ) : (
                  <div className="mt-4 w-full py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] opacity-60 text-center">
                    {t('common.coming_soon')}
                  </div>
                )}
              </>
            )

            if (tool.available) {
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 overflow-hidden hover:border-[var(--accent)]/30 transition-all duration-200 card-hover-ring block"
                >
                  {inner}
                </Link>
              )
            }

            return (
              <div
                key={tool.id}
                className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 overflow-hidden"
              >
                {inner}
              </div>
            )
          })}
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 pt-12 border-t border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] text-center mb-10">
            {t('workshop.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                {t('workshop.features.quality.title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
                {t('workshop.features.quality.desc')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                {t('workshop.features.workflow.title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
                {t('workshop.features.workflow.desc')}
              </p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                {t('workshop.features.logic.title')}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed px-4">
                {t('workshop.features.logic.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Supported Languages */}
        <div className="mt-20 text-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            {t('workshop.languages.title')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">{t('workshop.languages.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {LANGUAGES.map((lang) => (
              <span
                key={lang.name}
                className={`px-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-xs font-medium ${lang.color} shadow-sm hover:shadow-md transition-shadow cursor-default`}
              >
                {lang.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
