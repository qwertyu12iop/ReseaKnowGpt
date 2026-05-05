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
  const category = searchParams.get('category') ?? 'all'

  const supabase = createAdminClient()

  let query = supabase
    .from('paper_catalog')
    .select('*', { count: 'exact' })

  if (category !== 'all') {
    query = query.eq('category', category as 'ai' | 'systems' | 'algorithms' | 'network' | 'security' | 'theory' | 'database' | 'hci')
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`)
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

export async function POST(request: Request) {
  const admin = await verifyAdminToken(request)
  if (!admin) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { title, authors, abstract, year, venue, doi, url, pdf_url, category, tags, source, external_id } = body

    if (!title || !url || !category || !source || !external_id) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('paper_catalog')
      .insert({
        title,
        authors: authors ?? [],
        abstract: abstract ?? null,
        year: year ?? null,
        venue: venue ?? null,
        doi: doi ?? null,
        url,
        pdf_url: pdf_url ?? null,
        category,
        tags: tags ?? [],
        source,
        external_id,
        cited_by_count: 0,
        is_open_access: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const admin = await verifyAdminToken(request)
  if (!admin) return unauthorizedResponse()

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: '缺少论文ID' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('paper_catalog')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const admin = await verifyAdminToken(request)
  if (!admin) return unauthorizedResponse()

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '缺少论文ID' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase
    .from('paper_catalog')
    .delete()
    .eq('id', Number(id))

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
