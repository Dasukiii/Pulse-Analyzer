import { NavLink } from 'react-router-dom'
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Illustration */}
                <div className="relative mb-8">
                    <div className="text-[180px] font-black text-slate-100 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30 animate-bounce">
                            <FileQuestion className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                    Page Not Found
                </h1>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <NavLink
                        to="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </NavLink>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-400 mb-4">Quick Links</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <NavLink to="/surveys" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                            Survey Library
                        </NavLink>
                        <NavLink to="/themes" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                            Theme Analysis
                        </NavLink>
                        <NavLink to="/heatmap" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                            Heatmap View
                        </NavLink>
                        <NavLink to="/narratives" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                            Narratives
                        </NavLink>
                    </div>
                </div>

                {/* Search Suggestion */}
                <div className="mt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-500">
                        <Search className="w-4 h-4" />
                        <span>Looking for something specific? Try the survey library.</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
