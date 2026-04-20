import { NextResponse } from 'next/server'
import { crawlAll, crawlCategory } from '@/services/paper-crawler'
import { ALL_CATEGORY_KEYS } from '@/lib/literature/categories'
import type { PaperCategory } from '@/types/paper'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// 爬一轮耗时较长，放宽超时（Vercel Pro 最长 300s）
export const maxDuration = 300

interface CrawlBody {
  category?: PaperCategory | 'all'
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRAWL_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : header
  return bearer === secret
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CrawlBody = {}
  try {
    body = (await request.json()) as CrawlBody
  } catch {
    body = {}
  }

  const category = body.category ?? 'all'

  try {
    if (category === 'all') {
      const results = await crawlAll()
      return NextResponse.json({ ok: true, results })
    }

    if (!ALL_CATEGORY_KEYS.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 })
    }

    const result = await crawlCategory(category)
    return NextResponse.json({ ok: true, results: [result] })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'crawl failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
