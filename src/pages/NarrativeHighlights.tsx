import { useState, useEffect } from 'react'
import { FileText, AlertTriangle, Lightbulb, TrendingUp, Download, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { generateNarrativeHighlights, hasApiKey, type NarrativeInsight, type SurveyMetrics } from '../services/openai'
import { getNarrativesBySurveyId, getSurveys, getThemesBySurveyId, getDashboardStats, saveNarratives, Survey, Narrative, Theme } from '../services/database'
import { exportPageToPDF } from '../services/pdfExport'

const getIcon = (type: string) => {
    switch (type) {
        case 'summary': return FileText
        case 'positive': return TrendingUp
        case 'concern': return AlertTriangle
        case 'action': return Lightbulb
        default: return FileText
    }
}

const getColors = (type: string) => {
    switch (type) {
        case 'summary': return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700' }
        case 'positive': return { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-700' }
        case 'concern': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', badge: 'bg-red-100 text-red-700' }
        case 'action': return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-600', badge: 'bg-orange-100 text-orange-700' }
        default: return { bg: 'bg-slate-50', border: 'border-slate-200', icon: 'bg-slate-100 text-slate-600', badge: 'bg-slate-100 text-slate-700' }
    }
}

export default function NarrativeHighlights() {
    const [narratives, setNarratives] = useState<NarrativeInsight[]>([])
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
    const [stats, setStats] = useState({ engagementScore: 0, eNPS: 0, responseRate: 0 })
    const [isGenerating, setIsGenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeFilter, setActiveFilter] = useState('All')
    const [isExporting, setIsExporting] = useState(false)
    const [showCostWarning, setShowCostWarning] = useState(false)

    useEffect(() => {
        loadSurveys()
        loadStats()
    }, [])

    useEffect(() => {
        if (selectedSurveyId) {
            loadNarratives(selectedSurveyId)
        }
    }, [selectedSurveyId])

    const loadSurveys = async () => {
        try {
            const data = await getSurveys()
            setSurveys(data)
            if (data.length > 0) {
                setSelectedSurveyId(data[0].id)
            } else {
                setLoading(false)
            }
        } catch (err) {
            console.error('Error loading surveys:', err)
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const data = await getDashboardStats()
            setStats({
                engagementScore: data.engagementScore,
                eNPS: data.eNPS,
                responseRate: data.responseRate
            })
        } catch (err) {
            console.error('Error loading stats:', err)
        }
    }

    const loadNarratives = async (surveyId: string) => {
        try {
            setLoading(true)
            setNarratives([])
            const data = await getNarrativesBySurveyId(surveyId)
            const convertedNarratives: NarrativeInsight[] = data.map((n: Narrative) => ({
                type: n.type,
                title: n.title,
                content: n.content,
                priority: n.priority
            }))
            setNarratives(convertedNarratives)
        } catch (err) {
            console.error('Error loading narratives:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateWithAI = async () => {
        if (!hasApiKey()) {
            setError('Please configure your OpenAI API key in Settings first.')
            return
        }

        if (!selectedSurveyId) {
            setError('Please select a survey first.')
            return
        }

        setIsGenerating(true)
        setError(null)

        try {
            // Get themes from database
            const themes = await getThemesBySurveyId(selectedSurveyId)
            const selectedSurvey = surveys.find(s => s.id === selectedSurveyId)

            if (!selectedSurvey) {
                setError('Survey not found.')
                setIsGenerating(false)
                return
            }

            const metrics: SurveyMetrics = {
                engagementScore: selectedSurvey.engagement_score || 0,
                previousEngagementScore: 0,
                eNPS: selectedSurvey.enps || 0,
                previousENPS: 0,
                responseRate: selectedSurvey.total_employees > 0
                    ? (selectedSurvey.response_count / selectedSurvey.total_employees) * 100
                    : 0,
                totalResponses: selectedSurvey.response_count,
                themes: themes.map((t: Theme) => ({
                    name: t.name,
                    frequency: t.frequency,
                    sentiment: t.sentiment,
                    sentimentScore: t.sentiment_score,
                    sampleQuotes: t.sample_quotes,
                    keywords: t.keywords
                }))
            }

            const insights = await generateNarrativeHighlights(metrics)

            // Save narratives to database so they persist
            const narrativesToSave = insights.map(n => ({
                type: n.type,
                title: n.title,
                content: n.content,
                priority: n.priority
            }))

            await saveNarratives(selectedSurveyId, narrativesToSave)

            // Reload narratives from database
            await loadNarratives(selectedSurveyId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate narratives')
        } finally {
            setIsGenerating(false)
        }
    }

    const filteredNarratives = activeFilter === 'All'
        ? narratives
        : narratives.filter(n => {
            if (activeFilter === 'Summary') return n.type === 'summary'
            if (activeFilter === 'Positive') return n.type === 'positive'
            if (activeFilter === 'Concerns') return n.type === 'concern'
            if (activeFilter === 'Actions') return n.type === 'action'
            return true
        })

    const selectedSurvey = surveys.find(s => s.id === selectedSurveyId)

    return (
        <>
            {/* Cost Warning Modal */}
            {showCostWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCostWarning(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">AI Narrative Generation</h3>
                                <p className="text-sm text-slate-500">Uses OpenAI API credits</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            This will use your OpenAI API to generate narrative insights and executive summaries. Estimated cost is $0.01-0.03 per generation. Continue?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCostWarning(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowCostWarning(false)
                                    handleGenerateWithAI()
                                }}
                                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:shadow-lg flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Continue Generation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Narrative Highlights</h1>
                            <p className="text-sm text-slate-500">AI-generated insights and story points</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                className="px-4 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                                value={selectedSurveyId}
                                onChange={(e) => setSelectedSurveyId(e.target.value)}
                            >
                                {surveys.length === 0 && <option>No surveys available</option>}
                                {surveys.map(survey => (
                                    <option key={survey.id} value={survey.id}>{survey.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={async () => {
                                    setIsExporting(true)
                                    try {
                                        await exportPageToPDF('Narrative Highlights Report', 'narrative_highlights')
                                    } finally {
                                        setIsExporting(false)
                                    }
                                }}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50"
                            >
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Export PDF
                            </button>
                            <button
                                onClick={() => setShowCostWarning(true)}
                                disabled={isGenerating}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" /> Generate with AI
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 mb-6">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-500">Loading narratives...</span>
                    </div>
                )}

                {/* No Data State */}
                {!loading && narratives.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center mb-8">
                        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No narratives generated yet</h3>
                        <p className="text-slate-500 mb-6">Click "Generate with AI" to create narrative insights from survey data.</p>
                        <button
                            onClick={() => setShowCostWarning(true)}
                            disabled={isGenerating}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl"
                        >
                            <Sparkles className="w-4 h-4" /> Generate with AI
                        </button>
                    </div>
                )}

                {/* Content */}
                {!loading && narratives.length > 0 && (
                    <>
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {['All', 'Summary', 'Positive', 'Concerns', 'Actions'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveFilter(tab)}
                                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${activeFilter === tab ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Narratives Grid */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {filteredNarratives.map((narrative, index) => {
                                const Icon = getIcon(narrative.type)
                                const colors = getColors(narrative.type)

                                return (
                                    <div key={index} className={`${colors.bg} rounded-2xl border ${colors.border} p-6 hover:shadow-lg transition-shadow`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-bold text-slate-900">{narrative.title}</h3>
                                                    {narrative.priority === 'high' && (
                                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">High Priority</span>
                                                    )}
                                                </div>
                                                <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${colors.badge} mb-3`}>
                                                    {narrative.type.charAt(0).toUpperCase() + narrative.type.slice(1)}
                                                </span>
                                                <p className="text-slate-700">{narrative.content}</p>
                                                <div className="mt-4 pt-4 border-t border-slate-200/50">
                                                    <span className="text-xs text-slate-500">
                                                        AI-generated insight
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* Summary Card */}
                {selectedSurvey && (
                    <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                        <div className="max-w-3xl">
                            <h2 className="text-2xl font-bold mb-4">{selectedSurvey.name} Summary</h2>
                            <p className="text-blue-100 mb-6 leading-relaxed">
                                This survey collected {selectedSurvey.response_count} responses from {selectedSurvey.total_employees} employees.
                                {selectedSurvey.engagement_score && selectedSurvey.engagement_score > 0 && (
                                    <> The engagement score is {selectedSurvey.engagement_score}%.</>
                                )}
                                {narratives.length > 0 && (
                                    <> AI analysis has identified {narratives.length} key insights including {narratives.filter(n => n.type === 'action').length} recommended actions.</>
                                )}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white/10 rounded-xl px-4 py-3">
                                    <p className="text-xs text-blue-200">Engagement Score</p>
                                    <p className="text-2xl font-bold">{selectedSurvey.engagement_score || stats.engagementScore || '--'}%</p>
                                </div>
                                <div className="bg-white/10 rounded-xl px-4 py-3">
                                    <p className="text-xs text-blue-200">eNPS</p>
                                    <p className="text-2xl font-bold">{selectedSurvey.enps !== null ? (selectedSurvey.enps >= 0 ? '+' : '') + selectedSurvey.enps : '--'}</p>
                                </div>
                                <div className="bg-white/10 rounded-xl px-4 py-3">
                                    <p className="text-xs text-blue-200">Response Rate</p>
                                    <p className="text-2xl font-bold">
                                        {selectedSurvey.total_employees > 0
                                            ? Math.round((selectedSurvey.response_count / selectedSurvey.total_employees) * 100) + '%'
                                            : '--'}
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-xl px-4 py-3">
                                    <p className="text-xs text-blue-200">Insights Generated</p>
                                    <p className="text-2xl font-bold">{narratives.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
