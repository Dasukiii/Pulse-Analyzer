import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Heart,
    ThumbsUp,
    Users,
    MessageSquare,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    UploadCloud,
    AlertTriangle,
    Lightbulb,
    FileText,
    Trash2,
    Minus,
    Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getDashboardStats, getSurveys, getThemesBySurveyId, getHeatmapData, deleteSurvey, DashboardStats, Survey, Theme, HeatmapResult } from '../services/database'

function getHeatmapColor(value: number) {
    if (value >= 85) return 'bg-blue-500 text-white'
    if (value >= 80) return 'bg-blue-400 text-white'
    if (value >= 75) return 'bg-emerald-400 text-white'
    if (value >= 70) return 'bg-emerald-300 text-slate-800'
    if (value >= 65) return 'bg-yellow-400 text-slate-800'
    if (value >= 60) return 'bg-orange-400 text-white'
    return 'bg-red-500 text-white'
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [themes, setThemes] = useState<Theme[]>([])
    const [heatmapData, setHeatmapData] = useState<HeatmapResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            const [statsData, surveysData] = await Promise.all([
                getDashboardStats(),
                getSurveys()
            ])
            setStats(statsData)
            setSurveys(surveysData)

            // Load themes and heatmap from the most recent survey
            if (surveysData.length > 0) {
                const latestSurveyId = surveysData[0].id
                const [themesData, heatmapResult] = await Promise.all([
                    getThemesBySurveyId(latestSurveyId),
                    getHeatmapData(latestSurveyId)
                ])
                setThemes(themesData)
                setHeatmapData(heatmapResult)
            }
        } catch (err) {
            console.error('Error loading dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const confirmDelete = async (surveyId: string) => {
        try {
            setDeletingId(surveyId)
            await deleteSurvey(surveyId)
            setSurveys(surveys.filter(s => s.id !== surveyId))
            setShowDeleteConfirm(null)
        } catch (err) {
            console.error('Error deleting survey:', err)
        } finally {
            setDeletingId(null)
        }
    }

    // Generate trend data from surveys
    const trendData = surveys.slice(0, 4).reverse().map(s => ({
        name: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        engagement: s.engagement_score || 0,
        responseRate: s.total_employees > 0 ? Math.round((s.response_count / s.total_employees) * 100) : 0
    }))

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-2 text-slate-500">Loading dashboard...</span>
            </div>
        )
    }

    return (
        <>
            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Delete Survey?</h3>
                                <p className="text-sm text-slate-500">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mb-6">
                            This will permanently delete the survey and all its analytics data including themes, narratives, indicators, and responses.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmDelete(showDeleteConfirm)}
                                disabled={deletingId === showDeleteConfirm}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {deletingId === showDeleteConfirm && <Loader2 className="w-4 h-4 animate-spin" />}
                                Delete Survey
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                            <p className="text-sm text-slate-500">Welcome back! Here's your organization's pulse.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all">
                                <UploadCloud className="w-4 h-4" />
                                <span className="hidden sm:inline">Upload Survey</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Engagement Score</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {stats?.engagementScore || 0}%
                                </p>
                                {stats && stats.engagementChange !== 0 && (
                                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stats.engagementChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.engagementChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span>{stats.engagementChange > 0 ? '+' : ''}{stats.engagementChange}% from previous</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Heart className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Employee NPS</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {stats?.eNPS !== undefined ? (stats.eNPS >= 0 ? '+' : '') + stats.eNPS : '--'}
                                </p>
                                {stats && stats.eNPSChange !== 0 && (
                                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stats.eNPSChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.eNPSChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span>{stats.eNPSChange > 0 ? '+' : ''}{stats.eNPSChange} from previous</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                <ThumbsUp className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Response Rate</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">
                                    {stats?.responseRate || 0}%
                                </p>
                                {stats && stats.responseRateChange !== 0 && (
                                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${stats.responseRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stats.responseRateChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                        <span>{stats.responseRateChange > 0 ? '+' : ''}{stats.responseRateChange}% from previous</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Responses</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.totalResponses || 0}</p>
                                <p className="text-sm text-slate-500 mt-2">of {stats?.totalEmployees || 0} employees</p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap & Themes */}
                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* Heatmap */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Organization Heatmap</h2>
                                <p className="text-sm text-slate-500">Engagement by Department & Question</p>
                            </div>
                            <Link to="/heatmap" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                <span>View Full</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {heatmapData && heatmapData.departments.length > 0 ? (
                            <>
                                {/* Legend */}
                                <div className="flex items-center justify-end gap-2 mb-4 text-xs text-slate-500">
                                    <span>Low</span>
                                    <div className="flex gap-0.5">
                                        <div className="w-4 h-4 rounded bg-red-500" />
                                        <div className="w-4 h-4 rounded bg-orange-400" />
                                        <div className="w-4 h-4 rounded bg-yellow-400" />
                                        <div className="w-4 h-4 rounded bg-emerald-400" />
                                        <div className="w-4 h-4 rounded bg-blue-500" />
                                    </div>
                                    <span>High</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <div className="min-w-[600px]">
                                        {/* Headers */}
                                        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${heatmapData.questions.length}, 1fr)` }}>
                                            <div />
                                            {heatmapData.questions.map((q, i) => (
                                                <div key={i} className="text-xs font-medium text-slate-500 text-center truncate">{q}</div>
                                            ))}
                                        </div>
                                        {/* Rows */}
                                        {heatmapData.departments.map((dept, i) => (
                                            <div key={i} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `120px repeat(${heatmapData.questions.length}, 1fr)` }}>
                                                <div className="text-xs font-medium text-slate-700 truncate flex items-center">{dept}</div>
                                                {heatmapData.values[i]?.map((val, j) => (
                                                    <div key={j} className={`aspect-square rounded flex items-center justify-center text-xs font-semibold cursor-pointer hover:scale-110 transition-transform ${getHeatmapColor(val)}`}>
                                                        {val}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No heatmap data available. Upload a survey to see department analytics.</p>
                            </div>
                        )}
                    </div>

                    {/* Top Themes */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Top Themes</h2>
                                <p className="text-sm text-slate-500">AI-detected from responses</p>
                            </div>
                            <Link to="/themes" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </Link>
                        </div>

                        {themes.length > 0 ? (
                            <div className="space-y-4">
                                {themes.slice(0, 4).map((theme) => (
                                    <div key={theme.id} className={`p-4 rounded-xl border ${theme.sentiment === 'negative' ? 'bg-red-50 border-red-100' :
                                        theme.sentiment === 'positive' ? 'bg-green-50 border-green-100' :
                                            'bg-blue-50 border-blue-100'
                                        }`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-slate-900">{theme.name}</span>
                                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${theme.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                                theme.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>{theme.frequency} mentions</span>
                                        </div>
                                        <div className={`flex items-center gap-1 text-xs font-medium ${theme.sentiment === 'negative' ? 'text-red-600' :
                                            theme.sentiment === 'positive' ? 'text-green-600' :
                                                'text-blue-600'
                                            }`}>
                                            {theme.sentiment === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                                                theme.sentiment === 'negative' ? <TrendingDown className="w-3 h-3" /> :
                                                    <Minus className="w-3 h-3" />}
                                            <span>{theme.sentiment_score}% sentiment</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 text-sm">No themes detected yet. Run AI analysis to detect themes.</p>
                                <Link to="/themes" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
                                    Go to Theme Analysis →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trend Chart & Narratives */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    {/* Trend Chart */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Engagement Trend</h2>
                                <p className="text-sm text-slate-500">Historical performance</p>
                            </div>
                            <Link to="/indicators" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                                <span>View All</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        {trendData.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="responseRate" name="Response Rate" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-slate-500">No survey data available yet. Upload surveys to see trends.</p>
                            </div>
                        )}
                    </div>

                    {/* Narrative Highlights */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
                                <p className="text-sm text-slate-500">Get started with your surveys</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link to="/upload" className="flex gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-blue-100">
                                    <UploadCloud className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-slate-900 text-sm">Upload New Survey</span>
                                    <p className="text-sm text-slate-600">Import CSV data to analyze employee feedback</p>
                                </div>
                            </Link>
                            <Link to="/themes" className="flex gap-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-100">
                                    <Lightbulb className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-slate-900 text-sm">Run AI Analysis</span>
                                    <p className="text-sm text-slate-600">Detect themes and generate insights from responses</p>
                                </div>
                            </Link>
                            <Link to="/narratives" className="flex gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-green-100">
                                    <FileText className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-slate-900 text-sm">Generate Narratives</span>
                                    <p className="text-sm text-slate-600">Create AI-powered summaries and recommendations</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Surveys */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Recent Surveys</h2>
                            <p className="text-sm text-slate-500">Your latest survey results</p>
                        </div>
                        <Link to="/surveys" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                            <span>View All Surveys</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {surveys.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Survey Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Response Rate</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Engagement</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surveys.slice(0, 5).map((survey) => {
                                        const responseRate = survey.total_employees > 0
                                            ? Math.round((survey.response_count / survey.total_employees) * 100)
                                            : 0
                                        return (
                                            <tr key={survey.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
                                                <td className="py-4 px-4">
                                                    <Link to={`/survey/${survey.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                                                        {survey.name}
                                                    </Link>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600">{new Date(survey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${responseRate}%` }} />
                                                        </div>
                                                        <span className="text-sm text-slate-600">{responseRate}%</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`font-semibold ${survey.engagement_score ? (survey.engagement_score >= 75 ? 'text-green-600' : 'text-yellow-600') : 'text-slate-400'}`}>
                                                        {survey.engagement_score ? `${survey.engagement_score}%` : '--'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${survey.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {survey.status === 'completed' ? 'Completed' : survey.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            setShowDeleteConfirm(survey.id)
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                        title="Delete survey"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 mb-4">No surveys yet. Upload your first survey to get started.</p>
                            <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">
                                <UploadCloud className="w-4 h-4" />
                                Upload Survey
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
