import { ReactNode, useMemo } from 'react'

import { AuthContext } from './context'
import type { AuthUser } from './types'

const MOCK_USER: AuthUser = {
  id: 1,
  email: 'dev@localhost',
  firstName: 'Dev',
  lastName: 'User',
  fullname: 'Dev User',
  username: 'dev.user',
  role: 'main_admin',
  companyId: 1,
  createdAt: new Date().toISOString(),
  status: 'active',
  isSuperAdmin: true,
  permissions: [],
  roleAssignments: [
    {
      roleId: 1,
      roleName: 'super_admin',
      scope: 'platform',
      companyId: null,
    },
  ],
}

export function DevAuthProvider({ children }: { children?: ReactNode }) {
  const value = useMemo(
    () => ({
      user: MOCK_USER,
      accessToken: 'dev-bypass-token',
      isAuthenticated: true,
      isPending: false,
      login: () => {},
      logout: () => {},
    }),
    [],
  )

  if (import.meta.env.DEV) {
    console.warn(
      '[Auth Bypass] Running with mock authentication. Backend auth is NOT required.',
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
