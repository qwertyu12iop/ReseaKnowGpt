'use client';

import { ChatMode } from '@/types/chat';
import { useI18n } from '@/contexts/I18nContext';

interface WelcomeScreenProps {
  mode: ChatMode;
  onPromptClick: (prompt: string) => void;
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
};

export default function WelcomeScreen({ mode, onPromptClick }: WelcomeScreenProps) {
  const { t, locale } = useI18n();
  const isTheory = mode === 'theory';
  const prompts = PROMPTS[mode][locale];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-[var(--shadow-accent)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">
        {t('chat.welcome.title')}
      </h1>
      <p className="text-[var(--text-secondary)] text-sm sm:text-base mb-3">
        {t('chat.welcome.subtitle')}
      </p>

      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8 ${
        isTheory
          ? 'bg-indigo-500/12 text-indigo-400 border border-indigo-500/25'
          : 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {isTheory ? t('chat.welcome.theory_mode') : t('chat.welcome.technical_mode')}
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="text-left px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] hover:border-[var(--accent)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-all duration-200 group"
          >
            <span className="line-clamp-2 leading-relaxed">{prompt}</span>
            <span className={`block text-[11px] mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isTheory ? 'text-indigo-400' : 'text-emerald-400'}`}>
              {t('chat.click_to_ask')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
