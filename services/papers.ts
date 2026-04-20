import type { Paper, PaperListQuery, PaperListResponse, PaperSummary } from '@/types/paper'

interface RawSummary {
  paperId: number
  summaryZh: string | null
  summaryEn: string | null
  keyPoints: PaperSummary['keyPoints']
  model: string | null
  generatedAt: string
}

export async function fetchPapers(
  query: PaperListQuery,
  signal?: AbortSignal,
): Promise<PaperListResponse> {
  const params = new URLSearchParams()
  if (query.category && query.category !== 'all') params.set('category', query.category)
  if (query.search) params.set('search', query.search)
  if (query.sort) params.set('sort', query.sort)
  if (query.page) params.set('page', String(query.page))
  if (query.pageSize) params.set('pageSize', String(query.pageSize))

  const res = await fetch(`/api/papers?${params.toString()}`, { signal })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败：${res.status}`)
  }
  return (await res.json()) as PaperListResponse
}

export async function fetchPaperSummary(
  paperId: number,
  signal?: AbortSignal,
): Promise<PaperSummary> {
  const res = await fetch('/api/papers/summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paperId }),
    signal,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error ?? `请求失败：${res.status}`)
  }
  const data = (await res.json()) as { summary: RawSummary }
  return {
    paperId: data.summary.paperId,
    summaryZh: data.summary.summaryZh,
    summaryEn: data.summary.summaryEn,
    keyPoints: data.summary.keyPoints ?? [],
    model: data.summary.model,
    generatedAt: data.summary.generatedAt,
  }
}

export function paperKeyOf(paper: Paper): string {
  return `${paper.source}:${paper.externalId}`
}
