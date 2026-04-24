import 'server-only'
import type { Source } from '@/types/chat'

const OPENALEX_BASE = 'https://api.openalex.org'

interface OpenAlexAuthorship {
  author?: { display_name?: string }
}

interface OpenAlexLocation {
  source?: { display_name?: string }
  landing_page_url?: string
  pdf_url?: string
}

interface OpenAlexConcept {
  display_name?: string
  level?: number
  score?: number
}

interface OpenAlexWork {
  id?: string
  doi?: string | null
  title?: string | null
  display_name?: string | null
  abstract_inverted_index?: Record<string, number[]> | null
  publication_year?: number | null
  authorships?: OpenAlexAuthorship[]
  primary_location?: OpenAlexLocation | null
  best_oa_location?: OpenAlexLocation | null
  open_access?: { is_oa?: boolean; oa_url?: string | null }
  cited_by_count?: number
  concepts?: OpenAlexConcept[]
}

interface OpenAlexResponse {
  results?: OpenAlexWork[]
}

function pickUrl(work: OpenAlexWork): string | null {
  return (
    work.open_access?.oa_url ||
    work.best_oa_location?.pdf_url ||
    work.best_oa_location?.landing_page_url ||
    work.primary_location?.landing_page_url ||
    work.doi ||
    work.id ||
    null
  )
}

function normalize(work: OpenAlexWork): Source | null {
  const title = work.title ?? work.display_name
  const url = pickUrl(work)
  if (!title || !url) return null

  const authors = (work.authorships ?? [])
    .map((a) => a.author?.display_name)
    .filter((n): n is string => Boolean(n))
    .slice(0, 6)

  const id = work.id?.replace('https://openalex.org/', '') ?? url

  return {
    id,
    title,
    authors,
    year: work.publication_year ?? null,
    venue: work.primary_location?.source?.display_name ?? null,
    doi: work.doi ?? null,
    url,
    citedByCount: work.cited_by_count,
    isOpenAccess: work.open_access?.is_oa ?? false,
  }
}

export interface OpenAlexSearchOptions {
  query: string
  perPage?: number
  sort?: 'relevance' | 'cited_by_count' | 'publication_date'
  minYear?: number
  /** 限定论文语言，如 'zh'（中文）、'en'（英文）。不传则不限制。 */
  language?: string
  signal?: AbortSignal
}

export async function searchOpenAlex({
  query,
  perPage = 5,
  sort = 'relevance',
  minYear,
  language,
  signal,
}: OpenAlexSearchOptions): Promise<Source[]> {
  if (!query.trim()) return []

  const mailto = process.env.OPENALEX_MAILTO
  const sortParam =
    sort === 'cited_by_count'
      ? 'cited_by_count:desc'
      : sort === 'publication_date'
        ? 'publication_date:desc'
        : 'relevance_score:desc'

  const params = new URLSearchParams({
    search: query,
    per_page: String(Math.min(Math.max(perPage, 1), 25)),
    sort: sortParam,
    select:
      'id,doi,title,display_name,abstract_inverted_index,publication_year,authorships,primary_location,best_oa_location,open_access,cited_by_count,concepts',
  })

  const filters: string[] = []
  if (minYear) filters.push(`from_publication_date:${minYear}-01-01`)
  if (language) filters.push(`language:${language}`)
  if (filters.length) params.set('filter', filters.join(','))

  if (mailto) params.set('mailto', mailto)

  const url = `${OPENALEX_BASE}/works?${params.toString()}`

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': mailto ? `ReseaKnowGPT (mailto:${mailto})` : 'ReseaKnowGPT' },
    signal,
  })

  if (!res.ok) {
    throw new Error(`OpenAlex error ${res.status}`)
  }

  const json = (await res.json()) as OpenAlexResponse
  return (json.results ?? []).map(normalize).filter((s): s is Source => s !== null)
}

/**
 * 将 OpenAlex 的 inverted_index 摘要还原为正常字符串
 */
export function reconstructAbstract(
  inverted: Record<string, number[]> | null | undefined,
): string | null {
  if (!inverted) return null
  const positions: [number, string][] = []
  for (const [word, posList] of Object.entries(inverted)) {
    for (const p of posList) positions.push([p, word])
  }
  if (positions.length === 0) return null
  positions.sort((a, b) => a[0] - b[0])
  return positions.map(([, w]) => w).join(' ')
}

/**
 * 面向文献目录入库的检索：返回富文本元数据（含摘要、concepts）
 */
export interface OpenAlexCatalogItem {
  externalId: string // 'openalex:W123'
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  venue: string | null
  doi: string | null
  url: string
  pdfUrl: string | null
  citedByCount: number
  isOpenAccess: boolean
  concepts: string[]
}

export async function searchOpenAlexCatalog({
  query,
  perPage = 10,
  sort = 'cited_by_count',
  minYear,
  language,
  signal,
}: OpenAlexSearchOptions): Promise<OpenAlexCatalogItem[]> {
  if (!query.trim()) return []

  const mailto = process.env.OPENALEX_MAILTO
  const sortParam =
    sort === 'cited_by_count'
      ? 'cited_by_count:desc'
      : sort === 'publication_date'
        ? 'publication_date:desc'
        : 'relevance_score:desc'

  const params = new URLSearchParams({
    search: query,
    per_page: String(Math.min(Math.max(perPage, 1), 50)),
    sort: sortParam,
    select:
      'id,doi,title,display_name,abstract_inverted_index,publication_year,authorships,primary_location,best_oa_location,open_access,cited_by_count,concepts',
  })

  // 拼装 filter 参数：支持时间范围 + 语言过滤
  const filters: string[] = []
  if (minYear) filters.push(`from_publication_date:${minYear}-01-01`)
  if (language) filters.push(`language:${language}`)
  if (filters.length) params.set('filter', filters.join(','))

  if (mailto) params.set('mailto', mailto)

  const res = await fetch(`${OPENALEX_BASE}/works?${params.toString()}`, {
    method: 'GET',
    headers: { 'User-Agent': mailto ? `ReseaKnowGPT (mailto:${mailto})` : 'ReseaKnowGPT' },
    signal,
  })

  if (!res.ok) throw new Error(`OpenAlex error ${res.status}`)

  const json = (await res.json()) as OpenAlexResponse
  const works = json.results ?? []

  return works
    .map((w): OpenAlexCatalogItem | null => {
      const title = w.title ?? w.display_name
      const url = pickUrl(w)
      if (!title || !url || !w.id) return null

      const openAlexId = w.id.replace('https://openalex.org/', '')
      const authors = (w.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter((n): n is string => Boolean(n))
        .slice(0, 10)

      const concepts = (w.concepts ?? [])
        .filter((c) => (c.score ?? 0) > 0.3)
        .map((c) => c.display_name)
        .filter((n): n is string => Boolean(n))
        .slice(0, 6)

      return {
        externalId: `openalex:${openAlexId}`,
        title,
        authors,
        abstract: reconstructAbstract(w.abstract_inverted_index),
        year: w.publication_year ?? null,
        venue: w.primary_location?.source?.display_name ?? null,
        doi: w.doi ?? null,
        url,
        pdfUrl: w.best_oa_location?.pdf_url ?? w.open_access?.oa_url ?? null,
        citedByCount: w.cited_by_count ?? 0,
        isOpenAccess: w.open_access?.is_oa ?? false,
        concepts,
      }
    })
    .filter((x): x is OpenAlexCatalogItem => x !== null)
}

/**
 * 多关键词并行检索后，按 id 去重并保留排序更靠前的
 */
export async function searchOpenAlexMulti(
  queries: string[],
  perPage = 4,
  signal?: AbortSignal,
): Promise<Source[]> {
  const cleaned = queries
    .map((q) => q.trim())
    .filter((q) => q.length > 0)
    .slice(0, 3)
  if (cleaned.length === 0) return []

  const settled = await Promise.allSettled(
    cleaned.map((q) => searchOpenAlex({ query: q, perPage, signal })),
  )

  const seen = new Set<string>()
  const merged: Source[] = []
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    for (const src of result.value) {
      if (seen.has(src.id)) continue
      seen.add(src.id)
      merged.push(src)
      if (merged.length >= perPage * 2) break
    }
    if (merged.length >= perPage * 2) break
  }
  return merged.slice(0, 6)
}
