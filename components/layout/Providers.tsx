'use client'

import { I18nProvider } from '@/contexts/I18nContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import LogoutConfirmModal from '@/components/auth/LogoutConfirmModal'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
          <AuthModal />
          <LogoutConfirmModal />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
