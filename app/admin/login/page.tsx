'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/contexts/I18nContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('admin.login_error'))
        return
      }

      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_info', JSON.stringify(data.admin))
      router.push('/admin')
    } catch {
      setError(t('admin.login_network_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <button
        onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-all font-medium border border-white/10"
      >
        {locale === 'zh' ? 'EN' : '中文'}
      </button>

      <div className="w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">{t('admin.title')}</h1>
            <p className="text-sm text-white/60 mt-1">{t('admin.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('admin.login_email')}</label>
              <input
                type="email"
                name="admin_email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('admin.login_email_placeholder')}
                required
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">{t('admin.login_password')}</label>
              <input
                type="password"
                name="admin_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('admin.login_password_placeholder')}
                required
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30"
            >
              {loading ? t('admin.login_loading') : t('admin.login_button')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
