import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
    isDemo: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo user for when Supabase is not configured
const DEMO_USER: User = {
    id: 'demo-user-id',
    email: 'demo@pulseanalyzer.com',
    app_metadata: {},
    user_metadata: { full_name: 'John Doe' },
    aud: 'authenticated',
    created_at: new Date().toISOString()
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const isDemo = !isSupabaseConfigured()

    useEffect(() => {
        if (isDemo) {
            // In demo mode, no automatic authentication
            setLoading(false)
            return
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [isDemo])

    const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
        if (isDemo) {
            // Demo sign in - just set the demo user
            setUser(DEMO_USER)
            return { error: null }
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                return { error: error.message }
            }

            setSession(data.session)
            setUser(data.user)
            return { error: null }
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }

    const signUp = async (email: string, password: string, fullName: string): Promise<{ error: string | null }> => {
        if (isDemo) {
            return { error: 'Sign up is not available in demo mode. Please configure Supabase.' }
        }

        try {
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
                return { error: error.message }
            }

            // If email confirmation is required
            if (data.user && !data.session) {
                return { error: null } // User created, needs email confirmation
            }

            setSession(data.session)
            setUser(data.user)
            return { error: null }
        } catch (err) {
            return { error: 'An unexpected error occurred' }
        }
    }

    const signOut = async (): Promise<void> => {
        if (isDemo) {
            setUser(null)
            return
        }

        await supabase.auth.signOut()
        setSession(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signIn,
            signUp,
            signOut,
            isDemo
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
