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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowAuthModal(false)}
      />

      <div className="relative w-full max-w-sm mx-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-colors"
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
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <svg
              width="22"
              height="22"
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
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('app.name')}</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('auth.welcome')}</p>
        </div>

        {/* Tab Switch */}
        <div className="flex mx-6 mb-4 rounded-xl bg-[var(--input-bg)] p-1">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'login'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              tab === 'register'
                ? 'bg-[var(--accent)] text-white shadow-sm'
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors"
            />
          </div>

          {error && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium shadow-sm shadow-[var(--shadow-accent)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}
