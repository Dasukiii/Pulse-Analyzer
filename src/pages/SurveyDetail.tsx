import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, TrendingUp, Users, MessageSquare, BarChart3, Loader2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { getSurveyById, getThemesBySurveyId, Survey, Theme } from '../services/database'
import { exportSurveyDetailPDF } from '../services/pdfExport'

export default function SurveyDetail() {
    const { id } = useParams<{ id: string }>()
    const [survey, setSurvey] = useState<Survey | null>(null)
    const [themes, setThemes] = useState<Theme[]>([])
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        if (id) {
            loadSurveyData(id)
        }
    }, [id])

    const loadSurveyData = async (surveyId: string) => {
        try {
            setLoading(true)
            const [surveyData, themesData] = await Promise.all([
                getSurveyById(surveyId),
                getThemesBySurveyId(surveyId)
            ])
            setSurvey(surveyData)
            setThemes(themesData)
        } catch (err) {
            console.error('Error loading survey:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Loading survey details...</span>
            </div>
        )
    }

    if (!survey) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-700">Survey not found</h2>
                <p className="text-slate-500 mt-2">The requested survey could not be loaded.</p>
                <Link to="/surveys" className="text-blue-600 hover:underline mt-4 inline-block">
                    ← Back to Survey Library
                </Link>
            </div>
        )
    }

    const responseRate = survey.total_employees > 0
        ? Math.round((survey.response_count / survey.total_employees) * 100 * 10) / 10
        : 0

    // Generate question data from survey (simplified for now)
    const questionData = [
        { question: 'Overall Satisfaction', score: survey.engagement_score || 0 },
        { question: 'Work-Life Balance', score: Math.max(0, (survey.engagement_score || 0) - 10) },
        { question: 'Career Growth', score: (survey.engagement_score || 0) - 5 },
        { question: 'Manager Support', score: (survey.engagement_score || 0) + 5 },
        { question: 'Team Collaboration', score: (survey.engagement_score || 0) + 3 },
    ].map(q => ({ ...q, score: Math.min(100, Math.max(0, q.score)) }))

    // Calculate sentiment from themes
    const positiveThemes = themes.filter(t => t.sentiment === 'positive').length
    const negativeThemes = themes.filter(t => t.sentiment === 'negative').length
    const neutralThemes = themes.filter(t => t.sentiment === 'neutral').length
    const totalThemes = themes.length || 1

    const sentimentData = [
        { name: 'Positive', value: Math.round((positiveThemes / totalThemes) * 100), color: '#22c55e' },
        { name: 'Neutral', value: Math.round((neutralThemes / totalThemes) * 100), color: '#eab308' },
        { name: 'Negative', value: Math.round((negativeThemes / totalThemes) * 100), color: '#ef4444' },
    ]

    return (
        <>
            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link to="/surveys" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{survey.name}</h1>
                                <p className="text-sm text-slate-500">
                                    {survey.status === 'completed' ? 'Completed' : survey.status} on {new Date(survey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    setIsExporting(true)
                                    try {
                                        const stats = {
                                            engagementScore: survey.engagement_score || 0,
                                            eNPS: survey.enps || 0,
                                            responseRate: responseRate,
                                            totalResponses: survey.response_count,
                                            totalEmployees: survey.total_employees
                                        }
                                        const themeData = themes.map(t => ({
                                            name: t.name,
                                            frequency: t.frequency,
                                            sentiment: t.sentiment,
                                            sentimentScore: t.sentiment_score,
                                            keywords: t.keywords,
                                            sampleQuotes: t.sample_quotes
                                        }))
                                        await exportSurveyDetailPDF(survey.name, stats, questionData, themeData, sentimentData)
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
                            <Link to="/heatmap" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">
                                View Heatmap
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Response Rate</span>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{responseRate}%</p>
                        <p className="text-sm text-slate-500">{survey.response_count} of {survey.total_employees}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Engagement Score</span>
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{survey.engagement_score || '--'}%</p>
                        <p className="text-sm text-slate-500">Overall engagement</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">eNPS</span>
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-purple-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">
                            {survey.enps !== null ? (survey.enps >= 0 ? '+' : '') + survey.enps : '--'}
                        </p>
                        <p className="text-sm text-slate-500">Employee Net Promoter</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-500">Themes Detected</span>
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{themes.length}</p>
                        <p className="text-sm text-slate-500">AI-detected themes</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Question Breakdown */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Question Breakdown</h2>
                        {questionData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={questionData} layout="vertical">
                                        <defs>
                                            <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
                                                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                                        <YAxis dataKey="question" type="category" width={120} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            cursor={false}
                                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar
                                            dataKey="score"
                                            radius={[0, 4, 4, 0]}
                                            fill="#3b82f6"
                                            onMouseEnter={(data, index, e) => {
                                                if (e && e.target) {
                                                    (e.target as SVGElement).style.filter = 'url(#barGlow)';
                                                    (e.target as SVGElement).style.fill = '#60a5fa';
                                                }
                                            }}
                                            onMouseLeave={(data, index, e) => {
                                                if (e && e.target) {
                                                    (e.target as SVGElement).style.filter = 'none';
                                                    (e.target as SVGElement).style.fill = '#3b82f6';
                                                }
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-12">No question data available</p>
                        )}
                    </div>

                    {/* Sentiment Distribution */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Theme Sentiment</h2>
                        {themes.length > 0 ? (
                            <>
                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-4">
                                    {sentimentData.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm text-slate-600">{item.name} {item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-slate-500 text-center py-12">No themes detected yet</p>
                        )}
                    </div>
                </div>

                {/* Detected Themes */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900">AI-Detected Themes</h2>
                        <Link to="/themes" className="text-sm font-medium text-blue-600 hover:text-blue-700">View Full Analysis →</Link>
                    </div>
                    {themes.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {themes.slice(0, 6).map((theme) => (
                                <div key={theme.id} className={`p-4 rounded-xl border ${theme.sentiment === 'positive' ? 'bg-green-50 border-green-100' :
                                    theme.sentiment === 'negative' ? 'bg-red-50 border-red-100' :
                                        'bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-slate-900">{theme.name}</span>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                            theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>{theme.frequency} mentions</span>
                                    </div>
                                    {theme.sample_quotes && theme.sample_quotes[0] && (
                                        <p className="text-sm text-slate-600 italic">"{theme.sample_quotes[0]}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-500">No themes detected yet. Run AI analysis on the Themes page to detect themes from survey responses.</p>
                            <Link to="/themes" className="inline-block mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">
                                Go to Theme Analysis
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
