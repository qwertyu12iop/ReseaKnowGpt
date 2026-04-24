import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchOpenAlexCatalog } from '@/lib/literature/openalex'
import { searchArxiv } from '@/lib/literature/arxiv'
import { fetchChinaXiv } from '@/lib/literature/chinaxiv'
import { CATEGORY_CONFIGS, CATEGORY_MAP } from '@/lib/literature/categories'
import type { Database, PaperCategory } from '@/types/supabase'

type PaperInsert = Database['public']['Tables']['paper_catalog']['Insert']

export interface CrawlResult {
  category: PaperCategory
  fetchedFromOpenAlex: number
  fetchedFromOpenAlexZh: number
  fetchedFromArxiv: number
  fetchedFromChinaXiv: number
  upserted: number
  errors: string[]
}

/** 限制单次任务每个分类最多入库 N 条，避免数据库暴涨 */
const MAX_PER_CATEGORY = 60
/** 只取近 N 年论文 */
const MIN_YEAR_GAP = 5
/** ChinaXiv 拉取的近期范围（天） */
const CHINAXIV_DAYS = 180

export async function crawlCategory(category: PaperCategory): Promise<CrawlResult> {
  const config = CATEGORY_MAP[category]
  const result: CrawlResult = {
    category,
    fetchedFromOpenAlex: 0,
    fetchedFromOpenAlexZh: 0,
    fetchedFromArxiv: 0,
    fetchedFromChinaXiv: 0,
    upserted: 0,
    errors: [],
  }

  const minYear = new Date().getFullYear() - MIN_YEAR_GAP
  const items: PaperInsert[] = []
  const seen = new Set<string>()

  // ── 1. OpenAlex 英文高被引论文 ──────────────────────────────────────
  for (const q of config.openAlexQueries) {
    try {
      const works = await searchOpenAlexCatalog({
        query: q,
        perPage: 10,
        sort: 'cited_by_count',
        minYear,
      })
      result.fetchedFromOpenAlex += works.length
      for (const w of works) {
        if (seen.has(w.externalId)) continue
        seen.add(w.externalId)
        items.push({
          external_id: w.externalId,
          source: 'openalex',
          title: w.title,
          authors: w.authors,
          abstract: w.abstract,
          year: w.year,
          venue: w.venue,
          doi: w.doi,
          url: w.url,
          pdf_url: w.pdfUrl,
          category,
          tags: w.concepts,
          cited_by_count: w.citedByCount,
          is_open_access: w.isOpenAccess,
          fetched_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      result.errors.push(`OpenAlex[${q}]: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  // ── 2. OpenAlex 中文期刊论文（language:zh 过滤） ────────────────────
  for (const q of config.openAlexChineseQueries) {
    try {
      const works = await searchOpenAlexCatalog({
        query: q,
        perPage: 8,
        sort: 'cited_by_count',
        minYear,
        language: 'zh',
      })
      result.fetchedFromOpenAlexZh += works.length
      for (const w of works) {
        if (seen.has(w.externalId)) continue
        seen.add(w.externalId)
        items.push({
          external_id: w.externalId,
          source: 'openalex',
          title: w.title,
          authors: w.authors,
          abstract: w.abstract,
          year: w.year,
          venue: w.venue,
          doi: w.doi,
          url: w.url,
          pdf_url: w.pdfUrl,
          category,
          tags: w.concepts,
          cited_by_count: w.citedByCount,
          is_open_access: w.isOpenAccess,
          fetched_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      result.errors.push(
        `OpenAlex-ZH[${q}]: ${err instanceof Error ? err.message : 'unknown'}`,
      )
    }
  }

  // ── 3. arXiv 英文预印本 ─────────────────────────────────────────────
  for (const q of config.arxivQueries) {
    try {
      const papers = await searchArxiv({
        query: q,
        maxResults: 15,
        sortBy: 'submittedDate',
      })
      result.fetchedFromArxiv += papers.length
      for (const p of papers) {
        if (seen.has(p.externalId)) continue
        seen.add(p.externalId)
        items.push({
          external_id: p.externalId,
          source: 'arxiv',
          title: p.title,
          authors: p.authors,
          abstract: p.abstract,
          year: p.year,
          venue: 'arXiv',
          doi: null,
          url: p.url,
          pdf_url: p.pdfUrl,
          category,
          tags: [],
          cited_by_count: 0,
          is_open_access: true,
          fetched_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      result.errors.push(`arXiv[${q}]: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }

  // ── 4. ChinaXiv 中文预印本 ──────────────────────────────────────────
  const seenChinaxivSets = new Set<string>()
  for (const set of config.chinaxivSets) {
    if (seenChinaxivSets.has(set)) continue
    seenChinaxivSets.add(set)
    try {
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - CHINAXIV_DAYS)
      const papers = await fetchChinaXiv({
        set,
        from: fromDate.toISOString().slice(0, 10),
        maxResults: 20,
      })
      result.fetchedFromChinaXiv += papers.length
      for (const p of papers) {
        if (seen.has(p.externalId)) continue
        seen.add(p.externalId)
        items.push({
          external_id: p.externalId,
          source: 'chinaxiv',
          title: p.title,
          authors: p.authors,
          abstract: p.abstract || null,
          year: p.year,
          venue: 'ChinaXiv',
          doi: null,
          url: p.url,
          pdf_url: p.pdfUrl,
          category,
          tags: [],
          cited_by_count: 0,
          is_open_access: true,
          fetched_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      result.errors.push(
        `ChinaXiv[set=${set}]: ${err instanceof Error ? err.message : 'unknown'}`,
      )
    }
  }

  if (items.length === 0) return result

  // 按引用数降序截断（英文高被引排前，中文/预印本引用数为 0 排后）
  const deduped = items
    .sort((a, b) => (b.cited_by_count ?? 0) - (a.cited_by_count ?? 0))
    .slice(0, MAX_PER_CATEGORY)

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('paper_catalog')
    .upsert(deduped, { onConflict: 'external_id', ignoreDuplicates: false })
    .select('id')

  if (error) {
    result.errors.push(`DB upsert: ${error.message}`)
  } else {
    result.upserted = data?.length ?? 0
  }

  return result
}

export async function crawlAll(): Promise<CrawlResult[]> {
  const results: CrawlResult[] = []
  for (const config of CATEGORY_CONFIGS) {
    const r = await crawlCategory(config.key)
    results.push(r)
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return results
}
