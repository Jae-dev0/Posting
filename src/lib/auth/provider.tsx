import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { fetchCurrentUser } from './api'
import { AuthContext } from './context'
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from './token-storage'
import type { AuthSession, AuthUser } from './types'

export function AuthProvider({ children }: { children?: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(true)

  const login = useCallback((session: AuthSession) => {
    setStoredSession(session)
    setUser(session.user)
    setAccessToken(session.accessToken)
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setUser(null)
    setAccessToken(null)
  }, [])

  useEffect(() => {
    const stored = getStoredSession()

    if (!stored) {
      setIsPending(false)
      return
    }

    setUser(stored.user)
    setAccessToken(stored.accessToken)

    fetchCurrentUser(stored.accessToken)
      .then((parsed) => {
        const session = { accessToken: stored.accessToken, user: parsed }
        setStoredSession(session)
        setUser(parsed)
      })
      .catch(() => {
        clearStoredSession()
        setUser(null)
        setAccessToken(null)
      })
      .finally(() => {
        setIsPending(false)
      })
  }, [])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(user && accessToken),
      isPending,
      login,
      logout,
    }),
    [user, accessToken, isPending, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
