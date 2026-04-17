export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string | null
          avatar_url: string | null
          bio: string | null
          institution: string | null
          research_field: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          institution?: string | null
          research_field?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string | null
          avatar_url?: string | null
          bio?: string | null
          institution?: string | null
          research_field?: string | null
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          mode: 'theory' | 'technical'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          mode?: 'theory' | 'technical'
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          mode?: 'theory' | 'technical'
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: number
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          mode: 'theory' | 'technical'
          sources: Json
          created_at: string
        }
        Insert: {
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          mode?: 'theory' | 'technical'
          sources?: Json
          created_at?: string
        }
        Update: {
          content?: string
          sources?: Json
        }
      }
      literature: {
        Row: {
          id: number
          user_id: string
          title: string
          authors: string[]
          abstract: string | null
          tags: string[]
          file_path: string | null
          file_size: number | null
          page_count: number | null
          status: 'pending' | 'processing' | 'ready' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          authors?: string[]
          abstract?: string | null
          tags?: string[]
          file_path?: string | null
          file_size?: number | null
          page_count?: number | null
          status?: 'pending' | 'processing' | 'ready' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          authors?: string[]
          abstract?: string | null
          tags?: string[]
          file_path?: string | null
          file_size?: number | null
          page_count?: number | null
          status?: 'pending' | 'processing' | 'ready' | 'error'
          updated_at?: string
        }
      }
      document_chunks: {
        Row: {
          id: number
          literature_id: number
          content: string
          metadata: Json
          embedding: string | null
          created_at: string
        }
        Insert: {
          literature_id: number
          content: string
          metadata?: Json
          embedding?: string | null
          created_at?: string
        }
        Update: {
          content?: string
          metadata?: Json
          embedding?: string | null
        }
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          item_type: 'literature' | 'conversation' | 'workshop_tool'
          item_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          item_type: 'literature' | 'conversation' | 'workshop_tool'
          item_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          note?: string | null
        }
      }
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: string
          match_threshold?: number
          match_count?: number
          filter_literature_id?: number | null
        }
        Returns: {
          id: number
          content: string
          metadata: Json
          literature_id: number
          similarity: number
        }[]
      }
    }
  }
}
