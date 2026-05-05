import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminToken, unauthorizedResponse } from '@/lib/admin/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await verifyAdminToken(request)
  if (!admin) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))
  const search = (searchParams.get('search') ?? '').trim()

  const supabase = createAdminClient()

  let query = supabase.from('profiles').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`nickname.ilike.%${search}%,institution.ilike.%${search}%,research_field.ilike.%${search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  })
}
