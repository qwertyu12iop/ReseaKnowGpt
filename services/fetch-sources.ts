import type { Source } from '@/types/chat'

export interface FetchSourcesResult {
  sources: Source[]
  keywords: string[]
}

export async function fetchSources(
  question: string,
  answer: string,
  signal?: AbortSignal,
): Promise<FetchSourcesResult> {
  try {
    const res = await fetch('/api/chat/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer }),
      signal,
    })
    if (!res.ok) return { sources: [], keywords: [] }
    const data = (await res.json()) as Partial<FetchSourcesResult>
    return {
      sources: Array.isArray(data.sources) ? data.sources : [],
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
    }
  } catch {
    return { sources: [], keywords: [] }
  }
}
