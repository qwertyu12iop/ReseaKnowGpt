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

interface OpenAlexWork {
  id?: string
  doi?: string | null
  title?: string | null
  display_name?: string | null
  publication_year?: number | null
  authorships?: OpenAlexAuthorship[]
  primary_location?: OpenAlexLocation | null
  best_oa_location?: OpenAlexLocation | null
  open_access?: { is_oa?: boolean; oa_url?: string | null }
  cited_by_count?: number
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
  signal?: AbortSignal
}

export async function searchOpenAlex({
  query,
  perPage = 5,
  signal,
}: OpenAlexSearchOptions): Promise<Source[]> {
  if (!query.trim()) return []

  const mailto = process.env.OPENALEX_MAILTO
  const params = new URLSearchParams({
    search: query,
    per_page: String(Math.min(Math.max(perPage, 1), 25)),
    sort: 'relevance_score:desc',
    select:
      'id,doi,title,display_name,publication_year,authorships,primary_location,best_oa_location,open_access,cited_by_count',
  })
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
