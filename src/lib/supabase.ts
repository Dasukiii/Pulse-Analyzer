import { createClient } from '@supabase/supabase-js'

// Supabase Configuration
// Supports both legacy (anon) and new (publishable) key naming conventions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined

// Support both new publishable key and legacy anon key
const supabaseKey = (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY
) as string | undefined

// Debug log to help troubleshoot configuration
console.log('[Supabase] Configuration check:')
console.log('[Supabase] URL configured:', !!supabaseUrl && supabaseUrl.length > 0)
console.log('[Supabase] Key configured:', !!supabaseKey && supabaseKey.length > 0)

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] Credentials not configured. Running in demo mode.')
    console.log('[Supabase] Expected env vars: VITE_SUPABASE_URL and one of:')
    console.log('[Supabase]   - VITE_SUPABASE_PUBLISHABLE_KEY (new)')
    console.log('[Supabase]   - VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (new)')
    console.log('[Supabase]   - VITE_SUPABASE_ANON_KEY (legacy)')
} else {
    console.log('[Supabase] Real mode - connecting to:', supabaseUrl)
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
)

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
    // Check if both values are present and not placeholder values
    const hasUrl = !!supabaseUrl && supabaseUrl.length > 10 && supabaseUrl.startsWith('https://')
    const hasKey = !!supabaseKey && supabaseKey.length > 10
    return hasUrl && hasKey
}

// Test connection to Supabase
export const testConnection = async (): Promise<boolean> => {
    if (!isSupabaseConfigured()) return false

    try {
        const { error } = await supabase.from('departments').select('id').limit(1)
        if (error) {
            console.error('[Supabase] Connection test failed:', error.message)
            return false
        }
        console.log('[Supabase] Connection test successful!')
        return true
    } catch (err) {
        console.error('[Supabase] Connection test error:', err)
        return false
    }
}
