import { NextResponse } from 'next/server'
import { extractSearchKeywords } from '@/services/extract-keywords'
import { searchOpenAlexMulti } from '@/lib/literature/openalex'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RequestBody {
  question?: string
  answer?: string
}

export async function POST(request: Request) {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const question = (body.question ?? '').trim()
  const answer = (body.answer ?? '').trim()
  if (!question || !answer) {
    return NextResponse.json({ sources: [], keywords: [] })
  }

  let keywords: string[] = []
  try {
    keywords = await extractSearchKeywords(question, answer)
  } catch {
    keywords = []
  }

  if (keywords.length === 0) {
    return NextResponse.json({ sources: [], keywords: [] })
  }

  let sources = []
  try {
    sources = await searchOpenAlexMulti(keywords, 4)
  } catch (err) {
    return NextResponse.json(
      { sources: [], keywords, error: err instanceof Error ? err.message : 'OpenAlex error' },
      { status: 200 },
    )
  }

  return NextResponse.json({ sources, keywords })
}
