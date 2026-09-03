import { useContext } from 'react'

import { AuthContext } from './context'
import type { AuthUser } from './types'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export function useAuthUser(): [AuthUser | null, ReturnType<typeof useAuth>] {
  const auth = useAuth()
  return [auth.isAuthenticated ? auth.user : null, auth]
}

export function useCanManageAccounts() {
  const { user } = useAuth()
  return user?.role === 'main_admin'
}
