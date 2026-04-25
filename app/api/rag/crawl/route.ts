import { NextResponse } from 'next/server'
import { ingestUrl } from '@/services/rag-pipeline'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

interface CrawlRequestBody {
  url?: string
}

export async function POST(request: Request) {
  const secret = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRAWL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CrawlRequestBody
  try {
    body = (await request.json()) as CrawlRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = body.url?.trim()
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  try {
    const result = await ingestUrl(url)
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
