// Authentication Service for Pulse Analyzer
// Handles Supabase authentication with fallback for demo mode

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Profile type
export interface Profile {
    id: string
    email: string
    full_name: string | null
    role: 'admin' | 'manager' | 'viewer'
    department_id: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

// Demo user for when Supabase is not configured
const DEMO_USER: User = {
    id: 'demo-user-id',
    email: 'demo@pulseanalyzer.com',
    app_metadata: {},
    user_metadata: { full_name: 'John Doe' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
}

const DEMO_PROFILE: Profile = {
    id: 'demo-user-id',
    email: 'demo@pulseanalyzer.com',
    full_name: 'John Doe',
    role: 'manager',
    department_id: null,
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

// Current session state
let currentSession: Session | null = null
let currentProfile: Profile | null = null

// Check if running in demo mode
export const isDemoMode = (): boolean => !isSupabaseConfigured()

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
    if (isDemoMode()) {
        return DEMO_USER
    }

    const { data: { user } } = await supabase.auth.getUser()
    return user
}

// Get current session
export const getSession = async (): Promise<Session | null> => {
    if (isDemoMode()) {
        return null // Demo mode doesn't use sessions
    }

    const { data: { session } } = await supabase.auth.getSession()
    currentSession = session
    return session
}

// Get current user profile
export const getProfile = async (): Promise<Profile | null> => {
    if (isDemoMode()) {
        return DEMO_PROFILE
    }

    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching profile:', error)
        return null
    }

    currentProfile = data as Profile
    return currentProfile
}

// Sign in with email/password
export const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    if (isDemoMode()) {
        return { user: DEMO_USER, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return { user: null, error: error.message }
    }

    currentSession = data.session
    return { user: data.user, error: null }
}

// Sign up with email/password
export const signUp = async (
    email: string,
    password: string,
    fullName: string
): Promise<{ user: User | null; error: string | null }> => {
    if (isDemoMode()) {
        return { user: null, error: 'Sign up is not available in demo mode. Please configure Supabase.' }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        }
    })

    if (error) {
        return { user: null, error: error.message }
    }

    return { user: data.user, error: null }
}

// Sign out
export const signOut = async (): Promise<void> => {
    if (!isDemoMode()) {
        await supabase.auth.signOut()
    }
    currentSession = null
    currentProfile = null
}

// Update profile
export const updateProfile = async (updates: Partial<Profile>): Promise<Profile | null> => {
    if (isDemoMode()) {
        return { ...DEMO_PROFILE, ...updates }
    }

    const user = await getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating profile:', error)
        return null
    }

    currentProfile = data as Profile
    return currentProfile
}

// Listen for auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    if (isDemoMode()) {
        // In demo mode, immediately call with demo user
        callback(DEMO_USER)
        return { unsubscribe: () => { } }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null)
    })

    return { unsubscribe: () => subscription.unsubscribe() }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
    if (isDemoMode()) {
        return true // Always authenticated in demo mode
    }

    const session = await getSession()
    return !!session
}

// Get user role
export const getUserRole = async (): Promise<'admin' | 'manager' | 'viewer'> => {
    const profile = await getProfile()
    return profile?.role || 'viewer'
}

// Check if user has permission
export const hasPermission = async (requiredRole: 'admin' | 'manager' | 'viewer'): Promise<boolean> => {
    const role = await getUserRole()

    const roleHierarchy = { admin: 3, manager: 2, viewer: 1 }
    return roleHierarchy[role] >= roleHierarchy[requiredRole]
}
