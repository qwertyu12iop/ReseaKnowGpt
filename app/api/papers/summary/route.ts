import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOrGenerateSummary } from '@/services/paper-summary'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface SummaryBody {
  paperId?: number
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SummaryBody
  try {
    body = (await request.json()) as SummaryBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const paperId = Number(body.paperId)
  if (!paperId || Number.isNaN(paperId)) {
    return NextResponse.json({ error: 'paperId required' }, { status: 400 })
  }

  const { data: paper, error } = await supabase
    .from('paper_catalog')
    .select('id,title,abstract,authors,year,venue')
    .eq('id', paperId)
    .maybeSingle()

  if (error || !paper) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
  }

  try {
    const summary = await getOrGenerateSummary({
      paperId: paper.id,
      title: paper.title,
      abstract: paper.abstract,
      authors: paper.authors ?? [],
      year: paper.year,
      venue: paper.venue,
    })
    return NextResponse.json({ summary })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'summary failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
