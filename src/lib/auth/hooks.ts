import { useContext } from 'react'

import { AuthContext } from './context'
import {
  getHomeDepartment,
  getRoleLabel,
  hasCmsRole,
  hasMarketingRole,
  hasPlatformRole,
} from './departments'
import {
  can,
  canAccessCompany,
  canAny,
  PERMISSIONS,
  type PermissionLike,
} from './permissions'
import type { AuthUser } from './types'
import { usePermissionSession } from './use-permission-session'

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
  // Super Admin or Marketing Admin (account management)
  return Boolean(user?.isSuperAdmin || user?.role === 'main_admin')
}

export function useIsSuperAdmin() {
  const { user } = useAuth()
  return Boolean(user?.isSuperAdmin)
}

export function useIsCompanyAdmin() {
  const { user } = useAuth()
  return hasCmsRole(user)
}

export function useHasMarketingAccess() {
  const { user } = useAuth()
  return hasMarketingRole(user)
}

export function useHasCmsAccess() {
  const { user } = useAuth()
  return hasCmsRole(user)
}

export function useHasPlatformAccess() {
  const { user } = useAuth()
  return hasPlatformRole(user)
}

export function useHomeDepartment() {
  const { user } = useAuth()
  return getHomeDepartment(user)
}

export function useRoleLabel() {
  const { user } = useAuth()
  return getRoleLabel(user)
}

export function useHasPermission(permission: PermissionLike) {
  const { user } = useAuth()
  return can(user, permission)
}

export function useCan(permission: PermissionLike | PermissionLike[]) {
  const { user } = useAuth()
  if (Array.isArray(permission)) {
    return canAny(user, permission)
  }
  return can(user, permission)
}

export function useCanAccessCompany(companyId: number) {
  const { user } = useAuth()
  return canAccessCompany(user, companyId)
}

export { usePermissionSession, PERMISSIONS }
