'use client';

import { useI18n } from '@/contexts/I18nContext';

const TOOLS = [
  {
    id: 'generate',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-600',
    shadowColor: 'shadow-indigo-500/20',
    steps: ['描述需求 / Describe requirement', '选择语言 / Choose language', '生成代码 / Generate code', '复制使用 / Copy & use'],
  },
  {
    id: 'debug',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    gradient: 'from-red-500 to-rose-600',
    shadowColor: 'shadow-red-500/20',
    steps: ['粘贴代码 / Paste code', '描述错误 / Describe error', 'AI 分析 / AI analysis', '获取修复 / Get fix'],
  },
  {
    id: 'review',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/20',
    steps: ['提交代码 / Submit code', '风格检查 / Style check', '最佳实践 / Best practices', '报告生成 / Report'],
  },
  {
    id: 'docs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    shadowColor: 'shadow-emerald-500/20',
    steps: ['上传代码 / Upload code', '解析结构 / Parse structure', 'AI 撰写 / AI writes', '导出文档 / Export'],
  },
];

export default function WorkshopPage() {
  const { t, locale } = useI18n();

  const toolLabels: Record<string, { zh: string; en: string }> = {
    generate: { zh: t('workshop.generate'), en: t('workshop.generate') },
    debug: { zh: t('workshop.debug'), en: t('workshop.debug') },
    review: { zh: t('workshop.review'), en: t('workshop.review') },
    docs: { zh: t('workshop.docs'), en: t('workshop.docs') },
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[var(--chat-surface)] via-[var(--chat-bg)] to-[var(--chat-bg)] border-b border-[var(--border-color)] px-4 sm:px-8 py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('workshop.title')}</h1>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 uppercase tracking-wide">
                  {t('common.new_badge')}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{t('workshop.subtitle')}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">C</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">{t('workshop.coze_powered')}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {t('workshop.coming_soon')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
          {locale === 'zh' ? '工作流工具' : 'Workflow Tools'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="group relative rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 overflow-hidden hover:border-[var(--accent)]/30 transition-all duration-200"
            >
              {/* Gradient blob */}
              <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white mb-4 shadow-md ${tool.shadowColor}`}>
                {tool.icon}
              </div>

              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                {toolLabels[tool.id][locale === 'zh' ? 'zh' : 'en']}
              </h3>

              {/* Steps */}
              <div className="flex items-center gap-0 mt-3 overflow-x-auto">
                {tool.steps.map((step, i) => (
                  <div key={i} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white text-[9px] font-bold opacity-70`}>
                        {i + 1}
                      </div>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1 text-center max-w-[52px] leading-tight">
                        {locale === 'zh' ? step.split(' / ')[0] : step.split(' / ')[1]}
                      </p>
                    </div>
                    {i < tool.steps.length - 1 && (
                      <div className="w-4 h-px bg-[var(--border-color)] mx-1 shrink-0 mb-4" />
                    )}
                  </div>
                ))}
              </div>

              {/* Coming soon button */}
              <button
                disabled
                className="mt-4 w-full py-2 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] opacity-60 cursor-not-allowed"
              >
                {t('common.coming_soon')}
              </button>
            </div>
          ))}
        </div>

        {/* Info banner */}
        <div className="mt-8 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                {locale === 'zh' ? '关于代码小工坊' : 'About Code Workshop'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {locale === 'zh'
                  ? '代码小工坊将通过 Coze 工作流深度集成专属 AI Agent，覆盖代码生成、调试、审查、文档撰写四大环节，针对计算机专业特定语言（Python/C++/Java/TypeScript）和框架进行专项优化，并与文献库联动提供引用建议。'
                  : 'Code Workshop will deeply integrate specialized AI agents via Coze workflows, covering code generation, debugging, review, and documentation — optimized for CS-specific languages (Python/C++/Java/TypeScript) with literature cross-reference suggestions.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
