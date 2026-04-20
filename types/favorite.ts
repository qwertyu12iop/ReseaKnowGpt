import type { PaperCategory } from '@/types/paper'

export type FavoriteItemType = 'paper_catalog' | 'conversation' | 'workshop_tool'

export interface FavoriteRecord {
  id: number
  itemType: FavoriteItemType
  itemId: string
  note: string | null
  createdAt: string
}

export interface FavoritePaperDetail {
  kind: 'paper_catalog'
  title: string
  authors: string[]
  abstract: string | null
  year: number | null
  venue: string | null
  url: string
  pdfUrl: string | null
  source: 'openalex' | 'arxiv' | 'semantic_scholar'
  category: PaperCategory
  tags: string[]
  citedByCount: number
  isOpenAccess: boolean
}

export interface FavoriteConversationDetail {
  kind: 'conversation'
  title: string
  mode: 'theory' | 'technical'
  updatedAt: string
}

export interface FavoriteWorkshopDetail {
  kind: 'workshop_tool'
  title: string
}

export type FavoriteDetail =
  | FavoritePaperDetail
  | FavoriteConversationDetail
  | FavoriteWorkshopDetail

export interface FavoriteEntry extends FavoriteRecord {
  detail: FavoriteDetail | null
}

export interface FavoriteListResponse {
  items: FavoriteEntry[]
  total: number
}

export interface FavoriteKey {
  itemType: FavoriteItemType
  itemId: string
}
