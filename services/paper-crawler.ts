import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchOpenAlexCatalog } from '@/lib/literature/openalex'
import { searchArxiv } from '@/lib/literature/arxiv'
import { CATEGORY_CONFIGS, CATEGORY_MAP } from '@/lib/literature/categories'
import type { Database, PaperCategory } from '@/types/supabase'

type PaperInsert = Database['public']['Tables']['paper_catalog']['Insert']

export interface CrawlResult {
  category: PaperCategory
  fetchedFromOpenAlex: number
  fetchedFromArxiv: number
  upserted: number
  errors: string[]
}

/** 限制单次任务每个分类最多入库 N 条，避免数据库暴涨 */
const MAX_PER_CATEGORY = 40
/** 只取近 N 年论文 */
const MIN_YEAR_GAP = 5

export async function crawlCategory(category: PaperCategory): Promise<CrawlResult> {
  const config = CATEGORY_MAP[category]
  const result: CrawlResult = {
    category,
    fetchedFromOpenAlex: 0,
    fetchedFromArxiv: 0,
    upserted: 0,
    errors: [],
  }

  const minYear = new Date().getFullYear() - MIN_YEAR_GAP
  const items: PaperInsert[] = []
  const seen = new Set<string>()

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

  if (items.length === 0) return result

  // 按引用数降序截断（OpenAlex 有引用数，arXiv 引用数=0 排最后是合理的）
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
    // 给外部 API 留点喘息时间
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  return results
}
