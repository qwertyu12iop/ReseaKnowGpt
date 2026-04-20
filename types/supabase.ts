export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PaperCategory =
  | 'ai'
  | 'systems'
  | 'algorithms'
  | 'network'
  | 'security'
  | 'theory'
  | 'database'
  | 'hci'

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
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
        Relationships: []
      }
      favorites: {
        Row: {
          id: number
          user_id: string
          item_type: 'literature' | 'conversation' | 'workshop_tool' | 'paper_catalog'
          item_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          item_type: 'literature' | 'conversation' | 'workshop_tool' | 'paper_catalog'
          item_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          note?: string | null
        }
        Relationships: []
      }
      paper_catalog: {
        Row: {
          id: number
          external_id: string
          source: 'openalex' | 'arxiv' | 'semantic_scholar'
          title: string
          authors: string[]
          abstract: string | null
          year: number | null
          venue: string | null
          doi: string | null
          url: string
          pdf_url: string | null
          category: PaperCategory
          tags: string[]
          cited_by_count: number
          is_open_access: boolean
          fetched_at: string
          created_at: string
        }
        Insert: {
          external_id: string
          source: 'openalex' | 'arxiv' | 'semantic_scholar'
          title: string
          authors?: string[]
          abstract?: string | null
          year?: number | null
          venue?: string | null
          doi?: string | null
          url: string
          pdf_url?: string | null
          category: PaperCategory
          tags?: string[]
          cited_by_count?: number
          is_open_access?: boolean
          fetched_at?: string
          created_at?: string
        }
        Update: {
          title?: string
          authors?: string[]
          abstract?: string | null
          year?: number | null
          venue?: string | null
          doi?: string | null
          url?: string
          pdf_url?: string | null
          category?: PaperCategory
          tags?: string[]
          cited_by_count?: number
          is_open_access?: boolean
          fetched_at?: string
        }
        Relationships: []
      }
      paper_summary: {
        Row: {
          paper_id: number
          summary_zh: string | null
          summary_en: string | null
          key_points: Json
          model: string | null
          generated_at: string
        }
        Insert: {
          paper_id: number
          summary_zh?: string | null
          summary_en?: string | null
          key_points?: Json
          model?: string | null
          generated_at?: string
        }
        Update: {
          summary_zh?: string | null
          summary_en?: string | null
          key_points?: Json
          model?: string | null
          generated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
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
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
