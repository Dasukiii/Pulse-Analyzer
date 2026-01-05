import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, TrendingDown, Minus, MessageSquare, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { detectThemes, hasApiKey, type DetectedTheme } from '../services/openai'
import { getThemesBySurveyId, getSurveys, getOpenEndedResponses, saveThemes, Survey, Theme } from '../services/database'
import { exportPageToPDF } from '../services/pdfExport'

export default function ThemeAnalysis() {
    const [selectedThemeIndex, setSelectedThemeIndex] = useState(0)
    const [themes, setThemes] = useState<DetectedTheme[]>([])
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [usingMockData, setUsingMockData] = useState(false)
    const [isExporting, setIsExporting] = useState(false)
    const [showCostWarning, setShowCostWarning] = useState(false)

    useEffect(() => {
        loadSurveys()
    }, [])

    useEffect(() => {
        if (selectedSurveyId) {
            loadThemes(selectedSurveyId)
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

    const loadThemes = async (surveyId: string) => {
        try {
            setLoading(true)
            setThemes([])
            const data = await getThemesBySurveyId(surveyId)
            const convertedThemes: DetectedTheme[] = data.map((t: Theme) => ({
                name: t.name,
                frequency: t.frequency,
                sentiment: t.sentiment,
                sentimentScore: t.sentiment_score,
                sampleQuotes: t.sample_quotes,
                keywords: t.keywords
            }))
            setThemes(convertedThemes)
            setSelectedThemeIndex(0)
        } catch (err) {
            console.error('Error loading themes:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalyzeWithAI = async () => {
        if (!hasApiKey()) {
            setError('Please configure your OpenAI API key in Settings first.')
            return
        }

        if (!selectedSurveyId) {
            setError('Please select a survey first.')
            return
        }

        setIsAnalyzing(true)
        setError(null)

        try {
            // Get open-ended responses from the database
            const responses = await getOpenEndedResponses(selectedSurveyId)

            if (responses.length === 0) {
                setError('No open-ended responses found for this survey. Upload a survey with feedback comments first.')
                setIsAnalyzing(false)
                return
            }

            const detectedThemes = await detectThemes(responses)

            // Save themes to database so they persist
            const themesToSave = detectedThemes.map(t => ({
                name: t.name,
                frequency: t.frequency,
                sentiment: t.sentiment,
                sentiment_score: t.sentimentScore,
                keywords: t.keywords,
                sample_quotes: t.sampleQuotes
            }))

            await saveThemes(selectedSurveyId, themesToSave)

            // Reload themes from database
            await loadThemes(selectedSurveyId)
            setUsingMockData(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to analyze themes')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const currentTheme = themes[selectedThemeIndex]

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
                                <h3 className="text-lg font-bold text-slate-900">AI Analysis</h3>
                                <p className="text-sm text-slate-500">Uses OpenAI API credits</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            This will use your OpenAI API to analyze survey responses and detect themes. Estimated cost is $0.01-0.05 depending on response volume. Continue?
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
                                    handleAnalyzeWithAI()
                                }}
                                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl hover:shadow-lg flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Continue Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Theme Analysis</h1>
                            <p className="text-sm text-slate-500">AI-powered theme detection from open-ended responses</p>
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
                            {usingMockData && (
                                <span className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                                    Using sample data
                                </span>
                            )}
                            <button
                                onClick={async () => {
                                    setIsExporting(true)
                                    try {
                                        await exportPageToPDF('Theme Analysis Report', 'theme_analysis')
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
                                disabled={isAnalyzing}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" /> Analyze with AI
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
                        <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-500">Loading themes...</span>
                    </div>
                )}

                {/* No Data State */}
                {!loading && themes.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No themes detected yet</h3>
                        <p className="text-slate-500 mb-6">Click "Analyze with AI" to detect themes from survey responses.</p>
                        <button
                            onClick={() => setShowCostWarning(true)}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl"
                        >
                            <Sparkles className="w-4 h-4" /> Analyze with AI
                        </button>
                    </div>
                )}

                {/* Theme Content */}
                {!loading && themes.length > 0 && (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Theme List */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl border border-slate-200 p-4">
                                <h2 className="font-bold text-slate-900 mb-4">Detected Themes ({themes.length})</h2>
                                <div className="space-y-2">
                                    {themes.map((theme, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedThemeIndex(index)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${selectedThemeIndex === index
                                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-slate-900">{theme.name}</span>
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                    theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>{theme.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                {theme.sentiment === 'positive' ? (
                                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                                ) : theme.sentiment === 'negative' ? (
                                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Minus className="w-4 h-4 text-blue-500" />
                                                )}
                                                <span className={
                                                    theme.sentiment === 'positive' ? 'text-green-600' :
                                                        theme.sentiment === 'negative' ? 'text-red-600' :
                                                            'text-blue-600'
                                                }>{theme.sentimentScore}% sentiment</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Theme Detail */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Summary Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{currentTheme?.name}</h2>
                                        <p className="text-sm text-slate-500 mt-1">{currentTheme?.frequency} mentions detected</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-xl ${currentTheme?.sentiment === 'positive' ? 'bg-green-50' :
                                        currentTheme?.sentiment === 'negative' ? 'bg-red-50' :
                                            'bg-blue-50'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            {currentTheme?.sentiment === 'positive' ? (
                                                <TrendingUp className="w-5 h-5 text-green-500" />
                                            ) : currentTheme?.sentiment === 'negative' ? (
                                                <TrendingDown className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <Minus className="w-5 h-5 text-blue-500" />
                                            )}
                                            <div>
                                                <p className="text-xs text-slate-500">Sentiment Score</p>
                                                <p className={`text-lg font-bold ${currentTheme?.sentiment === 'positive' ? 'text-green-600' :
                                                    currentTheme?.sentiment === 'negative' ? 'text-red-600' :
                                                        'text-blue-600'
                                                    }`}>{currentTheme?.sentimentScore}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Word Cloud / Keywords */}
                                <div className="bg-slate-50 rounded-xl p-8 text-center">
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {(currentTheme?.keywords || []).map((word, i) => (
                                            <span key={i} className={`px-3 py-1 rounded-full ${i % 3 === 0 ? 'text-lg font-bold bg-blue-100 text-blue-700' :
                                                i % 3 === 1 ? 'text-base font-semibold bg-purple-100 text-purple-700' :
                                                    'text-sm bg-slate-200 text-slate-600'
                                                }`}>{word}</span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-4">
                                        AI-detected keywords
                                    </p>
                                </div>
                            </div>

                            {/* Sample Quotes */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    Sample Quotes
                                </h3>
                                <div className="space-y-4">
                                    {(currentTheme?.sampleQuotes || []).length === 0 ? (
                                        <p className="text-slate-500 text-center py-4">No sample quotes available.</p>
                                    ) : (
                                        currentTheme?.sampleQuotes.map((quote, i) => (
                                            <div key={i} className="p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500">
                                                <p className="text-slate-700 italic">"{quote}"</p>
                                                <p className="text-xs text-slate-400 mt-2">Anonymous Employee</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
