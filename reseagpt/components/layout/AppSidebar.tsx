'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationItem from '@/components/sidebar/ConversationItem';

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
  badge?: 'new' | 'soon';
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'nav.chat',
    href: '/chat',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    key: 'nav.literature',
    href: '/literature',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    badge: 'soon',
  },
  {
    key: 'nav.workshop',
    href: '/workshop',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    badge: 'new',
  },
  {
    key: 'nav.favorites',
    href: '#',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    badge: 'soon',
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { theme, setTheme } = useTheme();
  const { conversations, activeConversationId, setActiveConversationId, deleteConversation, newChat } = useConversation();

  const isChat = pathname === '/chat';

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          w-60 bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow shadow-indigo-500/30">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">{t('app.name')}</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">{t('app.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="px-2 py-3 border-b border-[var(--border-color)]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href !== '#' && pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => { if (item.href !== '#') onClose(); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span className={isActive ? 'text-[var(--accent)]' : ''}>{item.icon}</span>
                <span className="flex-1">{t(item.key as Parameters<typeof t>[0])}</span>
                {item.badge === 'new' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                    {t('common.new_badge')}
                  </span>
                )}
                {item.badge === 'soon' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] text-[var(--text-muted)] border border-[var(--border-color)] uppercase tracking-wide">
                    β
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Chat history (only on /chat) */}
        {isChat && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {t('nav.chat')}
              </span>
              <button
                onClick={() => { newChat(); }}
                title={t('chat.new')}
                className="text-[var(--text-muted)] hover:text-[var(--accent)] p-1 rounded transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {conversations.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] text-xs mt-6 px-2">{t('chat.empty')}</p>
              ) : (
                groupByDate(conversations, t).map(({ label, items }) => (
                  <div key={label} className="mb-3">
                    <p className="px-2 py-1 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
                    <div className="flex flex-col gap-0.5">
                      {items.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={conv.id === activeConversationId}
                          onClick={() => { setActiveConversationId(conv.id); onClose(); }}
                          onDelete={deleteConversation}
                          deleteLabel={t('chat.delete')}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {!isChat && <div className="flex-1" />}

        {/* Bottom: Profile + Settings + Theme + Lang */}
        <div className="border-t border-[var(--border-color)] p-2 space-y-0.5">
          <Link
            href="/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              pathname === '/profile'
                ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
            }`}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <span>{t('nav.profile')}</span>
          </Link>

          <ThemeAndLangRow theme={theme} setTheme={setTheme} />
        </div>
      </aside>
    </>
  );
}

function ThemeAndLangRow({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: 'dark' | 'light') => void;
}) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={t('theme.toggle')}
        className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-all duration-150"
      >
        {theme === 'dark' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span>{t('theme.light')}</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
            <span>{t('theme.dark')}</span>
          </>
        )}
      </button>

      <div className="w-px h-5 bg-[var(--border-color)]" />

      {/* Language toggle */}
      <button
        onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
        title={t('lang.toggle')}
        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-all duration-150 font-medium"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        {locale === 'zh' ? 'EN' : '中'}
      </button>
    </div>
  );
}

import { Conversation } from '@/types/chat';
import { TranslationKey } from '@/contexts/I18nContext';

function groupByDate(
  conversations: Conversation[],
  t: (key: TranslationKey) => string
): { label: string; items: Conversation[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {};
  const order = [t('chat.today'), t('chat.yesterday'), t('chat.last7days'), t('chat.earlier')];

  for (const conv of [...conversations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )) {
    const d = new Date(conv.createdAt.getFullYear(), conv.createdAt.getMonth(), conv.createdAt.getDate());
    let label: string;
    if (d >= today) label = t('chat.today');
    else if (d >= yesterday) label = t('chat.yesterday');
    else if (d >= lastWeek) label = t('chat.last7days');
    else label = t('chat.earlier');

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return order.filter((l) => groups[l]).map((l) => ({ label: l, items: groups[l] }));
}
