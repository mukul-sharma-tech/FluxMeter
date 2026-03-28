// types_db.ts (This is what's generated)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      lessons: {
        Row: {
          id: string
          created_at: string
          outline: string | null
          status: string
          content: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          outline?: string | null
          status?: string
          content?: string | null
        }
      }
      blogs: {
        Row: {
          id: string
          created_at: string
          keyword: string
          status: string
          content: string | null
          seo_score: number | null
          trend_score: number | null
          ai_suggestions: string | null
          attempts: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          keyword: string
          status?: string
          content?: string | null
          seo_score?: number | null
          trend_score?: number | null
          ai_suggestions?: string | null
          attempts?: number | null
        }
      }
    }
  }
}