'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'
import type { TranslationKey } from '@/locales'

interface AdminInfo {
  id: number
  email: string
  nickname: string
  role: string
}

const NAV_ITEMS: { labelKey: TranslationKey; href: string; icon: string }[] = [
  { labelKey: 'admin.dashboard', href: '/admin', icon: 'dashboard' },
  { labelKey: 'admin.users', href: '/admin/users', icon: 'users' },
  { labelKey: 'admin.papers', href: '/admin/papers', icon: 'papers' },
]

const ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  papers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t, locale, setLocale } = useI18n()
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [mounted, setMounted] = useState(false)

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('admin_token')
    const info = localStorage.getItem('admin_info')

    if (!token || !info) {
      router.push('/admin/login')
      return
    }

    try {
      setAdminInfo(JSON.parse(info))
    } catch {
      router.push('/admin/login')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
    setMounted(true)
  }, [checkAuth])

  function handleLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    router.push('/admin/login')
  }

  if (!mounted || !adminInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <aside className="w-64 bg-slate-800/50 border-r border-white/10 flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">ReseaKnowGPT</p>
              <p className="text-xs text-white/50">{t('admin.title')}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 font-medium'
                    : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <span className={isActive ? 'text-indigo-400' : 'text-white/40'}>{ICONS[item.icon]}</span>
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
              {adminInfo.nickname[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{adminInfo.nickname}</p>
              <p className="text-xs text-white/40 truncate">{adminInfo.email}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2 px-1">
            <Link
              href="/chat"
              className="flex-1 py-2 text-center text-xs text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all"
            >
              {t('admin.go_front')}
            </Link>
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="py-2 px-3 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            >
              {t('admin.logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
