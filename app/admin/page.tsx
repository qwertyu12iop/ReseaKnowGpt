'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useI18n } from '@/contexts/I18nContext'
import type { TranslationKey } from '@/locales'

interface Stats {
  userCount: number
  paperCount: number
  conversationCount: number
  documentChunkCount: number
}

export default function AdminDashboard() {
  const { t } = useI18n()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const STAT_CARDS: { key: keyof Stats; labelKey: TranslationKey; color: string; icon: string }[] = [
    { key: 'userCount', labelKey: 'admin.stat_users', color: 'from-blue-500 to-cyan-500', icon: 'users' },
    { key: 'paperCount', labelKey: 'admin.stat_papers', color: 'from-purple-500 to-pink-500', icon: 'papers' },
    { key: 'conversationCount', labelKey: 'admin.stat_conversations', color: 'from-amber-500 to-orange-500', icon: 'chat' },
    { key: 'documentChunkCount', labelKey: 'admin.stat_chunks', color: 'from-emerald-500 to-teal-500', icon: 'docs' },
  ]

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setStats(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
          <p className="text-white/50 text-sm mt-1">{t('admin.dashboard_desc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STAT_CARDS.map((card) => (
            <div
              key={card.key}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-all"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                <StatIcon name={card.icon} />
              </div>
              <p className="text-white/50 text-sm">{t(card.labelKey)}</p>
              {loading ? (
                <div className="h-9 w-20 mt-1 rounded bg-white/10 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold mt-1">{stats?.[card.key] ?? 0}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t('admin.quick_actions')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                </svg>
                <span className="text-sm">{t('admin.view_users')}</span>
              </a>
              <a href="/admin/papers" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-sm">{t('admin.manage_papers')}</span>
              </a>
              <a href="/admin/papers" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all col-span-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-sm">{t('admin.add_paper')}</span>
              </a>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">{t('admin.system_info')}</h2>
            <div className="space-y-3">
              <InfoRow label={t('admin.sys_version')} value="v1.0.0" />
              <InfoRow label={t('admin.sys_framework')} value="Next.js 16 + React 19" />
              <InfoRow label={t('admin.sys_database')} value="Supabase PostgreSQL" />
              <InfoRow label={t('admin.sys_model')} value="DeepSeek Chat" />
              <InfoRow label={t('admin.sys_vector')} value="pgvector + SiliconFlow BGE" />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-white/50 text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

function StatIcon({ name }: { name: string }) {
  switch (name) {
    case 'users':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
    case 'papers':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
    case 'chat':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
    case 'docs':
      return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
    default:
      return null
  }
}
