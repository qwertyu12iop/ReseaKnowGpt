import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateEmbedding, generateEmbeddings } from './embedding'
import { splitText, type TextChunk } from './chunking'
import { crawlPage } from './crawler'

export interface RagChunk {
  id: number
  content: string
  metadata: Record<string, unknown>
  sourceUrl: string | null
  sourceTitle: string | null
  similarity: number
}

/* ──────── 爬取 + 分块 + 向量化 + 存储 ──────── */

const BATCH_SIZE = 20

export async function ingestUrl(url: string): Promise<{
  sourceId: number
  title: string
  chunkCount: number
}> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('crawl_sources')
    .select('id, title, chunk_count, status')
    .eq('url', url)
    .single()

  if (existing?.status === 'done' && existing.chunk_count > 0) {
    return {
      sourceId: Number(existing.id),
      title: existing.title ?? url,
      chunkCount: existing.chunk_count,
    }
  }

  const { data: sourceRow } = await supabase
    .from('crawl_sources')
    .upsert({ url, status: 'crawling' }, { onConflict: 'url' })
    .select('id')
    .single()

  const sourceId = Number(sourceRow?.id ?? 0)

  try {
    const crawled = await crawlPage(url)

    await supabase
      .from('crawl_sources')
      .update({ title: crawled.title, status: 'chunking' })
      .eq('id', sourceId)

    const chunks: TextChunk[] = await splitText(crawled.text, {
      sourceUrl: url,
      sourceTitle: crawled.title,
    })

    if (chunks.length === 0) {
      await supabase
        .from('crawl_sources')
        .update({ status: 'empty', chunk_count: 0, crawled_at: new Date().toISOString() })
        .eq('id', sourceId)
      return { sourceId, title: crawled.title, chunkCount: 0 }
    }

    await supabase
      .from('crawl_sources')
      .update({ status: 'embedding' })
      .eq('id', sourceId)

    await supabase
      .from('document_chunks')
      .delete()
      .eq('source_url', url)

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const texts = batch.map((c) => c.content)
      const embeddings = await generateEmbeddings(texts)

      const rows = batch.map((chunk, idx) => ({
        content: chunk.content,
        metadata: chunk.metadata as unknown as Record<string, unknown>,
        embedding: JSON.stringify(embeddings[idx].embedding),
        source_url: url,
        source_title: crawled.title,
      }))

      const { error } = await supabase
        .from('document_chunks')
        .insert(rows as never[])
      if (error) throw new Error(`Insert chunks failed: ${error.message}`)
    }

    await supabase
      .from('crawl_sources')
      .update({
        status: 'done',
        chunk_count: chunks.length,
        crawled_at: new Date().toISOString(),
      })
      .eq('id', sourceId)

    return { sourceId, title: crawled.title, chunkCount: chunks.length }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await supabase
      .from('crawl_sources')
      .update({ status: 'error', error_message: msg })
      .eq('id', sourceId)
    throw err
  }
}

/* ──────── 向量检索 ──────── */

export async function searchSimilarChunks(
  query: string,
  options?: { matchThreshold?: number; matchCount?: number },
): Promise<RagChunk[]> {
  const { matchThreshold = 0.35, matchCount = 6 } = options ?? {}

  const { embedding } = await generateEmbedding(query)
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) throw new Error(`match_documents RPC failed: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    content: row.content,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    sourceUrl: row.source_url,
    sourceTitle: row.source_title,
    similarity: row.similarity,
  }))
}

/* ──────── 组装 RAG 上下文 ──────── */

export function buildRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return ''

  const parts = chunks.map((chunk) => {
    const source = chunk.sourceTitle || chunk.sourceUrl || '未知来源'
    return `来源: ${source}\n${chunk.content}`
  })

  return parts.join('\n\n---\n\n')
}

export function extractSourceUrls(chunks: RagChunk[]): string[] {
  return [...new Set(chunks.map((c) => c.sourceUrl).filter(Boolean))] as string[]
}
