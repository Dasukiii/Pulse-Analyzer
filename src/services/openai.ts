// OpenAI API Service for Pulse Analyzer
// Uses GPT-4o-mini for cost-effective AI analysis

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Get API key from environment or localStorage
const getApiKey = (): string | null => {
    // Check localStorage first (for runtime configuration)
    const storedKey = localStorage.getItem('openai_api_key')
    if (storedKey) return storedKey

    // Check environment variable (for build-time configuration)
    return import.meta.env.VITE_OPENAI_API_KEY || null
}

// Set API key in localStorage
export const setApiKey = (key: string) => {
    localStorage.setItem('openai_api_key', key)
}

// Check if API key is configured
export const hasApiKey = (): boolean => {
    return !!getApiKey()
}

// Generic OpenAI API call
async function callOpenAI(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
    const apiKey = getApiKey()

    if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please set your API key in settings.')
    }

    const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature,
            max_tokens: 2000
        })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()
    return data.choices[0].message.content
}

// Theme Detection from open-ended survey responses
export interface DetectedTheme {
    name: string
    frequency: number
    sentiment: 'positive' | 'negative' | 'neutral'
    sentimentScore: number
    sampleQuotes: string[]
    keywords: string[]
}

export async function detectThemes(responses: string[]): Promise<DetectedTheme[]> {
    const prompt = `You are an HR analytics expert. Analyze the following employee survey open-ended responses and identify the main themes.

RESPONSES:
${responses.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Identify 3-5 key themes from these responses. For each theme, provide:
1. Theme name (concise, 2-4 words)
2. How many responses mention this theme (frequency)
3. Overall sentiment (positive, negative, or neutral)
4. Sentiment score (0-100, where 100 is most positive)
5. 2-3 sample quotes that represent this theme
6. Key keywords associated with this theme

Return ONLY valid JSON in this exact format:
{
  "themes": [
    {
      "name": "Theme Name",
      "frequency": 12,
      "sentiment": "positive",
      "sentimentScore": 75,
      "sampleQuotes": ["quote 1", "quote 2"],
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}`

    const result = await callOpenAI([
        { role: 'system', content: 'You are an expert HR analytics AI. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ], 0.3)

    try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')

        const parsed = JSON.parse(jsonMatch[0])
        return parsed.themes
    } catch (e) {
        console.error('Failed to parse theme detection response:', e)
        throw new Error('Failed to parse AI response for theme detection')
    }
}

// Generate Executive Summary / Narrative Highlights
export interface NarrativeInsight {
    type: 'summary' | 'positive' | 'concern' | 'action'
    title: string
    content: string
    priority: 'high' | 'medium' | 'low'
}

export interface SurveyMetrics {
    engagementScore: number
    previousEngagementScore: number
    eNPS: number
    previousENPS: number
    responseRate: number
    totalResponses: number
    themes: DetectedTheme[]
}

export async function generateNarrativeHighlights(metrics: SurveyMetrics): Promise<NarrativeInsight[]> {
    const prompt = `You are an HR analytics expert writing an executive summary for leadership.

SURVEY METRICS:
- Engagement Score: ${metrics.engagementScore}% (previous: ${metrics.previousEngagementScore}%)
- eNPS: ${metrics.eNPS} (previous: ${metrics.previousENPS})
- Response Rate: ${metrics.responseRate}%
- Total Responses: ${metrics.totalResponses}

TOP THEMES DETECTED:
${metrics.themes.map(t => `- ${t.name}: ${t.frequency} mentions, ${t.sentiment} sentiment (${t.sentimentScore}%)`).join('\n')}

Generate 4-5 narrative insights for HR leadership. Include:
1. An executive summary of overall findings
2. 1-2 positive highlights (wins/strengths)
3. 1-2 areas of concern requiring attention
4. 1-2 recommended actions based on the data

Return ONLY valid JSON:
{
  "insights": [
    {
      "type": "summary",
      "title": "Q4 2025 Survey Executive Summary",
      "content": "Detailed summary paragraph...",
      "priority": "high"
    },
    {
      "type": "positive",
      "title": "Strong Leadership Trust",
      "content": "Description of positive finding...",
      "priority": "medium"
    },
    {
      "type": "concern",
      "title": "Work-Life Balance Declining",
      "content": "Description of concern...",
      "priority": "high"
    },
    {
      "type": "action",
      "title": "Recommended: Implement Meeting-Free Days",
      "content": "Detailed recommendation...",
      "priority": "high"
    }
  ]
}`

    const result = await callOpenAI([
        { role: 'system', content: 'You are an expert HR analytics AI providing executive-level insights. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ], 0.5)

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')

        const parsed = JSON.parse(jsonMatch[0])
        return parsed.insights
    } catch (e) {
        console.error('Failed to parse narrative generation response:', e)
        throw new Error('Failed to parse AI response for narrative generation')
    }
}

// Sentiment Analysis for individual responses
export interface SentimentResult {
    sentiment: 'positive' | 'negative' | 'neutral'
    score: number
    summary: string
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
    const prompt = `Analyze the sentiment of this employee feedback:

"${text}"

Return ONLY valid JSON:
{
  "sentiment": "positive|negative|neutral",
  "score": 0-100,
  "summary": "Brief 1-sentence summary of the sentiment"
}`

    const result = await callOpenAI([
        { role: 'system', content: 'You are a sentiment analysis AI. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ], 0.2)

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')

        return JSON.parse(jsonMatch[0])
    } catch (e) {
        console.error('Failed to parse sentiment analysis response:', e)
        throw new Error('Failed to parse AI response for sentiment analysis')
    }
}

// Batch sentiment analysis for multiple responses
export async function analyzeSentimentBatch(texts: string[]): Promise<{ positive: number; neutral: number; negative: number }> {
    const prompt = `Analyze the sentiment distribution of these employee feedback responses:

${texts.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

Count how many responses fall into each sentiment category and return the percentages.

Return ONLY valid JSON:
{
  "positive": 58,
  "neutral": 28,
  "negative": 14
}

The numbers should add up to 100.`

    const result = await callOpenAI([
        { role: 'system', content: 'You are a sentiment analysis AI. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ], 0.2)

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')

        return JSON.parse(jsonMatch[0])
    } catch (e) {
        console.error('Failed to parse batch sentiment analysis response:', e)
        throw new Error('Failed to parse AI response for batch sentiment analysis')
    }
}

// Generate improvement recommendations based on survey data
export interface Recommendation {
    title: string
    description: string
    impact: 'high' | 'medium' | 'low'
    effort: 'high' | 'medium' | 'low'
    category: string
}

export async function generateRecommendations(themes: DetectedTheme[]): Promise<Recommendation[]> {
    const concernThemes = themes.filter(t => t.sentiment === 'negative' || t.sentimentScore < 50)

    const prompt = `Based on employee survey analysis, generate actionable recommendations for HR leadership.

AREAS OF CONCERN:
${concernThemes.map(t => `- ${t.name}: ${t.sentimentScore}% sentiment score
  Keywords: ${t.keywords.join(', ')}
  Sample feedback: "${t.sampleQuotes[0]}"`).join('\n\n')}

Generate 3-5 specific, actionable recommendations to address these concerns.

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "title": "Implement Flex Friday Policy",
      "description": "Allow employees to work from home or leave early on Fridays to improve work-life balance...",
      "impact": "high",
      "effort": "low",
      "category": "Work-Life Balance"
    }
  ]
}`

    const result = await callOpenAI([
        { role: 'system', content: 'You are an HR strategy consultant providing evidence-based recommendations. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
    ], 0.6)

    try {
        const jsonMatch = result.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('No JSON found in response')

        const parsed = JSON.parse(jsonMatch[0])
        return parsed.recommendations
    } catch (e) {
        console.error('Failed to parse recommendations response:', e)
        throw new Error('Failed to parse AI response for recommendations')
    }
}
