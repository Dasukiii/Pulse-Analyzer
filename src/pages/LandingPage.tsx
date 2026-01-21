import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Activity,
    Rocket,
    TrendingUp,
    Brain,
    FileText,
    Grid3X3,
    Sparkles,
    FolderOpen,
    UploadCloud,
    ChevronRight,
    Star,
    X,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    Check
} from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export default function LandingPage() {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [authMode, setAuthMode] = useState<AuthMode>('signin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [acceptedPDPA, setAcceptedPDPA] = useState(false)

    const navigate = useNavigate()
    const { signIn, signUp, user, isDemo } = useAuth()

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)
        setLoading(true)

        try {
            if (authMode === 'signin') {
                const { error } = await signIn(email, password)
                if (error) {
                    setError(error)
                } else {
                    navigate('/dashboard')
                }
            } else {
                if (!fullName.trim()) {
                    setError('Please enter your full name')
                    setLoading(false)
                    return
                }
                if (password.length < 6) {
                    setError('Password must be at least 6 characters')
                    setLoading(false)
                    return
                }
                if (!acceptedPDPA) {
                    setError('Please accept the Privacy Policy to continue')
                    setLoading(false)
                    return
                }
                const { error } = await signUp(email, password, fullName)
                if (error) {
                    setError(error)
                } else {
                    setSuccessMessage('Account created! Please check your email to confirm your account.')
                }
            }
        } finally {
            setLoading(false)
        }
    }

    const openModal = (mode: AuthMode) => {
        setAuthMode(mode)
        setError(null)
        setSuccessMessage(null)
        setEmail('')
        setPassword('')
        setFullName('')
        setAcceptedPDPA(false)
        setShowLoginModal(true)
    }

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-4 left-4 right-4 z-50">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 px-6 py-4 flex items-center justify-between shadow-lg shadow-slate-900/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">Pulse Analyzer</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
                            <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Testimonials</a>
                        </div>

                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen pt-32 pb-20 px-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-sm font-medium text-blue-700">AI-Powered Survey Analytics</span>
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                                Turn Survey Data Into
                                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"> Actionable Insights</span>
                            </h1>

                            <p className="text-xl text-slate-600 mb-8 max-w-xl">
                                Unlock the hidden stories in your employee surveys. Pulse Analyzer uses AI to detect themes, visualize sentiment, and generate narrative highlights.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={() => openModal('signup')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all hover:-translate-y-0.5">
                                    <Rocket className="w-5 h-5" />
                                    Start Now
                                </button>
                            </div>
                        </div>

                        {/* Hero Visual */}
                        <div className="relative animate-fade-in delay-200">
                            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 p-6 animate-float">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-slate-500">Organization Engagement</p>
                                        <p className="text-3xl font-bold text-slate-900">78%</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-semibold">+4%</span>
                                    </div>
                                </div>

                                {/* Mini Heatmap */}
                                <div className="mb-6">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Sentiment by Department</p>
                                    <div className="grid grid-cols-8 gap-1">
                                        {[
                                            'bg-blue-400', 'bg-blue-300', 'bg-emerald-400', 'bg-emerald-300', 'bg-yellow-400', 'bg-blue-400', 'bg-emerald-500', 'bg-blue-300',
                                            'bg-emerald-300', 'bg-emerald-400', 'bg-blue-400', 'bg-emerald-500', 'bg-yellow-300', 'bg-orange-400', 'bg-blue-300', 'bg-emerald-400',
                                            'bg-yellow-400', 'bg-orange-300', 'bg-emerald-400', 'bg-blue-400', 'bg-emerald-300', 'bg-emerald-400', 'bg-yellow-400', 'bg-blue-400',
                                            'bg-orange-400', 'bg-yellow-400', 'bg-emerald-300', 'bg-blue-300', 'bg-emerald-400', 'bg-emerald-500', 'bg-blue-400', 'bg-emerald-400',
                                        ].map((color, i) => (
                                            <div key={i} className={`aspect-square rounded ${color} hover:scale-110 transition-transform cursor-pointer`} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Leadership +12%</span>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">Work-Life Balance</span>
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Team Culture</span>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -left-8 top-1/3 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-float" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Brain className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">AI Detected</p>
                                        <p className="font-semibold text-slate-900">5 Key Themes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 animate-float" style={{ animationDelay: '0.6s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Generated</p>
                                        <p className="font-semibold text-slate-900">3 Action Items</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Analytics Features</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to understand your employee sentiment and take meaningful action.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: Grid3X3, title: 'Interactive Heatmaps', desc: 'Visualize engagement patterns across departments with drill-down heatmaps.', color: 'blue', glow: 'hover:shadow-blue-500/30' },
                            { icon: Sparkles, title: 'AI Theme Detection', desc: 'Automatically discover recurring themes in open-ended responses.', color: 'purple', glow: 'hover:shadow-purple-500/30' },
                            { icon: TrendingUp, title: 'Indicator Tracking', desc: 'Track key metrics over time with trend lines and threshold alerts.', color: 'green', glow: 'hover:shadow-green-500/30' },
                            { icon: FileText, title: 'Narrative Highlights', desc: 'Get AI-generated summaries of key findings and recommendations.', color: 'orange', glow: 'hover:shadow-orange-500/30' },
                            { icon: FolderOpen, title: 'Survey Library', desc: 'Manage all surveys with search, filters, and comparison tools.', color: 'pink', glow: 'hover:shadow-pink-500/30' },
                            { icon: UploadCloud, title: 'Easy Data Upload', desc: 'Import from CSV, Excel, or Google Forms with smart mapping.', color: 'cyan', glow: 'hover:shadow-cyan-500/30' },
                        ].map((feature, i) => (
                            <div key={i} className={`group p-8 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl ${feature.glow} transition-all cursor-pointer`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${feature.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/25' :
                                    feature.color === 'purple' ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/25' :
                                        feature.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25' :
                                            feature.color === 'orange' ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/25' :
                                                feature.color === 'pink' ? 'bg-gradient-to-br from-pink-500 to-pink-600 shadow-pink-500/25' :
                                                    'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/25'
                                    }`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
                        <p className="text-xl text-slate-600">From raw survey data to executive insights in three simple steps.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: 1, title: 'Upload Your Survey', desc: 'Drag and drop your CSV or Excel file. Our smart mapper auto-detects questions.', color: 'blue' },
                            { step: 2, title: 'AI Analyzes Data', desc: 'Our AI engine processes responses, detects themes, and generates insights.', color: 'purple' },
                            { step: 3, title: 'Take Action', desc: 'Review heatmaps, explore themes, and share executive summaries.', color: 'green' },
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 h-full">
                                    <div className={`w-12 h-12 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 ${item.color === 'blue' ? 'bg-blue-500' : item.color === 'purple' ? 'bg-purple-500' : 'bg-green-500'
                                        }`}>
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600">{item.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                                        <ChevronRight className="w-8 h-8 text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by HR Leaders</h2>
                        <p className="text-xl text-slate-600">See how organizations are transforming their feedback process.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Sarah Lin', role: 'VP of People, TechCorp', quote: 'The theme detection feature saved us weeks of manual analysis.', initials: 'SL', gradient: 'from-blue-400 to-blue-600' },
                            { name: 'Marcus Rivera', role: 'CHRO, GlobalFinance', quote: 'The heatmaps make it easy to spot problem areas instantly.', initials: 'MR', gradient: 'from-purple-400 to-purple-600' },
                            { name: 'Amanda Kim', role: 'Director of HR, HealthPlus', quote: 'AI-generated executive summaries in seconds!', initials: 'AK', gradient: 'from-green-400 to-green-600' },
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200">
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-slate-600 mb-6">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold`}>
                                        {testimonial.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900">{testimonial.name}</p>
                                        <p className="text-sm text-slate-500">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Survey Data?</h2>
                    <p className="text-xl text-blue-100 mb-8">Join 500+ organizations using Pulse Analyzer.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={() => openModal('signup')} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-colors">
                            <Rocket className="w-5 h-5" />
                            Start Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">Pulse Analyzer</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                            <p className="text-sm">2026 Pulse Analyzer. All rights reserved.</p>
                            <Link to="/privacy-policy" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                Privacy Policy (PDPA)
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-slate-800 w-full max-w-xs justify-center">
                            <span className="text-xs text-slate-500">Powered by</span>
                            <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="h-6 w-auto" />
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowLoginModal(false)}>
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                                <Activity className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-slate-500 mt-1">
                                {authMode === 'signin' ? 'Sign in to your account' : 'Start your free trial today'}
                            </p>
                        </div>

                        {/* Demo Mode Badge */}
                        {isDemo && (
                            <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-amber-800">Demo Mode</p>
                                    <p className="text-amber-700">Supabase not configured. Use any credentials to try the demo.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4 mb-6">
                                {authMode === 'signup' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                        placeholder="you@company.com"
                                        autoComplete="email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                            placeholder="••••••••"
                                            autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {authMode === 'signup' && (
                                    <div className="flex items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAcceptedPDPA(!acceptedPDPA)}
                                            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                                                acceptedPDPA
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-slate-300 hover:border-blue-400'
                                            }`}
                                        >
                                            {acceptedPDPA && <Check className="w-3 h-3 text-white" />}
                                        </button>
                                        <label className="text-sm text-slate-600">
                                            I have read and agree to the{' '}
                                            <Link
                                                to="/privacy-policy"
                                                target="_blank"
                                                className="text-blue-600 hover:underline font-medium"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Privacy Policy (PDPA)
                                            </Link>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || (authMode === 'signup' && !acceptedPDPA)}
                                className="w-full py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500">
                                {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => {
                                        setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                                        setError(null)
                                        setSuccessMessage(null)
                                    }}
                                    className="text-blue-600 font-medium hover:underline"
                                >
                                    {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>

                        {/* Powered By */}
                        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                Powered by
                                <img src="/kadosh-ai-icon.png" alt="Kadosh AI" className="w-24 h-6" />
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
