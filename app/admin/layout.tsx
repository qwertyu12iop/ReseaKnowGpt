import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ReseaKnowGPT — 管理后台',
  description: '系统管理后台',
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children
}
