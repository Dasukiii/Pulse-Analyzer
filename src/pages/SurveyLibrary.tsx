import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Calendar, Users, ClipboardList, Loader2, Trash2 } from 'lucide-react'
import { getSurveys, deleteSurvey, Survey } from '../services/database'

export default function SurveyLibrary() {
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

    useEffect(() => {
        loadSurveys()
    }, [])

    const loadSurveys = async () => {
        try {
            setLoading(true)
            const data = await getSurveys()
            setSurveys(data)
        } catch (err) {
            console.error('Error loading surveys:', err)
            setError('Failed to load surveys')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (surveyId: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setShowDeleteConfirm(surveyId)
    }

    const confirmDelete = async (surveyId: string) => {
        try {
            setDeletingId(surveyId)
            await deleteSurvey(surveyId)
            setSurveys(surveys.filter(s => s.id !== surveyId))
            setShowDeleteConfirm(null)
        } catch (err) {
            console.error('Error deleting survey:', err)
            setError('Failed to delete survey')
        } finally {
            setDeletingId(null)
        }
    }

    const filteredSurveys = surveys.filter(survey =>
        survey.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const calculateResponseRate = (survey: Survey) => {
        if (survey.total_employees === 0) return 0
        return Math.round((survey.response_count / survey.total_employees) * 100)
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

            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Survey Library</h1>
                            <p className="text-sm text-slate-500">Browse and manage all your surveys</p>
                        </div>
                        <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/25">
                            <Plus className="w-4 h-4" />
                            <span>Upload Survey</span>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search surveys..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-500">Loading surveys...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 mb-6">
                        {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredSurveys.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No surveys found</h3>
                        <p className="text-slate-500 mb-6">Upload your first survey to get started.</p>
                        <Link to="/upload" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl">
                            <Plus className="w-4 h-4" />
                            <span>Upload Survey</span>
                        </Link>
                    </div>
                )}

                {/* Survey Grid */}
                {!loading && !error && filteredSurveys.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSurveys.map((survey) => (
                            <div key={survey.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all group relative">
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDelete(survey.id, e)}
                                    className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete survey"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <Link to={`/survey/${survey.id}`} className="block">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${survey.status === 'completed' ? 'bg-blue-50' : 'bg-orange-50'
                                            }`}>
                                            <ClipboardList className={`w-6 h-6 ${survey.status === 'completed' ? 'text-blue-500' : 'text-orange-500'}`} />
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${survey.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {survey.status === 'completed' ? 'Completed' : survey.status === 'active' ? 'Active' : survey.status}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{survey.name}</h3>

                                    <div className="space-y-2 mb-4 text-sm text-slate-500">
                                        <p className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(survey.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            {survey.response_count} / {survey.total_employees} ({calculateResponseRate(survey)}%)
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500">Engagement</p>
                                            <p className={`text-lg font-bold ${survey.engagement_score ? (survey.engagement_score >= 75 ? 'text-green-600' : 'text-yellow-600') : 'text-slate-400'}`}>
                                                {survey.engagement_score ? `${survey.engagement_score}%` : '--'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">eNPS</p>
                                            <p className={`text-lg font-bold ${survey.enps ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {survey.enps ? `${survey.enps >= 0 ? '+' : ''}${survey.enps}` : '--'}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}
