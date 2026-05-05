import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await verifyAdminToken(request)
  if (!admin) return unauthorizedResponse()

  const supabase = createAdminClient()

  const [users, papers, conversations, documents] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('paper_catalog').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('document_chunks').select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    userCount: users.count ?? 0,
    paperCount: papers.count ?? 0,
    conversationCount: conversations.count ?? 0,
    documentChunkCount: documents.count ?? 0,
  })
}
