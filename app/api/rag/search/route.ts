import { NextResponse } from 'next/server'
import { searchSimilarChunks } from '@/services/rag-pipeline'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SearchRequestBody {
  query?: string
  matchThreshold?: number
  matchCount?: number
}

export async function POST(request: Request) {
  let body: SearchRequestBody
  try {
    body = (await request.json()) as SearchRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const query = body.query?.trim()
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 })
  }

  try {
    const chunks = await searchSimilarChunks(query, {
      matchThreshold: body.matchThreshold,
      matchCount: body.matchCount,
    })
    return NextResponse.json({ chunks })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
