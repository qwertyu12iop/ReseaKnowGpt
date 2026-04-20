'use client'

import { I18nProvider } from '@/contexts/I18nContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ConversationProvider } from '@/contexts/ConversationContext'
import AuthModal from '@/components/auth/AuthModal'
import LogoutConfirmModal from '@/components/auth/LogoutConfirmModal'
import type { InitialAppData } from '@/lib/auth/initial-data'

interface ProvidersProps {
  children: React.ReactNode
  initialData: InitialAppData
}

export default function Providers({ children, initialData }: ProvidersProps) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider initialUser={initialData.user} initialProfile={initialData.profile}>
          <ConversationProvider initialConversations={initialData.conversations}>
            {children}
            <AuthModal />
            <LogoutConfirmModal />
          </ConversationProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
