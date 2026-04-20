import 'server-only'

/**
 * arXiv Query API 返回 Atom XML，这里手写轻量解析避免额外依赖。
 * 官方文档：https://info.arxiv.org/help/api/user-manual.html
 */

const ARXIV_BASE = 'https://export.arxiv.org/api/query'

export interface ArxivPaper {
  externalId: string // 'arxiv:2301.00001'
  title: string
  authors: string[]
  abstract: string
  year: number | null
  url: string
  pdfUrl: string | null
  publishedAt: string
}

export interface ArxivSearchOptions {
  query: string
  maxResults?: number
  sortBy?: 'relevance' | 'submittedDate'
  signal?: AbortSignal
}

function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractAll(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'g')
  const result: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null) {
    result.push(m[1])
  }
  return result
}

function extractFirst(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)
  const m = re.exec(xml)
  return m ? m[1] : null
}

function extractLinkHref(entryXml: string, rel?: string, type?: string): string | null {
  // <link ... href="..." rel="..." type="..." />
  const re = /<link\b([^>]+)\/?>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(entryXml)) !== null) {
    const attrs = m[1]
    const hrefMatch = /href="([^"]+)"/.exec(attrs)
    const relMatch = /rel="([^"]+)"/.exec(attrs)
    const typeMatch = /type="([^"]+)"/.exec(attrs)
    const href = hrefMatch?.[1]
    if (!href) continue
    if (rel && relMatch?.[1] !== rel) continue
    if (type && typeMatch?.[1] !== type) continue
    return href
  }
  return null
}

function parseEntry(entryXml: string): ArxivPaper | null {
  const idRaw = extractFirst(entryXml, 'id')
  const titleRaw = extractFirst(entryXml, 'title')
  const summaryRaw = extractFirst(entryXml, 'summary')
  const publishedRaw = extractFirst(entryXml, 'published')

  if (!idRaw || !titleRaw) return null

  // id 形如 http://arxiv.org/abs/2301.00001v1
  const absMatch = /arxiv\.org\/abs\/([^\s<]+)/.exec(idRaw)
  if (!absMatch) return null
  const arxivId = absMatch[1].replace(/v\d+$/, '')

  const authorBlocks = extractAll(entryXml, 'author')
  const authors = authorBlocks
    .map((block) => extractFirst(block, 'name'))
    .filter((n): n is string => Boolean(n))
    .map((n) => decodeEntities(n))

  const published = publishedRaw ? decodeEntities(publishedRaw) : ''
  const year = published ? Number(published.slice(0, 4)) || null : null

  const pdfUrl =
    extractLinkHref(entryXml, 'related', 'application/pdf') ||
    `https://arxiv.org/pdf/${arxivId}.pdf`
  const htmlUrl = extractLinkHref(entryXml, 'alternate') || `https://arxiv.org/abs/${arxivId}`

  return {
    externalId: `arxiv:${arxivId}`,
    title: decodeEntities(titleRaw),
    authors,
    abstract: summaryRaw ? decodeEntities(summaryRaw) : '',
    year,
    url: htmlUrl,
    pdfUrl,
    publishedAt: published,
  }
}

export async function searchArxiv({
  query,
  maxResults = 10,
  sortBy = 'relevance',
  signal,
}: ArxivSearchOptions): Promise<ArxivPaper[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    search_query: query,
    max_results: String(Math.min(Math.max(maxResults, 1), 30)),
    sortBy: sortBy === 'submittedDate' ? 'submittedDate' : 'relevance',
    sortOrder: 'descending',
  })

  const res = await fetch(`${ARXIV_BASE}?${params.toString()}`, {
    method: 'GET',
    headers: { 'User-Agent': 'ReseaKnowGPT/1.0' },
    signal,
  })

  if (!res.ok) {
    throw new Error(`arXiv error ${res.status}`)
  }

  const xml = await res.text()
  const entries = extractAll(xml, 'entry')
  return entries.map(parseEntry).filter((p): p is ArxivPaper => p !== null)
}
