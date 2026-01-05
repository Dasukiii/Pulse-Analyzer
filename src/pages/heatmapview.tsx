import { useState, useEffect } from 'react'
import { Download, Filter, Loader2 } from 'lucide-react'
import { getHeatmapData, HeatmapResult, getSurveys, Survey } from '../services/database'
import { exportPageToPDF } from '../services/pdfExport'

function getHeatmapColor(value: number) {
    if (value >= 85) return 'bg-blue-500 text-white'
    if (value >= 80) return 'bg-blue-400 text-white'
    if (value >= 75) return 'bg-emerald-400 text-white'
    if (value >= 70) return 'bg-emerald-300 text-slate-800'
    if (value >= 65) return 'bg-yellow-400 text-slate-800'
    if (value >= 60) return 'bg-orange-400 text-white'
    return 'bg-red-500 text-white'
}

export default function HeatmapView() {
    const [hoveredCell, setHoveredCell] = useState<{ dept: string; question: string; value: number } | null>(null)
    const [heatmapData, setHeatmapData] = useState<HeatmapResult | null>(null)
    const [surveys, setSurveys] = useState<Survey[]>([])
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        loadSurveys()
    }, [])

    useEffect(() => {
        if (selectedSurveyId) {
            loadHeatmapData(selectedSurveyId)
        }
    }, [selectedSurveyId])

    const loadSurveys = async () => {
        try {
            const data = await getSurveys()
            setSurveys(data)
            if (data.length > 0) {
                setSelectedSurveyId(data[0].id)
            }
        } catch (err) {
            console.error('Error loading surveys:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadHeatmapData = async (surveyId: string) => {
        try {
            setLoading(true)
            const data = await getHeatmapData(surveyId)
            setHeatmapData(data)
        } catch (err) {
            console.error('Error loading heatmap data:', err)
        } finally {
            setLoading(false)
        }
    }

    // Calculate insights from real data
    const calculateInsights = () => {
        if (!heatmapData || heatmapData.departments.length === 0) {
            return { hotspots: [], strengths: [] }
        }

        const allCells: { dept: string; question: string; score: number }[] = []

        heatmapData.departments.forEach((dept, i) => {
            heatmapData.values[i]?.forEach((val, j) => {
                allCells.push({
                    dept,
                    question: heatmapData.questions[j],
                    score: val
                })
            })
        })

        // Sort by score
        const sorted = [...allCells].sort((a, b) => a.score - b.score)

        return {
            hotspots: sorted.slice(0, 3),
            strengths: sorted.slice(-3).reverse()
        }
    }

    const insights = calculateInsights()

    return (
        <>
            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Heatmap View</h1>
                            <p className="text-sm text-slate-500">Visualize engagement patterns across the organization</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={async () => {
                                    setIsExporting(true)
                                    try {
                                        await exportPageToPDF('Heatmap Report', 'heatmap_report')
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
                {/* Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Filter className="w-4 h-4" />
                            <span>Filters:</span>
                        </div>
                        <select
                            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                            value={selectedSurveyId}
                            onChange={(e) => setSelectedSurveyId(e.target.value)}
                        >
                            {surveys.length === 0 && <option>No surveys available</option>}
                            {surveys.map(survey => (
                                <option key={survey.id} value={survey.id}>{survey.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-500">Loading heatmap data...</span>
                    </div>
                )}

                {/* No Data State */}
                {!loading && (!heatmapData || heatmapData.departments.length === 0) && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <p className="text-slate-500">No heatmap data available for this survey. Upload survey responses to see the heatmap.</p>
                    </div>
                )}

                {/* Heatmap */}
                {!loading && heatmapData && heatmapData.departments.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        {/* Legend */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Organization Heatmap</h2>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Low</span>
                                <div className="flex gap-0.5">
                                    <div className="w-6 h-6 rounded bg-red-500" />
                                    <div className="w-6 h-6 rounded bg-orange-400" />
                                    <div className="w-6 h-6 rounded bg-yellow-400" />
                                    <div className="w-6 h-6 rounded bg-emerald-400" />
                                    <div className="w-6 h-6 rounded bg-blue-500" />
                                </div>
                                <span>High</span>
                            </div>
                        </div>

                        {/* Tooltip */}
                        {hoveredCell && (
                            <div className="fixed bg-slate-900 text-white px-4 py-2 rounded-lg text-sm z-50 pointer-events-none shadow-xl" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <p className="font-semibold">{hoveredCell.dept}</p>
                                <p className="text-slate-300">{hoveredCell.question}: {hoveredCell.value}%</p>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <div className="min-w-[800px]">
                                {/* Headers */}
                                <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: `150px repeat(${heatmapData.questions.length}, 1fr)` }}>
                                    <div />
                                    {heatmapData.questions.map((q, i) => (
                                        <div key={i} className="text-xs font-semibold text-slate-500 text-center">{q}</div>
                                    ))}
                                </div>
                                {/* Rows */}
                                {heatmapData.departments.map((dept, i) => (
                                    <div key={i} className="grid gap-2 mb-2" style={{ gridTemplateColumns: `150px repeat(${heatmapData.questions.length}, 1fr)` }}>
                                        <div className="text-sm font-medium text-slate-700 flex items-center">{dept}</div>
                                        {heatmapData.values[i]?.map((val, j) => (
                                            <div
                                                key={j}
                                                className={`aspect-square rounded-lg flex items-center justify-center text-sm font-bold cursor-pointer transition-all hover:scale-110 hover:shadow-lg hover:z-10 ${getHeatmapColor(val)}`}
                                                onMouseEnter={() => setHoveredCell({ dept, question: heatmapData.questions[j], value: val })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                {val}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Insights */}
                {!loading && heatmapData && heatmapData.departments.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 mb-4">🔥 Hotspots (Areas of Concern)</h3>
                            <div className="space-y-3">
                                {insights.hotspots.length === 0 ? (
                                    <p className="text-sm text-slate-500">No hotspots identified yet.</p>
                                ) : (
                                    insights.hotspots.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                            <span className="text-sm text-slate-700">{item.dept} • {item.question}</span>
                                            <span className="font-bold text-red-600">{item.score}%</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-900 mb-4">✨ Strengths</h3>
                            <div className="space-y-3">
                                {insights.strengths.length === 0 ? (
                                    <p className="text-sm text-slate-500">No strengths identified yet.</p>
                                ) : (
                                    insights.strengths.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                                            <span className="text-sm text-slate-700">{item.dept} • {item.question}</span>
                                            <span className="font-bold text-green-600">{item.score}%</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
