// Database service for Pulse Analyzer
// Handles all Supabase database operations

import { supabase, isSupabaseConfigured } from '../lib/supabase'

// =============================================
// TYPE DEFINITIONS (simplified for flexibility)
// =============================================

export interface Survey {
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

export interface Theme {
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

export interface Narrative {
    id: string
    survey_id: string
    type: 'summary' | 'positive' | 'concern' | 'action'
    title: string
    content: string
    priority: 'high' | 'medium' | 'low'
    is_archived: boolean
    created_at: string
}

export interface Indicator {
    id: string
    survey_id: string
    name: string
    current_value: number
    previous_value: number
    target_value: number
    trend: 'up' | 'down' | 'stable'
    created_at: string
}

export interface Department {
    id: string
    name: string
    created_at: string
}

// =============================================
// SURVEYS
// =============================================

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
}

export async function getSurveys(): Promise<Survey[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    const userId = await getCurrentUserId()
    if (!userId) {
        console.warn('No authenticated user - returning empty surveys')
        return []
    }

    const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('created_by', userId)
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching surveys:', error)
        throw error
    }

    return (data as Survey[]) || []
}

export async function getSurveyById(id: string): Promise<Survey | null> {
    if (!isSupabaseConfigured()) {
        return null
    }

    const userId = await getCurrentUserId()
    if (!userId) {
        console.warn('No authenticated user - cannot fetch survey')
        return null
    }

    const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .eq('created_by', userId)
        .single()

    if (error) {
        console.error('Error fetching survey:', error)
        return null
    }

    return data as Survey
}

export async function createSurvey(survey: Partial<Survey>): Promise<Survey | null> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot create survey.')
        return null
    }

    const { data, error } = await supabase
        .from('surveys')
        .insert(survey as never)
        .select()
        .single()

    if (error) {
        console.error('Error creating survey:', error)
        throw error
    }

    return data as Survey
}

export async function updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey | null> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot update survey.')
        return null
    }

    const { data, error } = await supabase
        .from('surveys')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating survey:', error)
        throw error
    }

    return data as Survey
}

export async function deleteSurvey(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot delete survey.')
        return false
    }

    const userId = await getCurrentUserId()
    if (!userId) {
        console.warn('No authenticated user - cannot delete survey')
        return false
    }

    const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id)
        .eq('created_by', userId)

    if (error) {
        console.error('Error deleting survey:', error)
        throw error
    }

    return true
}

// =============================================
// THEMES
// =============================================

export async function getThemesBySurveyId(surveyId: string): Promise<Theme[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('survey_id', surveyId)
        .order('frequency', { ascending: false })

    if (error) {
        console.error('Error fetching themes:', error)
        throw error
    }

    return (data as Theme[]) || []
}

export async function saveThemes(surveyId: string, themes: Partial<Theme>[]): Promise<Theme[]> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot save themes.')
        return []
    }

    // First, delete existing themes for this survey
    await supabase
        .from('themes')
        .delete()
        .eq('survey_id', surveyId)

    // Insert new themes
    const themesWithSurveyId = themes.map(t => ({
        ...t,
        survey_id: surveyId
    }))

    const { data, error } = await supabase
        .from('themes')
        .insert(themesWithSurveyId as never)
        .select()

    if (error) {
        console.error('Error saving themes:', error)
        throw error
    }

    return (data as Theme[]) || []
}

// =============================================
// NARRATIVES
// =============================================

export async function getNarrativesBySurveyId(surveyId: string): Promise<Narrative[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    const { data, error } = await supabase
        .from('narratives')
        .select('*')
        .eq('survey_id', surveyId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching narratives:', error)
        throw error
    }

    return (data as Narrative[]) || []
}

export async function saveNarratives(surveyId: string, narratives: Partial<Narrative>[]): Promise<Narrative[]> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot save narratives.')
        return []
    }

    // First, delete existing narratives for this survey
    await supabase
        .from('narratives')
        .delete()
        .eq('survey_id', surveyId)

    // Insert new narratives
    const narrativesWithSurveyId = narratives.map(n => ({
        ...n,
        survey_id: surveyId
    }))

    const { data, error } = await supabase
        .from('narratives')
        .insert(narrativesWithSurveyId as never)
        .select()

    if (error) {
        console.error('Error saving narratives:', error)
        throw error
    }

    return (data as Narrative[]) || []
}

export async function archiveNarrative(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured. Cannot archive narrative.')
        return
    }

    const { error } = await supabase
        .from('narratives')
        .update({ is_archived: true } as never)
        .eq('id', id)

    if (error) {
        console.error('Error archiving narrative:', error)
        throw error
    }
}

// =============================================
// INDICATORS
// =============================================

export async function getIndicatorsBySurveyId(surveyId: string): Promise<Indicator[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    const { data, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('survey_id', surveyId)

    if (error) {
        console.error('Error fetching indicators:', error)
        throw error
    }

    return (data as Indicator[]) || []
}

// =============================================
// DEPARTMENTS
// =============================================

export async function getDepartments(): Promise<Department[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching departments:', error)
        throw error
    }

    return (data as Department[]) || []
}

// =============================================
// HEATMAP DATA
// =============================================

export interface HeatmapResult {
    departments: string[]
    questions: string[]
    values: number[][]
}

export async function getHeatmapData(surveyId: string): Promise<HeatmapResult> {
    if (!isSupabaseConfigured()) {
        return { departments: [], questions: [], values: [] }
    }

    try {
        // Get heatmap data for this survey
        const { data: heatmapData, error } = await supabase
            .from('heatmap_data')
            .select(`
                score,
                departments (name),
                survey_questions (question_text)
            `)
            .eq('survey_id', surveyId)

        if (error || !heatmapData || heatmapData.length === 0) {
            console.log('No heatmap data found for survey:', surveyId)
            return { departments: [], questions: [], values: [] }
        }

        // Extract unique departments and questions
        const deptSet = new Set<string>()
        const questionSet = new Set<string>()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        heatmapData.forEach((item: any) => {
            const deptName = item.departments?.name
            const questionText = item.survey_questions?.question_text
            if (deptName) deptSet.add(deptName)
            if (questionText) questionSet.add(questionText)
        })

        const departments = Array.from(deptSet)
        const questions = Array.from(questionSet)

        // Build the values matrix
        const values: number[][] = departments.map(dept =>
            questions.map(q => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const item = heatmapData.find((h: any) =>
                    h.departments?.name === dept && h.survey_questions?.question_text === q
                )
                return item?.score || 0
            })
        )

        return { departments, questions, values }
    } catch (err) {
        console.error('Error fetching heatmap data:', err)
        return { departments: [], questions: [], values: [] }
    }
}

// =============================================
// OPEN-ENDED RESPONSES (for AI analysis)
// =============================================

export async function getOpenEndedResponses(surveyId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
        return []
    }

    try {
        // Get open-ended (text) responses from the database
        const { data: responses, error } = await supabase
            .from('response_answers')
            .select(`
                text_value,
                survey_responses!inner (survey_id)
            `)
            .eq('survey_responses.survey_id', surveyId)
            .not('text_value', 'is', null)
            .neq('text_value', '')

        if (error || !responses) {
            console.error('Error fetching open-ended responses:', error)
            return []
        }

        return responses
            .map((r: { text_value: string | null }) => r.text_value)
            .filter((text): text is string => !!text && text.trim().length > 0)
    } catch (err) {
        console.error('Error fetching open-ended responses:', err)
        return []
    }
}

// =============================================
// DASHBOARD STATS
// =============================================

export interface DashboardStats {
    engagementScore: number
    engagementChange: number
    eNPS: number
    eNPSChange: number
    responseRate: number
    responseRateChange: number
    totalResponses: number
    totalEmployees: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
    if (!isSupabaseConfigured()) {
        return {
            engagementScore: 0,
            engagementChange: 0,
            eNPS: 0,
            eNPSChange: 0,
            responseRate: 0,
            responseRateChange: 0,
            totalResponses: 0,
            totalEmployees: 0
        }
    }

    const userId = await getCurrentUserId()
    if (!userId) {
        return {
            engagementScore: 0,
            engagementChange: 0,
            eNPS: 0,
            eNPSChange: 0,
            responseRate: 0,
            responseRateChange: 0,
            totalResponses: 0,
            totalEmployees: 0
        }
    }

    // Get the most recent completed survey for this user
    const { data: surveys } = await supabase
        .from('surveys')
        .select('*')
        .eq('created_by', userId)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(2)

    if (!surveys || surveys.length === 0) {
        return {
            engagementScore: 0,
            engagementChange: 0,
            eNPS: 0,
            eNPSChange: 0,
            responseRate: 0,
            responseRateChange: 0,
            totalResponses: 0,
            totalEmployees: 0
        }
    }

    const latestSurvey = surveys[0] as Survey
    const previousSurvey = surveys[1] as Survey | undefined

    const responseRate = latestSurvey.total_employees > 0
        ? (latestSurvey.response_count / latestSurvey.total_employees) * 100
        : 0

    const prevResponseRate = previousSurvey && previousSurvey.total_employees > 0
        ? (previousSurvey.response_count / previousSurvey.total_employees) * 100
        : 0

    return {
        engagementScore: latestSurvey.engagement_score || 0,
        engagementChange: (latestSurvey.engagement_score || 0) - (previousSurvey?.engagement_score || 0),
        eNPS: latestSurvey.enps || 0,
        eNPSChange: (latestSurvey.enps || 0) - (previousSurvey?.enps || 0),
        responseRate: Math.round(responseRate * 10) / 10,
        responseRateChange: Math.round((responseRate - prevResponseRate) * 10) / 10,
        totalResponses: latestSurvey.response_count,
        totalEmployees: latestSurvey.total_employees
    }
}
