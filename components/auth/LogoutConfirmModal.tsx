'use client'

import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

export default function LogoutConfirmModal() {
  const { showLogoutConfirm, setShowLogoutConfirm, signOut } = useAuth()
  const { t } = useI18n()

  const handleSignOut = useCallback(async () => {
    setShowLogoutConfirm(false)
    await signOut()
  }, [signOut, setShowLogoutConfirm])

  if (!showLogoutConfirm) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowLogoutConfirm(false)}
      />
      <div className="relative w-full max-w-xs mx-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 text-center">
        <div className="mx-auto w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-400"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
          {t('auth.logout')}
        </h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">{t('auth.logout_confirm')}</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="flex-1 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSignOut}
            className="flex-1 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
