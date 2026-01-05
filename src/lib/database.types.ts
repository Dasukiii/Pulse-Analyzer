// Supabase Database Types for Pulse Analyzer
// These types match the database schema

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
            // Departments table
            departments: {
                Row: {
                    id: string
                    name: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    created_at?: string
                }
            }

            // Surveys table
            surveys: {
                Row: {
                    id: string
                    name: string
                    date: string
                    status: 'draft' | 'active' | 'completed' | 'archived'
                    department_id: string | null
                    total_employees: number
                    response_count: number
                    engagement_score: number | null
                    enps: number | null
                    created_at: string
                    created_by: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    date: string
                    status?: 'draft' | 'active' | 'completed' | 'archived'
                    department_id?: string | null
                    total_employees: number
                    response_count?: number
                    engagement_score?: number | null
                    enps?: number | null
                    created_at?: string
                    created_by?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    date?: string
                    status?: 'draft' | 'active' | 'completed' | 'archived'
                    department_id?: string | null
                    total_employees?: number
                    response_count?: number
                    engagement_score?: number | null
                    enps?: number | null
                    created_at?: string
                    created_by?: string | null
                }
            }

            // Survey Questions table
            survey_questions: {
                Row: {
                    id: string
                    survey_id: string
                    question_text: string
                    question_type: 'rating' | 'text' | 'multiple_choice'
                    question_category: string | null
                    order_index: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    question_text: string
                    question_type: 'rating' | 'text' | 'multiple_choice'
                    question_category?: string | null
                    order_index: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    question_text?: string
                    question_type?: 'rating' | 'text' | 'multiple_choice'
                    question_category?: string | null
                    order_index?: number
                    created_at?: string
                }
            }

            // Survey Responses table
            survey_responses: {
                Row: {
                    id: string
                    survey_id: string
                    respondent_email: string | null
                    department_id: string | null
                    submitted_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    respondent_email?: string | null
                    department_id?: string | null
                    submitted_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    respondent_email?: string | null
                    department_id?: string | null
                    submitted_at?: string
                }
            }

            // Response Answers table
            response_answers: {
                Row: {
                    id: string
                    response_id: string
                    question_id: string
                    rating_value: number | null
                    text_value: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    response_id: string
                    question_id: string
                    rating_value?: number | null
                    text_value?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    response_id?: string
                    question_id?: string
                    rating_value?: number | null
                    text_value?: string | null
                    created_at?: string
                }
            }

            // AI-Detected Themes table
            themes: {
                Row: {
                    id: string
                    survey_id: string
                    name: string
                    frequency: number
                    sentiment: 'positive' | 'negative' | 'neutral'
                    sentiment_score: number
                    keywords: string[]
                    sample_quotes: string[]
                    created_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    name: string
                    frequency: number
                    sentiment: 'positive' | 'negative' | 'neutral'
                    sentiment_score: number
                    keywords?: string[]
                    sample_quotes?: string[]
                    created_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    name?: string
                    frequency?: number
                    sentiment?: 'positive' | 'negative' | 'neutral'
                    sentiment_score?: number
                    keywords?: string[]
                    sample_quotes?: string[]
                    created_at?: string
                }
            }

            // Narrative Highlights table
            narratives: {
                Row: {
                    id: string
                    survey_id: string
                    type: 'summary' | 'positive' | 'concern' | 'action'
                    title: string
                    content: string
                    priority: 'high' | 'medium' | 'low'
                    is_archived: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    type: 'summary' | 'positive' | 'concern' | 'action'
                    title: string
                    content: string
                    priority?: 'high' | 'medium' | 'low'
                    is_archived?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    type?: 'summary' | 'positive' | 'concern' | 'action'
                    title?: string
                    content?: string
                    priority?: 'high' | 'medium' | 'low'
                    is_archived?: boolean
                    created_at?: string
                }
            }

            // Key Indicators table
            indicators: {
                Row: {
                    id: string
                    survey_id: string
                    name: string
                    current_value: number
                    previous_value: number
                    target_value: number
                    trend: 'up' | 'down' | 'stable'
                    created_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    name: string
                    current_value: number
                    previous_value?: number
                    target_value?: number
                    trend?: 'up' | 'down' | 'stable'
                    created_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    name?: string
                    current_value?: number
                    previous_value?: number
                    target_value?: number
                    trend?: 'up' | 'down' | 'stable'
                    created_at?: string
                }
            }

            // Heatmap Data table
            heatmap_data: {
                Row: {
                    id: string
                    survey_id: string
                    department_id: string
                    question_id: string
                    score: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    survey_id: string
                    department_id: string
                    question_id: string
                    score: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    survey_id?: string
                    department_id?: string
                    question_id?: string
                    score?: number
                    created_at?: string
                }
            }

            // User Profiles table (extends Supabase auth.users)
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    role: 'admin' | 'manager' | 'viewer'
                    department_id: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    role?: 'admin' | 'manager' | 'viewer'
                    department_id?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    role?: 'admin' | 'manager' | 'viewer'
                    department_id?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            survey_status: 'draft' | 'active' | 'completed' | 'archived'
            question_type: 'rating' | 'text' | 'multiple_choice'
            sentiment_type: 'positive' | 'negative' | 'neutral'
            narrative_type: 'summary' | 'positive' | 'concern' | 'action'
            priority_level: 'high' | 'medium' | 'low'
            trend_direction: 'up' | 'down' | 'stable'
            user_role: 'admin' | 'manager' | 'viewer'
        }
    }
}

// Convenience type aliases
export type Department = Database['public']['Tables']['departments']['Row']
export type Survey = Database['public']['Tables']['surveys']['Row']
export type SurveyQuestion = Database['public']['Tables']['survey_questions']['Row']
export type SurveyResponse = Database['public']['Tables']['survey_responses']['Row']
export type ResponseAnswer = Database['public']['Tables']['response_answers']['Row']
export type Theme = Database['public']['Tables']['themes']['Row']
export type Narrative = Database['public']['Tables']['narratives']['Row']
export type Indicator = Database['public']['Tables']['indicators']['Row']
export type HeatmapData = Database['public']['Tables']['heatmap_data']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// Insert types
export type SurveyInsert = Database['public']['Tables']['surveys']['Insert']
export type ThemeInsert = Database['public']['Tables']['themes']['Insert']
export type NarrativeInsert = Database['public']['Tables']['narratives']['Insert']
