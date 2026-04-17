'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

type AuthTab = 'login' | 'register'

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal } = useAuth()
  const { t } = useI18n()
  const [tab, setTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const resetForm = useCallback(() => {
    setEmail('')
    setPassword('')
    setNickname('')
    setError('')
  }, [])

  const switchTab = useCallback(
    (newTab: AuthTab) => {
      setTab(newTab)
      resetForm()
    },
    [resetForm],
  )

  const handleLogin = useCallback(async () => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setLoading(false)
  }, [supabase, email, password])

  const handleRegister = useCallback(async () => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: nickname || email.split('@')[0] } },
    })
    if (err) {
      setError(err.message)
    } else {
      setError('')
      setTab('login')
      setPassword('')
    }
    setLoading(false)
  }, [supabase, email, password, nickname])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (tab === 'login') handleLogin()
      else handleRegister()
    },
    [tab, handleLogin, handleRegister],
  )

  if (!showAuthModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={() => setShowAuthModal(false)}
      />

      <div className="relative w-full max-w-sm mx-4 glass-strong border border-[var(--border-strong)] rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden animate-fade-up">
        {/* decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -left-10 w-64 h-64 rounded-full blur-3xl animate-blob"
          style={{
            background:
              'radial-gradient(closest-side, rgba(129,140,248,0.45), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-10 w-64 h-64 rounded-full blur-3xl animate-blob"
          style={{
            background:
              'radial-gradient(closest-side, rgba(236,72,153,0.35), transparent 70%)',
            animationDelay: '1.5s',
          }}
        />

        <div className="relative">
          {/* Close Button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
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

          {/* Header */}
          <div className="px-6 pt-9 pb-4 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center shadow-xl shadow-indigo-500/40 ring-1 ring-white/15 mb-4">
              <svg
                width="24"
                height="24"
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
            <h2 className="text-lg font-bold brand-gradient-text">{t('app.name')}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">{t('auth.welcome')}</p>
          </div>

          {/* Tab Switch */}
          <div className="flex mx-6 mb-4 rounded-xl bg-black/10 dark:bg-white/5 p-1 ring-1 ring-[var(--border-color)]">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === 'login'
                  ? 'brand-gradient text-white shadow-lg shadow-indigo-500/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                tab === 'register'
                  ? 'brand-gradient text-white shadow-lg shadow-indigo-500/30'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-3">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  {t('auth.nickname')}
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={t('auth.nickname_placeholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="shrink-0 mt-0.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-1 rounded-xl brand-gradient text-white text-sm font-medium shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading
                ? t('auth.loading')
                : tab === 'login'
                  ? t('auth.login_button')
                  : t('auth.register_button')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
