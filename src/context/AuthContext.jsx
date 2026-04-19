import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ── Plan limits ────────────────────────────────────────────────────────────────
export const FREE_LIMITS = {
  resumes_created:          3,
  interviews_completed:     50,   // temporarily increased for testing
  cover_letters_generated:  2,
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null)   // supabase auth user
  const [profile,   setProfile]   = useState(null)   // profiles row
  const [loading,   setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)

  // ── Fetch (or create) profile ──────────────────────────────────────────────
  // New OAuth users won't have a profile row yet — we upsert one for them.
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null

    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (data) {
      setProfile(data)
      return data
    }

    // No row yet (new Google / OAuth user) → create one
    if (error?.code === 'PGRST116') {
      const newProfile = {
        id:          authUser.id,
        email:       authUser.email,
        full_name:   authUser.user_metadata?.full_name
                     ?? authUser.user_metadata?.name
                     ?? '',
        avatar_url:  authUser.user_metadata?.avatar_url ?? null,
        plan:        'free',
        resumes_created:         0,
        interviews_completed:    0,
        cover_letters_generated: 0,
      }
      const { data: created, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      if (!createError && created) {
        setProfile(created)
        return created
      }
      console.error('Profile create error:', createError)
      return null
    }

    console.error('Profile fetch error:', error)
    return null
  }, [])

  // ── Bootstrap session ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ── Sign up ────────────────────────────────────────────────────────────────
  const signUp = useCallback(async (email, password, fullName) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) { setAuthError(error.message); return { error } }
    return { data }
  }, [])

  // ── Sign in ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setAuthError(error.message); return { error } }
    return { data }
  }, [])

  // ── Sign in with Google ────────────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',  // gets refresh token
          prompt: 'select_account', // always show account picker
        },
      },
    })
    if (error) { setAuthError(error.message); return { error } }
    return { data }
  }, [])

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  // ── Reset password ─────────────────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }, [])

  // ── Increment usage counter ────────────────────────────────────────────────
  const incrementUsage = useCallback(async (field) => {
    if (!user) return { allowed: true }

    const currentVal = profile?.[field] ?? 0
    const isPro      = profile?.plan === 'pro'

    if (isPro) {
      await supabase.rpc('increment_usage', { p_user_id: user.id, p_field: field })
      setProfile(p => ({ ...p, [field]: (p?.[field] ?? 0) + 1 }))
      return { allowed: true }
    }

    const limit = FREE_LIMITS[field]
    if (limit !== undefined && currentVal >= limit) {
      return { allowed: false, limit, current: currentVal }
    }

    await supabase.rpc('increment_usage', { p_user_id: user.id, p_field: field })
    setProfile(p => ({ ...p, [field]: (p?.[field] ?? 0) + 1 }))
    return { allowed: true }
  }, [user, profile])

  // ── Check limit without incrementing ──────────────────────────────────────
  const checkLimit = useCallback((field) => {
    if (!user || profile?.plan === 'pro') return { atLimit: false }
    const current = profile?.[field] ?? 0
    const limit   = FREE_LIMITS[field]
    return { atLimit: current >= limit, current, limit }
  }, [user, profile])

  // ── Refresh profile (after payment etc) ───────────────────────────────────
  const refreshProfile = useCallback(() => {
    if (user) return fetchProfile(user)
  }, [user, fetchProfile])

  const isPro      = profile?.plan === 'pro'
  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{
      user, profile, loading, authError, setAuthError,
      signUp, signIn, signInWithGoogle, signOut, resetPassword,
      incrementUsage, checkLimit, refreshProfile,
      isPro, isLoggedIn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}