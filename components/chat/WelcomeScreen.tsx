'use client'

import { ChatMode } from '@/types/chat'
import { useI18n } from '@/contexts/I18nContext'

interface WelcomeScreenProps {
  mode: ChatMode
  onPromptClick: (prompt: string) => void
}

const PROMPTS = {
  theory: {
    zh: [
      '解释操作系统中的虚拟内存机制',
      '什么是 CAP 定理？在分布式系统中如何权衡？',
      'Transformer 架构的自注意力机制原理',
      '红黑树的插入与删除如何保持平衡？',
    ],
    en: [
      'Explain virtual memory in operating systems',
      'What is CAP theorem and how to make trade-offs?',
      'How does self-attention work in Transformer?',
      'How does a red-black tree maintain balance on insert/delete?',
    ],
  },
  technical: {
    zh: [
      'React 18 并发渲染与 Suspense 的使用方式',
      'Docker 容器网络模式详解与最佳实践',
      'PostgreSQL 索引优化策略与执行计划分析',
      'Kubernetes Pod 调度机制与亲和性配置',
    ],
    en: [
      'React 18 concurrent rendering and Suspense usage',
      'Docker network modes explained with best practices',
      'PostgreSQL index optimization and query plan analysis',
      'Kubernetes Pod scheduling and affinity configuration',
    ],
  },
}

export default function WelcomeScreen({ mode, onPromptClick }: WelcomeScreenProps) {
  const { t, locale } = useI18n()
  const isTheory = mode === 'theory'
  const prompts = PROMPTS[mode][locale]

  return (
    <div className="relative flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      {/* Logo with animated glow */}
      <div className="relative mb-6">
        <div
          aria-hidden
          className="absolute inset-0 -m-6 rounded-full blur-2xl opacity-70 animate-blob"
          style={{
            background: isTheory
              ? 'radial-gradient(closest-side, rgba(129,140,248,0.55), transparent 70%)'
              : 'radial-gradient(closest-side, rgba(52,211,153,0.45), transparent 70%)',
          }}
        />
        <div className="relative w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-xl shadow-indigo-500/40 ring-1 ring-white/15">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        <span className="brand-gradient-text">{t('chat.welcome.title')}</span>
      </h1>
      <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-3">
        {t('chat.welcome.subtitle')}
      </p>

      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8 ring-1 ${
          isTheory
            ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/15 text-indigo-300 ring-indigo-400/30'
            : 'bg-gradient-to-r from-emerald-500/15 to-teal-500/15 text-emerald-300 ring-emerald-400/30'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isTheory ? 'bg-indigo-400' : 'bg-emerald-400'} animate-pulse`}
        />
        {isTheory ? t('chat.welcome.theory_mode') : t('chat.welcome.technical_mode')}
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className={`text-left px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-all duration-200 group card-hover-ring hover:bg-[var(--card-hover)] ${
              isTheory
                ? 'hover:border-indigo-400/40 hover:shadow-[0_8px_24px_-12px_rgba(99,102,241,0.4)]'
                : 'hover:border-emerald-400/40 hover:shadow-[0_8px_24px_-12px_rgba(16,185,129,0.4)]'
            }`}
          >
            <span className="line-clamp-2 leading-relaxed">{prompt}</span>
            <span
              className={`block text-[11px] mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isTheory ? 'text-indigo-400' : 'text-emerald-400'}`}
            >
              {t('chat.click_to_ask')} →
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
