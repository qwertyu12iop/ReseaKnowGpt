'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConversationProvider } from '@/contexts/ConversationContext'
import AppSidebar from './AppSidebar'

export default function AppClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ConversationProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile topbar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)] backdrop-blur-md bg-[var(--chat-bg)]/70 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--chat-surface)] transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-lg -mx-1 px-1 py-0.5 hover:bg-[var(--sidebar-hover)] transition-colors"
              aria-label="ReseaKnowGPT"
            >
              <div className="w-6 h-6 rounded-lg brand-gradient flex items-center justify-center ring-1 ring-white/10 shadow shadow-indigo-500/30">
                <svg
                  width="11"
                  height="11"
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
              <span className="text-sm font-semibold brand-gradient-text">ReseaKnowGPT</span>
            </Link>
          </div>
          <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
        </div>
      </div>
    </ConversationProvider>
  )
}
