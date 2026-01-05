import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading, isDemo } = useAuth()
    const location = useLocation()

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        )
    }

    // In demo mode without user, redirect to login
    // In real mode without user, redirect to login
    if (!user && !isDemo) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    // In demo mode, require explicit login
    if (isDemo && !user) {
        return <Navigate to="/" state={{ from: location }} replace />
    }

    return <>{children}</>
}
