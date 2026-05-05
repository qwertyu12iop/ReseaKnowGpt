'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { useI18n } from '@/contexts/I18nContext'

interface UserProfile {
  id: string
  nickname: string | null
  avatar_url: string | null
  bio: string | null
  institution: string | null
  research_field: string | null
  created_at: string
  updated_at: string
}

export default function AdminUsersPage() {
  const { t, locale } = useI18n()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const pageSize = 15

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(search ? { search } : {}),
      })

      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        setUsers(data.items)
        setTotal(data.total)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const totalPages = Math.ceil(total / pageSize)

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('admin.users')}</h1>
            <p className="text-white/50 text-sm mt-1">
              {t('admin.users_desc').replace('{count}', String(total))}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <div className="relative max-w-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('admin.search_users')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 transition-all"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_user')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_institution')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_research')}</th>
                  <th className="text-left text-xs font-medium text-white/50 uppercase tracking-wider px-5 py-3">{t('admin.col_registered')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="h-4 w-32 rounded bg-white/10 animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-white/10 animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 rounded bg-white/10 animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-white/10 animate-pulse" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-white/40 text-sm">
                      {t('admin.no_users')}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {(user.nickname || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.nickname || t('admin.not_set')}</p>
                            <p className="text-xs text-white/40">{user.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white/60">{user.institution || '-'}</td>
                      <td className="px-5 py-4 text-sm text-white/60">{user.research_field || '-'}</td>
                      <td className="px-5 py-4 text-sm text-white/60">
                        {new Date(user.created_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <p className="text-sm text-white/40">
                {t('admin.page_info').replace('{page}', String(page)).replace('{total}', String(totalPages))}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  {t('admin.prev_page')}
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-all"
                >
                  {t('admin.next_page')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
