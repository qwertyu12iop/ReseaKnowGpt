export type ChatMode = 'theory' | 'technical'

export interface Source {
  id: string
  title: string
  authors: string[]
  year: number | null
  venue: string | null
  doi: string | null
  url: string
  citedByCount?: number
  isOpenAccess?: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: ChatMode
  timestamp: Date
  sources?: Source[]
  /** assistant 消息流式结束后，正在异步检索文献时为 true */
  sourcesLoading?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  mode: ChatMode
  createdAt: Date
}
