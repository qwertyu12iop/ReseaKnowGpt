import type { PaperCategory } from '@/types/supabase'

export type { PaperCategory }

export interface Paper {
  id: number
  externalId: string
  source: 'openalex' | 'arxiv' | 'semantic_scholar'
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  venue: string | null
  doi: string | null
  url: string
  pdfUrl: string | null
  category: PaperCategory
  tags: string[]
  citedByCount: number
  isOpenAccess: boolean
  hasSummary?: boolean
}

export interface PaperKeyPoint {
  title: string
  content: string
}

export interface PaperSummary {
  paperId: number
  summaryZh: string | null
  summaryEn: string | null
  keyPoints: PaperKeyPoint[]
  model: string | null
  generatedAt: string
}

export interface PaperListQuery {
  category?: PaperCategory | 'all'
  search?: string
  page?: number
  pageSize?: number
  sort?: 'citations' | 'year' | 'recent'
}

export interface PaperListResponse {
  items: Paper[]
  total: number
  page: number
  pageSize: number
}
