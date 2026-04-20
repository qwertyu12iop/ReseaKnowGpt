import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Providers from '@/components/layout/Providers'
import AppClientLayout from '@/components/layout/AppClientLayout'
import { getInitialAppData } from '@/lib/auth/initial-data'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ReseaKnowGPT — 计算机领域智能问答系统',
  description: '深度垂直于计算机学科领域的专用智能问答系统',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialData = await getInitialAppData()

  return (
    <html lang="zh-CN" data-theme="dark">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers initialData={initialData}>
          <AppClientLayout>{children}</AppClientLayout>
        </Providers>
      </body>
    </html>
  )
}
