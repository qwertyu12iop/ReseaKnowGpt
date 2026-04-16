export type ChatMode = 'theory' | 'technical'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: ChatMode
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  mode: ChatMode
  createdAt: Date
}
