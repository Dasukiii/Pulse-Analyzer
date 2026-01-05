import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
    Activity,
    LayoutDashboard,
    FolderOpen,
    UploadCloud,
    Grid3X3,
    Sparkles,
    TrendingUp,
    FileText,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Settings,
    AlertCircle
} from 'lucide-react'
import ApiKeySettings from './ApiKeySettings'

const navItems = [
    { section: 'Overview' },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { section: 'Surveys' },
    { name: 'Survey Library', path: '/surveys', icon: FolderOpen },
    { name: 'Upload Survey', path: '/upload', icon: UploadCloud },
    { section: 'Analytics' },
    { name: 'Heatmap View', path: '/heatmap', icon: Grid3X3 },
    { name: 'Theme Analysis', path: '/themes', icon: Sparkles },
    { name: 'Indicator Tracking', path: '/indicators', icon: TrendingUp },
    { name: 'Narrative Highlights', path: '/narratives', icon: FileText },
]

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const navigate = useNavigate()
    const { user, signOut, isDemo } = useAuth()

    // Get user display info
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
    const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    const userEmail = user?.email || 'user@example.com'

    const handleLogout = async () => {
        await signOut()
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <NavLink to="/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">Pulse Analyzer</span>
                    </NavLink>
                </div>

                {/* Demo Mode Indicator */}
                {isDemo && (
                    <div className="mx-4 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs text-amber-700 font-medium">Demo Mode</span>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    {navItems.map((item, index) => (
                        item.section ? (
                            <div key={index} className="px-4 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                                {item.section}
                            </div>
                        ) : (
                            <NavLink
                                key={index}
                                to={item.path!}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 mb-1 text-sm font-medium rounded-xl transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                <span>{item.name}</span>
                            </NavLink>
                        )
                    ))}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-100">
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                                {userInitials}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <p className="font-medium text-slate-900 text-sm truncate">{userName}</p>
                                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                                <button
                                    onClick={() => { setSettingsOpen(true); setUserMenuOpen(false) }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>API Settings</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-72 min-h-screen">
                {/* Mobile Header */}
                <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">Pulse Analyzer</span>
                        </div>
                        <div className="w-9" /> {/* Spacer for centering */}
                    </div>
                </div>

                {/* Mobile close button when sidebar is open */}
                {sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden fixed top-4 left-[296px] z-50 p-2 rounded-lg bg-white shadow-lg"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                )}

                <Outlet />
            </main>

            {/* API Settings Modal */}
            <ApiKeySettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    )
}
