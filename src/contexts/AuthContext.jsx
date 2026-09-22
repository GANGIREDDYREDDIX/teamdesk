import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as store from '../lib/mockStore.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const current = store.getCurrentUser()
    setUser(current)
    setLoading(false)

    // Subscribe to store changes (e.g. deactivation from another tab)
    const unsub = store.subscribe((s) => {
      const u = store.getCurrentUser()
      setUser(u)
    })
    return unsub
  }, [])

  const signIn = useCallback(async (email, password) => {
    const result = store.signIn(email, password)
    if (result.error) return { error: result.error }
    setUser(result.user)
    return { user: result.user }
  }, [])

  const signOut = useCallback(() => {
    store.signOut()
    setUser(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    if (!user) return { error: 'Not logged in.' }
    const result = store.updateProfile(user.id, updates)
    if (!result.error) setUser(result.user)
    return result
  }, [user])

  const isHead = user?.role === 'head'
  const isEmployee = user?.role === 'employee'

  return (
    <AuthContext.Provider value={{ user, loading, isHead, isEmployee, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
