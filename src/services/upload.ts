// File Upload Service for Pulse Analyzer
// Handles CSV/Excel parsing and database storage

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { detectThemes, generateNarrativeHighlights, hasApiKey, type DetectedTheme, type SurveyMetrics } from './openai'
import { saveThemes, saveNarratives } from './database'

export interface ParsedRow {
    timestamp: string
    email?: string
    department?: string
    overallSatisfaction?: number
    workLifeBalance?: number
    careerGrowth?: number
    management?: number
    compensation?: number
    workEnvironment?: number
    teamCollaboration?: number
    recognition?: number
    communication?: number
    openFeedback?: string
    [key: string]: string | number | undefined
}

export interface ColumnMapping {
    sourceColumn: string
    targetField: string
    detected: boolean
}

export interface UploadResult {
    success: boolean
    surveyId?: string
    error?: string
    rowCount: number
    departments: string[]
    aiGenerated?: {
        themes: boolean
        narratives: boolean
    }
}

// Parse CSV text into rows
export function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
    const lines = csvText.trim().split('\n')
    const headers = parseCSVLine(lines[0])
    const rows = lines.slice(1).map(line => parseCSVLine(line))
    return { headers, rows: rows.filter(row => row.length > 0 && row.some(cell => cell.trim())) }
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
        const char = line[i]

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    result.push(current.trim())

    return result
}

// Auto-detect column mappings based on column names
export function autoDetectColumns(headers: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = []

    const fieldPatterns: { field: string, patterns: RegExp[] }[] = [
        { field: 'timestamp', patterns: [/timestamp/i, /date/i, /time/i, /submitted/i, /created/i] },
        { field: 'email', patterns: [/email/i, /e-mail/i, /mail/i] },
        { field: 'department', patterns: [/department/i, /dept/i, /team/i, /division/i, /group/i] },
        { field: 'overallSatisfaction', patterns: [/overall/i, /satisfaction/i, /general/i] },
        { field: 'workLifeBalance', patterns: [/work.?life/i, /wlb/i, /balance/i, /life.?work/i] },
        { field: 'careerGrowth', patterns: [/career/i, /growth/i, /development/i, /advancement/i] },
        { field: 'management', patterns: [/management/i, /manager/i, /leadership/i, /supervisor/i] },
        { field: 'compensation', patterns: [/compensation/i, /salary/i, /pay/i, /comp\b/i, /benefits/i] },
        { field: 'workEnvironment', patterns: [/environment/i, /workplace/i, /office/i, /facility/i] },
        { field: 'teamCollaboration', patterns: [/team/i, /collaboration/i, /teamwork/i, /colleagues/i] },
        { field: 'recognition', patterns: [/recognition/i, /appreciate/i, /reward/i, /acknowledge/i] },
        { field: 'communication', patterns: [/communication/i, /transparency/i, /inform/i] },
        { field: 'openFeedback', patterns: [/feedback/i, /comment/i, /open/i, /additional/i, /suggestion/i, /thoughts/i] },
    ]

    for (const header of headers) {
        let detected = false
        let targetField = ''

        for (const { field, patterns } of fieldPatterns) {
            if (patterns.some(p => p.test(header))) {
                // Check if already mapped
                if (!mappings.some(m => m.targetField === field)) {
                    targetField = field
                    detected = true
                    break
                }
            }
        }

        mappings.push({
            sourceColumn: header,
            targetField: targetField || 'skip',
            detected
        })
    }

    return mappings
}

// Convert row data using column mappings
export function mapRowData(row: string[], headers: string[], mappings: ColumnMapping[]): ParsedRow {
    const result: ParsedRow = { timestamp: new Date().toISOString() }

    for (let i = 0; i < headers.length; i++) {
        const mapping = mappings.find(m => m.sourceColumn === headers[i])
        if (!mapping || mapping.targetField === 'skip') continue

        const value = row[i]

        // Parse numeric fields
        if (['overallSatisfaction', 'workLifeBalance', 'careerGrowth', 'management',
            'compensation', 'workEnvironment', 'teamCollaboration', 'recognition',
            'communication'].includes(mapping.targetField)) {
            const numValue = parseFloat(value)
            if (!isNaN(numValue)) {
                result[mapping.targetField] = numValue
            }
        } else {
            result[mapping.targetField] = value
        }
    }

    return result
}

// Calculate statistics from parsed data
export function calculateSurveyStats(data: ParsedRow[]): {
    responseCount: number
    engagementScore: number
    eNPS: number
    departments: string[]
} {
    const departments = [...new Set(data.map(r => r.department).filter(Boolean))] as string[]

    // Calculate engagement score (average of all numeric ratings)
    let totalScores = 0
    let scoreCount = 0

    for (const row of data) {
        const numericFields = [
            row.overallSatisfaction, row.workLifeBalance, row.careerGrowth,
            row.management, row.compensation, row.workEnvironment,
            row.teamCollaboration, row.recognition, row.communication
        ].filter(v => typeof v === 'number') as number[]

        for (const score of numericFields) {
            // Normalize to 0-100 scale (assuming 1-5 or 1-10 scale)
            const normalized = score <= 5 ? (score / 5) * 100 : (score / 10) * 100
            totalScores += normalized
            scoreCount++
        }
    }

    const engagementScore = scoreCount > 0 ? Math.round(totalScores / scoreCount) : 0

    // Calculate eNPS based on overall satisfaction
    // Assume scale 0-10: Promoters 9-10, Passives 7-8, Detractors 0-6
    let promoters = 0
    let detractors = 0

    for (const row of data) {
        const score = row.overallSatisfaction
        if (typeof score !== 'number') continue

        // Normalize to 10-point scale
        const normalized = score <= 5 ? score * 2 : score

        if (normalized >= 9) promoters++
        else if (normalized <= 6) detractors++
    }

    const eNPS = data.length > 0
        ? Math.round(((promoters - detractors) / data.length) * 100)
        : 0

    return {
        responseCount: data.length,
        engagementScore,
        eNPS,
        departments
    }
}

// Upload survey data to Supabase
export async function uploadSurveyToDatabase(
    name: string,
    date: string,
    data: ParsedRow[],
    totalEmployees: number
): Promise<UploadResult> {
    if (!isSupabaseConfigured()) {
        // In demo mode, just return success with mock data
        return {
            success: true,
            surveyId: 'demo-' + Date.now(),
            rowCount: data.length,
            departments: [...new Set(data.map(r => r.department).filter(Boolean))] as string[]
        }
    }

    const stats = calculateSurveyStats(data)

    try {
        // 1. Create the survey record
        // Note: response_count is set to 0 here because the database trigger
        // will automatically increment it for each survey_response inserted
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return {
                success: false,
                error: 'No authenticated user',
                rowCount: 0,
                departments: []
            }
        }

        const { data: survey, error: surveyError } = await supabase
            .from('surveys')
            .insert({
                name,
                date,
                status: 'completed',
                total_employees: totalEmployees,
                response_count: 0,
                engagement_score: stats.engagementScore,
                enps: stats.eNPS,
                created_by: user.id
            })
            .select()
            .single()

        if (surveyError || !survey) {
            return {
                success: false,
                error: surveyError?.message || 'Failed to create survey',
                rowCount: 0,
                departments: []
            }
        }

        // 2. Ensure departments exist
        const departmentMap = new Map<string, string>()

        for (const deptName of stats.departments) {
            // Check if department exists
            const { data: existing } = await supabase
                .from('departments')
                .select('id')
                .eq('name', deptName)
                .single()

            if (existing) {
                departmentMap.set(deptName, existing.id)
            } else {
                // Create new department
                const { data: newDept } = await supabase
                    .from('departments')
                    .insert({ name: deptName })
                    .select()
                    .single()

                if (newDept) {
                    departmentMap.set(deptName, newDept.id)
                }
            }
        }

        // 3. Create survey questions (simplified - using predefined questions)
        const questionFields = [
            { field: 'overallSatisfaction', text: 'How satisfied are you overall?', category: 'Overall' },
            { field: 'workLifeBalance', text: 'How is your work-life balance?', category: 'Work-Life' },
            { field: 'careerGrowth', text: 'How satisfied are you with career growth opportunities?', category: 'Career' },
            { field: 'management', text: 'How would you rate your management?', category: 'Leadership' },
            { field: 'compensation', text: 'How satisfied are you with compensation?', category: 'Comp' },
            { field: 'workEnvironment', text: 'How is the work environment?', category: 'Environment' },
            { field: 'teamCollaboration', text: 'How well does your team collaborate?', category: 'Team' },
            { field: 'recognition', text: 'Do you feel recognized for your work?', category: 'Recognition' },
            { field: 'communication', text: 'How is communication in the organization?', category: 'Communication' },
        ]

        const questionMap = new Map<string, string>()

        for (let i = 0; i < questionFields.length; i++) {
            const q = questionFields[i]
            const { data: question } = await supabase
                .from('survey_questions')
                .insert({
                    survey_id: survey.id,
                    question_text: q.text,
                    question_type: 'rating',
                    question_category: q.category,
                    order_index: i + 1
                })
                .select()
                .single()

            if (question) {
                questionMap.set(q.field, question.id)
            }
        }

        // Add open feedback question
        const { data: feedbackQuestion } = await supabase
            .from('survey_questions')
            .insert({
                survey_id: survey.id,
                question_text: 'Any additional feedback?',
                question_type: 'text',
                question_category: 'Feedback',
                order_index: 10
            })
            .select()
            .single()

        if (feedbackQuestion) {
            questionMap.set('openFeedback', feedbackQuestion.id)
        }

        // 4. Insert responses and answers
        for (const row of data) {
            const departmentId = row.department ? departmentMap.get(row.department) : null

            // Create response record
            const { data: response } = await supabase
                .from('survey_responses')
                .insert({
                    survey_id: survey.id,
                    respondent_email: row.email || null,
                    department_id: departmentId,
                    submitted_at: row.timestamp
                })
                .select()
                .single()

            if (!response) continue

            // Create answer records
            const answers = []

            for (const [field, questionId] of questionMap) {
                const value = row[field]
                if (value === undefined) continue

                if (field === 'openFeedback') {
                    answers.push({
                        response_id: response.id,
                        question_id: questionId,
                        text_value: String(value)
                    })
                } else if (typeof value === 'number') {
                    answers.push({
                        response_id: response.id,
                        question_id: questionId,
                        rating_value: value
                    })
                }
            }

            if (answers.length > 0) {
                await supabase.from('response_answers').insert(answers)
            }
        }

        // 5. Calculate and store heatmap data
        for (const [deptName, deptId] of departmentMap) {
            for (const [field, questionId] of questionMap) {
                // Skip non-numeric fields (like openFeedback)
                if (field === 'openFeedback') continue

                // Calculate average score for this department/question combination
                const deptResponses = data.filter(r => r.department === deptName)
                const scores = deptResponses
                    .map(r => r[field])
                    .filter((v): v is number => typeof v === 'number')

                if (scores.length > 0) {
                    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
                    // Normalize to 0-100
                    const normalizedScore = avgScore <= 5 ? (avgScore / 5) * 100 : (avgScore / 10) * 100

                    const { error: heatmapError } = await supabase.from('heatmap_data').insert({
                        survey_id: survey.id,
                        department_id: deptId,
                        question_id: questionId,
                        score: Math.round(normalizedScore)
                    })

                    if (heatmapError) {
                        console.error('Error inserting heatmap data:', heatmapError)
                    }
                }
            }
        }

        // 6. Create indicators from survey stats
        const indicatorsToCreate = [
            {
                survey_id: survey.id,
                name: 'Engagement Score',
                current_value: stats.engagementScore,
                previous_value: 0,
                target_value: 80,
                trend: stats.engagementScore >= 75 ? 'up' : stats.engagementScore >= 60 ? 'stable' : 'down'
            },
            {
                survey_id: survey.id,
                name: 'Response Rate',
                current_value: totalEmployees > 0 ? Math.round((stats.responseCount / totalEmployees) * 100) : 0,
                previous_value: 0,
                target_value: 90,
                trend: 'stable'
            },
            {
                survey_id: survey.id,
                name: 'eNPS',
                current_value: stats.eNPS,
                previous_value: 0,
                target_value: 50,
                trend: stats.eNPS >= 30 ? 'up' : stats.eNPS >= 0 ? 'stable' : 'down'
            }
        ]

        for (const indicator of indicatorsToCreate) {
            const { error: indicatorError } = await supabase.from('indicators').insert(indicator)
            if (indicatorError) {
                console.error('Error inserting indicator:', indicatorError)
            }
        }

        // 7. Auto-generate AI themes and narratives if API key is configured
        let aiGenerated = { themes: false, narratives: false }

        if (hasApiKey()) {
            try {
                // Get open-ended responses for theme detection
                const openFeedbacks = data
                    .map(row => row.openFeedback)
                    .filter((text): text is string => !!text && text.trim().length > 0)

                if (openFeedbacks.length > 0) {
                    console.log('[Upload] Auto-generating themes from', openFeedbacks.length, 'responses...')

                    // Detect themes
                    const detectedThemes = await detectThemes(openFeedbacks)

                    // Save themes to database
                    const themesToSave = detectedThemes.map((t: DetectedTheme) => ({
                        name: t.name,
                        frequency: t.frequency,
                        sentiment: t.sentiment,
                        sentiment_score: t.sentimentScore,
                        keywords: t.keywords,
                        sample_quotes: t.sampleQuotes
                    }))

                    await saveThemes(survey.id, themesToSave)
                    console.log('[Upload] Saved', themesToSave.length, 'themes')
                    aiGenerated.themes = true

                    // Generate narrative highlights
                    console.log('[Upload] Auto-generating narrative highlights...')

                    const metrics: SurveyMetrics = {
                        engagementScore: stats.engagementScore,
                        previousEngagementScore: 0,
                        eNPS: stats.eNPS,
                        previousENPS: 0,
                        responseRate: totalEmployees > 0
                            ? (stats.responseCount / totalEmployees) * 100
                            : 0,
                        totalResponses: stats.responseCount,
                        themes: detectedThemes
                    }

                    const narratives = await generateNarrativeHighlights(metrics)

                    // Save narratives to database
                    const narrativesToSave = narratives.map(n => ({
                        type: n.type,
                        title: n.title,
                        content: n.content,
                        priority: n.priority
                    }))

                    await saveNarratives(survey.id, narrativesToSave)
                    console.log('[Upload] Saved', narrativesToSave.length, 'narratives')
                    aiGenerated.narratives = true
                }
            } catch (aiError) {
                // Don't fail the upload if AI generation fails
                console.error('[Upload] AI generation failed (non-critical):', aiError)
            }
        } else {
            console.log('[Upload] Skipping AI generation - no API key configured')
        }

        return {
            success: true,
            surveyId: survey.id,
            rowCount: data.length,
            departments: stats.departments,
            aiGenerated
        }

    } catch (error) {
        console.error('Error uploading survey:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            rowCount: 0,
            departments: []
        }
    }
}

// Generate sample CSV for download
export function generateSampleCSV(): string {
    const headers = [
        'Timestamp',
        'Email',
        'Department',
        'Overall Satisfaction (1-5)',
        'Work-Life Balance (1-5)',
        'Career Growth (1-5)',
        'Management (1-5)',
        'Compensation (1-5)',
        'Work Environment (1-5)',
        'Team Collaboration (1-5)',
        'Recognition (1-5)',
        'Communication (1-5)',
        'Open Feedback'
    ]

    const sampleData = [
        ['2025-01-15 10:30:00', 'john.doe@company.com', 'Engineering', '4', '3', '4', '5', '3', '4', '5', '4', '4', 'Great team collaboration!'],
        ['2025-01-15 11:15:00', 'jane.smith@company.com', 'Product', '5', '4', '5', '5', '4', '5', '5', '5', '4', 'Love the company culture'],
        ['2025-01-15 12:00:00', 'bob.wilson@company.com', 'Engineering', '3', '2', '3', '4', '2', '3', '4', '3', '3', 'Need better work-life balance'],
        ['2025-01-15 13:30:00', 'alice.johnson@company.com', 'Design', '4', '4', '3', '4', '3', '4', '4', '4', '4', 'Would appreciate more career development'],
        ['2025-01-15 14:45:00', 'charlie.brown@company.com', 'Marketing', '4', '3', '4', '3', '3', '4', '4', '3', '4', 'Communication could be improved'],
    ]

    return [
        headers.join(','),
        ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
}
