import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Paper, PaperCategory, PaperListResponse } from '@/types/paper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_CATEGORIES: PaperCategory[] = [
  'ai',
  'systems',
  'algorithms',
  'network',
  'security',
  'theory',
  'database',
  'hci',
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryParam = searchParams.get('category') ?? 'all'
  const search = (searchParams.get('search') ?? '').trim()
  const sort = searchParams.get('sort') ?? 'citations'
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))

  const supabase = await createClient()

  let query = supabase
    .from('paper_catalog')
    .select('*, paper_summary!left(paper_id)', { count: 'exact' })

  if (categoryParam !== 'all' && VALID_CATEGORIES.includes(categoryParam as PaperCategory)) {
    query = query.eq('category', categoryParam as PaperCategory)
  }

  if (search) {
    // 简单的 ilike 组合检索；若需更强力可换 websearch_to_tsquery
    query = query.or(`title.ilike.%${search}%,abstract.ilike.%${search}%`)
  }

  if (sort === 'year') {
    query = query.order('year', { ascending: false, nullsFirst: false })
  } else if (sort === 'recent') {
    query = query.order('fetched_at', { ascending: false })
  } else {
    query = query.order('cited_by_count', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const items: Paper[] = (data ?? []).map((row) => {
    const summaryArr = (row as unknown as { paper_summary?: { paper_id: number }[] }).paper_summary
    return {
      id: row.id,
      externalId: row.external_id,
      source: row.source,
      title: row.title,
      authors: row.authors ?? [],
      abstract: row.abstract,
      year: row.year,
      venue: row.venue,
      doi: row.doi,
      url: row.url,
      pdfUrl: row.pdf_url,
      category: row.category,
      tags: row.tags ?? [],
      citedByCount: row.cited_by_count ?? 0,
      isOpenAccess: row.is_open_access ?? false,
      hasSummary: Array.isArray(summaryArr) && summaryArr.length > 0,
    }
  })

  const response: PaperListResponse = {
    items,
    total: count ?? items.length,
    page,
    pageSize,
  }

  return NextResponse.json(response)
}
