'use client'

import { useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

export default function LogoutConfirmModal() {
  const { showLogoutConfirm, setShowLogoutConfirm, signOut } = useAuth()
  const { t } = useI18n()

  const handleSignOut = useCallback(async () => {
    setShowLogoutConfirm(false)
    await signOut()
  }, [signOut, setShowLogoutConfirm])

  useEffect(() => {
    if (!showLogoutConfirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLogoutConfirm(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showLogoutConfirm, setShowLogoutConfirm])

  if (!showLogoutConfirm) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowLogoutConfirm(false)}
      />
      <div className="relative w-full max-w-[340px] mx-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xl animate-fade-up backdrop-blur-xl">
        <div className="px-5 pt-5 pb-4">
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
            {t('auth.logout')}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {t('auth.logout_confirm')}
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border-color)]">
          <button
            onClick={() => setShowLogoutConfirm(false)}
            className="px-3.5 h-8 rounded-md text-[13px] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSignOut}
            className="px-3.5 h-8 rounded-md text-[13px] font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
