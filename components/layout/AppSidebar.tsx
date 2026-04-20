'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useConversation } from '@/contexts/ConversationContext'
import ConversationItem from './ConversationItem'

interface NavItem {
  key: string
  href: string
  icon: React.ReactNode
  badge?: 'new' | 'soon'
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'nav.chat',
    href: '/chat',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    key: 'nav.literature',
    href: '/literature',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    badge: 'new',
  },
  {
    key: 'nav.favorites',
    href: '/favorites',
    icon: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
]

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname()
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()
  const {
    conversations,
    activeConversationId,
    isFetchingConversations,
    setActiveConversationId,
    deleteConversation,
    newChat,
  } = useConversation()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          w-60 border-r border-[var(--border-color)]
          bg-[var(--sidebar-bg)]
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:z-auto md:shrink-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundImage: 'var(--sidebar-gradient)',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* soft top glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-10 w-60 h-48 rounded-full blur-3xl opacity-50"
          style={{
            background:
              'radial-gradient(closest-side, rgba(129,140,248,0.35), transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative shrink-0 flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
          <Link
            href="/chat"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg -m-1 p-1 hover:bg-[var(--sidebar-hover)] transition-colors"
            aria-label={t('app.name')}
          >
            <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold brand-gradient-text leading-tight">
                {t('app.name')}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                {t('app.subtitle')}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Primary Navigation — fixed, never scrolls */}
        <nav className="relative shrink-0 px-2 py-3 border-b border-[var(--border-color)]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href !== '#' && pathname === item.href
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => {
                  if (item.href !== '#') onClose()
                }}
                className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-[var(--accent)] font-medium bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent shadow-inner shadow-indigo-500/5'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gradient-to-b from-indigo-400 to-purple-500"
                  />
                )}
                <span
                  className={
                    isActive
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                  }
                >
                  {item.icon}
                </span>
                <span className="flex-1">{t(item.key as Parameters<typeof t>[0])}</span>
                {item.badge === 'new' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gradient-to-r from-emerald-400/25 to-teal-400/25 text-emerald-300 uppercase tracking-wide ring-1 ring-emerald-400/25">
                    {t('common.new_badge')}
                  </span>
                )}
                {item.badge === 'soon' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] text-[var(--text-muted)] border border-[var(--border-color)] uppercase tracking-wide">
                    β
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Chat history — always visible, scrollable */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-3 pt-3 pb-2">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              {t('nav.chat')}
            </span>
            <button
              onClick={() => {
                newChat()
              }}
              title={t('chat.new')}
              className="text-[var(--text-muted)] hover:text-white hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 p-1 rounded-md transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/30"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {isFetchingConversations && conversations.length === 0 ? (
              <ConversationSkeleton />
            ) : conversations.length === 0 ? (
              <p className="text-center text-[var(--text-muted)] text-xs mt-6 px-2">
                {t('chat.empty')}
              </p>
            ) : (
              groupByDate(conversations, t).map(({ label, items }) => (
                <div key={label} className="mb-3">
                  <p className="px-2 py-1 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    {label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {items.map((conv) => (
                      <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isActive={conv.id === activeConversationId}
                        onClick={() => {
                          setActiveConversationId(conv.id)
                          onClose()
                        }}
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

        {/* Bottom: User Info + Theme + Lang — fixed, never scrolls */}
        <div
          className="relative shrink-0 border-t border-[var(--border-color)] p-2 space-y-0.5"
          style={{
            background:
              'linear-gradient(0deg, rgba(99,102,241,0.06) 0%, transparent 100%)',
          }}
        >
          <UserInfoRow onClose={onClose} />
          <ThemeAndLangRow theme={theme} setTheme={setTheme} />
        </div>
      </aside>
    </>
  )
}

function ThemeAndLangRow({
  theme,
  setTheme,
}: {
  theme: string
  setTheme: (t: 'dark' | 'light') => void
}) {
  const { locale, setLocale, t } = useI18n()

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
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <span>{t('theme.light')}</span>
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        {locale === 'zh' ? 'EN' : '中'}
      </button>
    </div>
  )
}

import { useAuth } from '@/contexts/AuthContext'
import { Conversation } from '@/types/chat'
import { TranslationKey } from '@/contexts/I18nContext'

function UserInfoRow({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const { t } = useI18n()
  const { user, profile, setShowAuthModal, setShowLogoutConfirm } = useAuth()

  if (!user) {
    return (
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-all duration-150 w-full"
      >
        <div className="w-7 h-7 rounded-full bg-[var(--input-bg)] flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <span>{t('auth.login')}</span>
      </button>
    )
  }

  const displayName = profile?.nickname || user.email?.split('@')[0] || 'User'
  const avatarLetter = displayName[0].toUpperCase()

  return (
    <div className="flex items-center gap-2 px-1">
      <Link
        href="/profile"
        onClick={onClose}
        className={`flex-1 flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm transition-all duration-150 min-w-0 ${
          pathname === '/profile'
            ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
            : 'text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)]'
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {avatarLetter}
        </div>
        <span className="truncate text-xs">{displayName}</span>
      </Link>

      <button
        onClick={() => setShowLogoutConfirm(true)}
        title={t('auth.logout')}
        className="shrink-0 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="mt-2 space-y-3">
      {[0, 1].map((g) => (
        <div key={g} className="space-y-1">
          <div className="px-2 h-3 w-16 rounded bg-[var(--sidebar-hover)] animate-pulse" />
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-[var(--sidebar-hover)]/60"
              >
                <div
                  className="h-3 rounded bg-[var(--border-color)] animate-pulse flex-1"
                  style={{ maxWidth: `${60 + ((i * 13) % 40)}%` }}
                />
                <div className="h-3 w-4 rounded bg-[var(--border-color)] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupByDate(
  conversations: Conversation[],
  t: (key: TranslationKey) => string,
): { label: string; items: Conversation[] }[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const lastWeek = new Date(today.getTime() - 7 * 86400000)

  const groups: Record<string, Conversation[]> = {}
  const order = [t('chat.today'), t('chat.yesterday'), t('chat.last7days'), t('chat.earlier')]

  for (const conv of [...conversations].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  )) {
    const d = new Date(
      conv.createdAt.getFullYear(),
      conv.createdAt.getMonth(),
      conv.createdAt.getDate(),
    )
    let label: string
    if (d >= today) label = t('chat.today')
    else if (d >= yesterday) label = t('chat.yesterday')
    else if (d >= lastWeek) label = t('chat.last7days')
    else label = t('chat.earlier')

    if (!groups[label]) groups[label] = []
    groups[label].push(conv)
  }

  return order.filter((l) => groups[l]).map((l) => ({ label: l, items: groups[l] }))
}
