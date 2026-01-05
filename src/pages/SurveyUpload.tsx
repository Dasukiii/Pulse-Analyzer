import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileSpreadsheet, Check, Loader2, Eye, HelpCircle, Download, Info, AlertCircle, X, Sparkles } from 'lucide-react'
import {
    parseCSV,
    autoDetectColumns,
    mapRowData,
    uploadSurveyToDatabase,
    generateSampleCSV,
    ColumnMapping,
    ParsedRow
} from '../services/upload'
import { isSupabaseConfigured } from '../lib/supabase'

type Step = 'upload' | 'mapping' | 'metadata' | 'processing' | 'success'

// Required columns for the survey dataset
const requiredColumns = [
    { name: 'Timestamp', description: 'Date and time of response submission', required: true },
    { name: 'Email', description: 'Employee email (for tracking, can be anonymized)', required: false },
    { name: 'Department', description: 'Department or team name', required: true },
    { name: 'Overall Satisfaction', description: 'Rating from 1-5 scale', required: true },
    { name: 'Work-Life Balance', description: 'Rating from 1-5 scale', required: false },
    { name: 'Career Growth', description: 'Rating from 1-5 scale', required: false },
    { name: 'Management', description: 'Rating from 1-5 scale', required: false },
    { name: 'Team Collaboration', description: 'Rating from 1-5 scale', required: false },
    { name: 'Open Feedback', description: 'Free-text employee comments', required: false },
]

export default function SurveyUpload() {
    const [step, setStep] = useState<Step>('upload')
    const [progress, setProgress] = useState(0)
    const [processingStage, setProcessingStage] = useState('')
    const [dragOver, setDragOver] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // File data state
    const [fileName, setFileName] = useState<string>('')
    const [headers, setHeaders] = useState<string[]>([])
    const [rows, setRows] = useState<string[][]>([])
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])

    // Metadata state
    const [surveyName, setSurveyName] = useState('')
    const [surveyDate, setSurveyDate] = useState(new Date().toISOString().split('T')[0])
    const [totalEmployees, setTotalEmployees] = useState<number>(0)

    // Result state
    const [resultSurveyId, setResultSurveyId] = useState<string | null>(null)
    const [aiGenerated, setAiGenerated] = useState<{ themes: boolean; narratives: boolean }>({ themes: false, narratives: false })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    // Download CSV template
    const downloadCSVTemplate = () => {
        const csvContent = generateSampleCSV()
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'survey_template.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Handle file selection
    const handleFileSelect = async (file: File) => {
        setError(null)

        // Validate file type
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
            setError('Please upload a CSV or Excel file')
            return
        }

        try {
            const text = await file.text()
            const { headers: parsedHeaders, rows: parsedRows } = parseCSV(text)

            if (parsedRows.length === 0) {
                setError('The file appears to be empty')
                return
            }

            setFileName(file.name)
            setHeaders(parsedHeaders)
            setRows(parsedRows)

            // Auto-detect column mappings
            const mappings = autoDetectColumns(parsedHeaders)
            setColumnMappings(mappings)

            // Set default survey name based on file name
            const baseName = file.name.replace(/\.(csv|xlsx)$/, '').replace(/_/g, ' ')
            setSurveyName(baseName)
            setTotalEmployees(parsedRows.length)

            setStep('mapping')
        } catch (err) {
            setError('Failed to parse file. Please check the format.')
            console.error(err)
        }
    }

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFileSelect(file)
    }

    // Handle drag and drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) handleFileSelect(file)
    }

    // Handle mapping change
    const handleMappingChange = (sourceColumn: string, targetField: string) => {
        setColumnMappings(prev =>
            prev.map(m => m.sourceColumn === sourceColumn ? { ...m, targetField } : m)
        )
    }

    // Process the survey
    const handleProcess = async () => {
        setStep('processing')
        setProgress(0)
        setError(null)

        const processingStages = [
            { progress: 10, stage: 'Validating data format...' },
            { progress: 25, stage: 'Parsing survey responses...' },
            { progress: 40, stage: 'Analyzing with GPT-4o-mini: Theme Detection...' },
            { progress: 55, stage: 'Analyzing with GPT-4o-mini: Sentiment Analysis...' },
            { progress: 70, stage: 'Saving to database...' },
            { progress: 85, stage: 'Calculating key indicators...' },
            { progress: 95, stage: 'Generating heatmap data...' },
            { progress: 100, stage: 'Complete!' },
        ]

        // Animate progress
        let stageIndex = 0
        setProcessingStage(processingStages[0].stage)

        const progressInterval = setInterval(() => {
            stageIndex++
            if (stageIndex < processingStages.length) {
                setProgress(processingStages[stageIndex].progress)
                setProcessingStage(processingStages[stageIndex].stage)
            } else {
                clearInterval(progressInterval)
            }
        }, 600)

        try {
            // Map the data
            const parsedData: ParsedRow[] = rows.map(row =>
                mapRowData(row, headers, columnMappings)
            )

            // Upload to database
            const result = await uploadSurveyToDatabase(
                surveyName,
                surveyDate,
                parsedData,
                totalEmployees
            )

            clearInterval(progressInterval)

            if (result.success) {
                setProgress(100)
                setProcessingStage('Complete!')
                setResultSurveyId(result.surveyId || null)
                setAiGenerated(result.aiGenerated || { themes: false, narratives: false })
                setTimeout(() => setStep('success'), 500)
            } else {
                setError(result.error || 'Failed to process survey')
                setStep('metadata')
            }
        } catch (err) {
            clearInterval(progressInterval)
            setError(err instanceof Error ? err.message : 'An error occurred')
            setStep('metadata')
        }
    }

    const stepNumber = (s: Step) => {
        const steps: Step[] = ['upload', 'mapping', 'metadata', 'processing', 'success']
        return steps.indexOf(s)
    }

    const targetFieldOptions = [
        { value: 'skip', label: 'Skip (Do not import)' },
        { value: 'timestamp', label: 'Timestamp' },
        { value: 'email', label: 'Email' },
        { value: 'department', label: 'Department' },
        { value: 'overallSatisfaction', label: 'Overall Satisfaction' },
        { value: 'workLifeBalance', label: 'Work-Life Balance' },
        { value: 'careerGrowth', label: 'Career Growth' },
        { value: 'management', label: 'Management' },
        { value: 'compensation', label: 'Compensation' },
        { value: 'workEnvironment', label: 'Work Environment' },
        { value: 'teamCollaboration', label: 'Team Collaboration' },
        { value: 'recognition', label: 'Recognition' },
        { value: 'communication', label: 'Communication' },
        { value: 'openFeedback', label: 'Open Feedback (Text)' },
    ]

    return (
        <>
            <header className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-lg border-b border-slate-200">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-bold text-slate-900">Upload Survey</h1>
                    <p className="text-sm text-slate-500">Import survey data into the system</p>
                </div>
            </header>

            <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
                {/* Database Mode Indicator */}
                {!isSupabaseConfigured() && (
                    <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Demo Mode</p>
                            <p className="text-sm text-amber-700">
                                Supabase is not configured. Data will not be persisted to the database.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                        <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded">
                            <X className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <div className="flex items-center">
                        {['Upload File', 'Map Columns', 'Set Metadata', 'Process'].map((label, i) => (
                            <div key={i} className="flex items-center flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${stepNumber(step) > i ? 'bg-green-500 text-white' :
                                        stepNumber(step) === i ? 'bg-blue-500 text-white' :
                                            'bg-slate-200 text-slate-500'
                                        }`}>
                                        {stepNumber(step) > i ? <Check className="w-4 h-4" /> : i + 1}
                                    </div>
                                    <span className={`text-sm font-medium ${stepNumber(step) >= i ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                                </div>
                                {i < 3 && <div className={`flex-1 h-0.5 mx-4 ${stepNumber(step) > i ? 'bg-green-500' : 'bg-slate-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Step */}
                {step === 'upload' && (
                    <div className="space-y-4">
                        {/* Info Panel with Required Columns */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <button
                                onClick={() => setShowTooltip(!showTooltip)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Info className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-semibold text-slate-900">What columns should my dataset have?</h4>
                                        <p className="text-sm text-slate-500">Click to view required and optional columns</p>
                                    </div>
                                </div>
                                <HelpCircle className={`w-5 h-5 text-slate-400 transition-transform ${showTooltip ? 'rotate-180' : ''}`} />
                            </button>

                            {showTooltip && (
                                <div className="p-4 pt-0 border-t border-slate-100 bg-slate-50">
                                    <div className="space-y-3 mb-4">
                                        {requiredColumns.map((col, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className={`mt-0.5 px-2 py-0.5 text-xs font-semibold rounded ${col.required ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {col.required ? 'Required' : 'Optional'}
                                                </span>
                                                <div>
                                                    <span className="font-medium text-slate-900">{col.name}</span>
                                                    <p className="text-sm text-slate-500">{col.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); downloadCSVTemplate() }}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-500 rounded-xl shadow-lg shadow-green-500/25 hover:shadow-xl transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download CSV Template
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Upload Zone */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-8">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx"
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                            <div
                                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                    }`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                                    <UploadCloud className="w-10 h-10 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Drop your survey file here</h3>
                                <p className="text-slate-500 mb-4">or click to browse from your computer</p>
                                <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> CSV</span>
                                    <span className="flex items-center gap-1"><FileSpreadsheet className="w-4 h-4" /> Excel</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mapping Step */}
                {step === 'mapping' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Map Columns</h3>
                                <p className="text-sm text-slate-500">
                                    Loaded {rows.length} rows from <span className="font-medium">{fileName}</span>
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Source Column</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Map To</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-slate-500">Sample Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {columnMappings.map((mapping, i) => (
                                        <tr key={i} className="border-b border-slate-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-slate-900">{mapping.sourceColumn}</span>
                                                    {mapping.detected && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">Auto</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <select
                                                    value={mapping.targetField}
                                                    onChange={(e) => handleMappingChange(mapping.sourceColumn, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                >
                                                    {targetFieldOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 px-4 text-slate-500 text-sm max-w-xs truncate">
                                                {rows[0]?.[i] || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Back</button>
                            <button onClick={() => setStep('metadata')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700">Continue</button>
                        </div>
                    </div>
                )}

                {/* Metadata Step */}
                {step === 'metadata' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Survey Metadata</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Survey Name *</label>
                                <input
                                    type="text"
                                    value={surveyName}
                                    onChange={(e) => setSurveyName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="e.g., Q1 2026 Engagement"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Survey Date *</label>
                                <input
                                    type="date"
                                    value={surveyDate}
                                    onChange={(e) => setSurveyDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Total Employees</label>
                                <input
                                    type="number"
                                    value={totalEmployees}
                                    onChange={(e) => setTotalEmployees(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    placeholder="Total employees surveyed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Responses Loaded</label>
                                <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium">
                                    {rows.length} responses
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setStep('mapping')} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">Back</button>
                            <button
                                onClick={handleProcess}
                                disabled={!surveyName}
                                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl shadow-lg shadow-orange-500/25 disabled:opacity-50"
                            >
                                Process Survey
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing Step */}
                {step === 'processing' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Survey Data</h3>
                        <p className="text-slate-500 mb-6">AI is analyzing responses and detecting themes...</p>

                        {/* AI Model Badge */}
                        <div className="flex justify-center mb-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full border border-purple-100">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-purple-700">Powered by GPT-4o-mini</span>
                            </span>
                        </div>

                        <div className="max-w-md mx-auto">
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-sm font-medium text-slate-600">{processingStage}</p>
                            <p className="text-xs text-slate-400 mt-1">{progress}% complete</p>
                        </div>
                    </div>
                )}

                {/* Success Step */}
                {step === 'success' && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Survey Processed Successfully!</h3>
                        <p className="text-slate-500 mb-2">Your survey has been analyzed and is ready to view.</p>
                        <p className="text-sm text-slate-400 mb-2">
                            Processed {rows.length} responses
                            {!isSupabaseConfigured() && ' (Demo mode - data not persisted)'}
                        </p>

                        {(aiGenerated.themes || aiGenerated.narratives) && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl border border-purple-100 mb-6">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <p className="text-sm text-purple-700">
                                    AI generated {aiGenerated.themes && 'themes'}
                                    {aiGenerated.themes && aiGenerated.narratives && ' and '}
                                    {aiGenerated.narratives && 'narrative insights'} automatically
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => navigate(resultSurveyId ? `/survey/${resultSurveyId}` : '/surveys')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                            >
                                <Eye className="w-4 h-4" /> View Results
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
