import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './auth-context'

/** Drop only Supabase auth keys so a bad refresh token stops spamming 400s. */
function clearSupabaseAuthStorage() {
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keys.push(key)
      }
    }
    for (const key of keys) localStorage.removeItem(key)
  } catch {
    // ignore private-mode / blocked storage
  }
}

// Sign-up seeds `auth.users` metadata; migration 0002's `handle_new_user` trigger
// copies that into `public.profiles.display_name`. The UI reads the profile row
// via ProfileProvider; profile saves update `profiles` and sync metadata back
// through `saveProfileUpdate` so both stores stay aligned.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (cancelled) return

        if (error) {
          // Invalid/expired refresh token → GoTrue 400; clear local junk and show sign-in.
          clearSupabaseAuthStorage()
          await supabase.auth.signOut({ scope: 'local' })
          setSession(null)
          return
        }

        if (!data.session) {
          setSession(null)
          return
        }

        // Confirm the access token is still accepted by the server.
        const { error: userError } = await supabase.auth.getUser()
        if (cancelled) return

        if (userError) {
          clearSupabaseAuthStorage()
          await supabase.auth.signOut({ scope: 'local' })
          setSession(null)
          return
        }

        setSession(data.session)
      } catch {
        if (!cancelled) {
          clearSupabaseAuthStorage()
          setSession(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        clearSupabaseAuthStorage()
      }
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName.trim() || email.split('@')[0] } },
    })
    return { error: error?.message ?? null }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    clearSupabaseAuthStorage()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp,
      signIn,
      signOut,
    }),
    [session, loading, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
