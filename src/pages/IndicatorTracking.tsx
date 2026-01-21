import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, Download, Loader2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getIndicatorsBySurveyId, getSurveys, Indicator, Survey } from '../services/database'
import { exportIndicatorsPDF } from '../services/pdfExport'

export default function IndicatorTracking() {
    const [indicators, setIndicators] = useState<Indicator[]>([])
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        loadSurveys()
    }, [])

    useEffect(() => {
        if (selectedSurveyId) {
            loadIndicators(selectedSurveyId)
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

    const loadIndicators = async (surveyId: string) => {
        try {
            setLoading(true)
            setIndicators([])
            const data = await getIndicatorsBySurveyId(surveyId)
            setIndicators(data)
        } catch (err) {
            console.error('Error loading indicators:', err)
        } finally {
            setLoading(false)
        }
    }

    // Generate chart data from surveys
    const chartData = surveys.slice(0, 6).reverse().map(s => ({
        period: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: s.engagement_score || 0
    }))

    return (
        <>
            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Indicator Tracking</h1>
                            <p className="text-sm text-slate-500">Track key metrics over time with trend analysis</p>
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
                                        const selectedSurvey = surveys.find(s => s.id === selectedSurveyId)
                                        const surveyName = selectedSurvey?.name || 'Survey'
                                        const indicatorData = indicators.map(i => ({
                                            name: i.name,
                                            currentValue: i.current_value,
                                            previousValue: i.previous_value,
                                            targetValue: i.target_value,
                                            trend: i.trend
                                        }))
                                        await exportIndicatorsPDF(surveyName, indicatorData, chartData)
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
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8">
                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-500">Loading indicators...</span>
                    </div>
                )}

                {/* No Data State */}
                {!loading && indicators.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center mb-8">
                        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No indicators found</h3>
                        <p className="text-slate-500">Indicators will be generated when you run AI analysis on survey data.</p>
                    </div>
                )}

                {/* Indicator Cards */}
                {!loading && indicators.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {indicators.map((indicator) => (
                            <div key={indicator.id} className={`bg-white rounded-2xl border p-6 ${indicator.current_value >= indicator.target_value ? 'border-green-200' :
                                indicator.trend === 'down' ? 'border-red-200' :
                                    'border-slate-200'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-slate-500">{indicator.name}</span>
                                    {indicator.current_value >= indicator.target_value ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : indicator.trend === 'down' ? (
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    ) : (
                                        <Target className="w-5 h-5 text-blue-500" />
                                    )}
                                </div>
                                <div className="flex items-end gap-3 mb-2">
                                    <span className="text-3xl font-bold text-slate-900">{indicator.current_value}{indicator.name.includes('Rate') ? '%' : ''}</span>
                                    <div className={`flex items-center gap-1 text-sm font-medium ${indicator.trend === 'up' ? 'text-green-600' : indicator.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                                        }`}>
                                        {indicator.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : indicator.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
                                        {indicator.current_value - indicator.previous_value > 0 ? '+' : ''}{(indicator.current_value - indicator.previous_value).toFixed(1)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Target className="w-4 h-4" />
                                    <span>Target: {indicator.target_value}{indicator.name.includes('Rate') ? '%' : ''}</span>
                                </div>
                                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${indicator.current_value >= indicator.target_value ? 'bg-green-500' :
                                        indicator.trend === 'down' ? 'bg-red-500' :
                                            'bg-blue-500'
                                        }`} style={{ width: `${Math.min((indicator.current_value / indicator.target_value) * 100, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Trend Chart - Show if we have surveys with engagement data */}
                {!loading && chartData.length > 0 && chartData.some(d => d.value > 0) && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Engagement Trend Over Time</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="period" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                    <Legend />
                                    <ReferenceLine y={80} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Target', position: 'right', fill: '#10b981', fontSize: 12 }} />
                                    <Line type="monotone" dataKey="value" name="Engagement Score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Survey Comparison Table */}
                {!loading && surveys.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Survey Comparison</h2>
                        <div className="space-y-4">
                            {surveys.slice(0, 6).map((survey, i) => {
                                const prevSurvey = surveys[i + 1]
                                const change = prevSurvey ? (survey.engagement_score || 0) - (prevSurvey.engagement_score || 0) : 0
                                const score = survey.engagement_score || 0

                                return (
                                    <div key={survey.id} className="flex items-center gap-4">
                                        <span className="w-48 text-sm font-medium text-slate-700 truncate">{survey.name}</span>
                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 70 ? 'bg-blue-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} style={{ width: `${score}%` }} />
                                        </div>
                                        <span className="w-12 text-sm font-bold text-slate-900">{score}%</span>
                                        {prevSurvey && (
                                            <span className={`w-12 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {change >= 0 ? '+' : ''}{change.toFixed(0)}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
