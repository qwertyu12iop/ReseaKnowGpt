'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  showLogoutConfirm: boolean
  setShowLogoutConfirm: (show: boolean) => void
  requireAuth: () => boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: React.ReactNode
  initialUser?: User | null
  initialProfile?: Profile | null
}

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  // 若 SSR 已经把用户拿到了，就不再显示 loading 状态
  const [loading, setLoading] = useState(!initialUser)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const supabaseRef = useRef(createClient())
  const profileFetchedRef = useRef<string | null>(initialUser ? initialUser.id : null)

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (profileFetchedRef.current === userId && profile) return

      const { data, error } = await supabaseRef.current
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        const { data: newProfile } = await supabaseRef.current
          .from('profiles')
          .insert({ id: userId })
          .select()
          .single()
        setProfile(newProfile)
        profileFetchedRef.current = userId
        return
      }

      if (data) {
        setProfile(data)
        profileFetchedRef.current = userId
      }
    },
    [profile],
  )

  const refreshProfile = useCallback(async () => {
    profileFetchedRef.current = null
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const handleSession = useCallback(
    async (session: Session | null) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
        setShowAuthModal(false)
      } else {
        setProfile(null)
        profileFetchedRef.current = null
      }
      setLoading(false)
    },
    [fetchProfile],
  )

  useEffect(() => {
    const supabase = supabaseRef.current

    // 只用 onAuthStateChange，避免与 getUser 竞争
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => subscription.unsubscribe()
  }, [handleSession])

  const requireAuth = useCallback(() => {
    if (!user) {
      setShowAuthModal(true)
      return false
    }
    return true
  }, [user])

  const signOut = useCallback(async () => {
    try {
      await supabaseRef.current.auth.signOut()
    } catch {
      // 强制清除本地状态
    }
    setUser(null)
    setProfile(null)
    profileFetchedRef.current = null
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        showAuthModal,
        setShowAuthModal,
        showLogoutConfirm,
        setShowLogoutConfirm,
        requireAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
