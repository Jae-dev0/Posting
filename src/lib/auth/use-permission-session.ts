import { useCallback, useMemo } from 'react'

import { useAuth } from './hooks'
import {
  can,
  canAccessCms,
  canAccessCompany,
  canAccessMarketing,
  canAccessPlatform,
  canAll,
  canAny,
  type PermissionLike,
} from './permissions'
import type { AuthUser } from './types'

export type PermissionSession = {
  user: AuthUser | null
  can: (permission: PermissionLike) => boolean
  canAny: (permissions: PermissionLike[]) => boolean
  canAll: (permissions: PermissionLike[]) => boolean
  canAccessCompany: (companyId: number) => boolean
  canAccessPlatform: boolean
  canAccessCms: boolean
  canAccessMarketing: boolean
}

/**
 * Template-style session capabilities over the signed-in AuthUser.
 * Super Admin bypasses all permission checks via `can()`.
 */
export function usePermissionSession(): PermissionSession {
  const { user } = useAuth()

  const canFn = useCallback(
    (permission: PermissionLike) => can(user, permission),
    [user],
  )
  const canAnyFn = useCallback(
    (permissions: PermissionLike[]) => canAny(user, permissions),
    [user],
  )
  const canAllFn = useCallback(
    (permissions: PermissionLike[]) => canAll(user, permissions),
    [user],
  )
  const canAccessCompanyFn = useCallback(
    (companyId: number) => canAccessCompany(user, companyId),
    [user],
  )

  return useMemo(
    () => ({
      user,
      can: canFn,
      canAny: canAnyFn,
      canAll: canAllFn,
      canAccessCompany: canAccessCompanyFn,
      canAccessPlatform: canAccessPlatform(user),
      canAccessCms: canAccessCms(user),
      canAccessMarketing: canAccessMarketing(user),
    }),
    [user, canFn, canAnyFn, canAllFn, canAccessCompanyFn],
  )
}
