'use client';

import { useI18n } from '@/contexts/I18nContext';
import { useConversation } from '@/contexts/ConversationContext';

const INTERESTS = ['Python', 'React', 'Rust', 'Linux', 'ML/DL', 'Distributed Systems', 'Algorithms', 'Security'];

const LEARNING_PROGRESS = [
  { label: '数据结构与算法', en: 'Data Structures & Algorithms', progress: 72, color: 'bg-indigo-500' },
  { label: '操作系统原理', en: 'Operating Systems', progress: 58, color: 'bg-purple-500' },
  { label: '计算机网络', en: 'Computer Networks', progress: 45, color: 'bg-blue-500' },
  { label: '机器学习', en: 'Machine Learning', progress: 63, color: 'bg-emerald-500' },
];

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const { conversations } = useConversation();

  const theoryCount = conversations.filter((c) => c.mode === 'theory').length;
  const technicalCount = conversations.filter((c) => c.mode === 'technical').length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  const stats = [
    { label: t('profile.stats.chats'), value: conversations.length, icon: '💬', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: t('profile.stats.theory'), value: theoryCount, icon: '📚', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: t('profile.stats.technical'), value: technicalCount, icon: '⚡', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: t('profile.stats.saved'), value: totalMessages, icon: '⭐', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[var(--chat-bg)]">
      {/* Banner */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: `${80 + i * 40}px`,
                height: `${80 + i * 40}px`,
                top: `${-20 + i * 10}%`,
                left: `${-5 + i * 18}%`,
                opacity: 0.3 - i * 0.04,
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-4 border-[var(--chat-bg)] bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
            CS
          </div>
          <div className="pb-1">
            <h1 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow">计算机学院</h1>
            <p className="text-white/75 text-xs sm:text-sm">
              {locale === 'zh' ? '计算机科学与技术 · 研究生' : 'Computer Science · Graduate'}
            </p>
          </div>
        </div>
        <button className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-medium backdrop-blur-sm transition-all border border-white/20">
          {t('profile.edit')}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-[var(--border-color)]`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Learning Progress */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {t('profile.learning')}
          </h2>
          <div className="space-y-4">
            {LEARNING_PROGRESS.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-[var(--text-secondary)]">
                    {locale === 'zh' ? item.label : item.en}
                  </span>
                  <span className="text-xs font-medium text-[var(--text-muted)]">{item.progress}%</span>
                </div>
                <div className="h-1.5 bg-[var(--input-bg)] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            {t('profile.interests')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent-light)] text-[var(--accent)] border border-[var(--accent)]/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Recent conversations */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {t('profile.recent')}
          </h2>
          {conversations.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-4 text-center">{t('profile.no_activity')}</p>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 5).map((conv) => (
                <div key={conv.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--card-hover)] transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${conv.mode === 'theory' ? 'bg-indigo-400' : 'bg-emerald-400'}`} />
                  <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">{conv.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    conv.mode === 'theory' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {conv.mode === 'theory' ? t('mode.theory.badge') : t('mode.technical.badge')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
