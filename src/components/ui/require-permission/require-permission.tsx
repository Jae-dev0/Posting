import { Alert, Box } from '@mui/material'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router'

import { paths } from '@/config/paths'
import { getDepartmentHomePath } from '@/lib/auth/departments'
import { useAuth, useHomeDepartment } from '@/lib/auth/hooks'
import { can, canAny, type PermissionLike } from '@/lib/auth/permissions'

export type RequirePermissionProps = {
  /** Single permission, or any-of list. */
  permission: PermissionLike | PermissionLike[]
  children: ReactNode
  fallback?: 'redirect' | 'alert' | 'null'
  /** Override redirect target when denied (default: department home). */
  redirectTo?: string
}

export function RequirePermission({
  permission,
  children,
  fallback = 'redirect',
  redirectTo,
}: RequirePermissionProps) {
  const { user } = useAuth()
  const department = useHomeDepartment()
  const allowed = Array.isArray(permission)
    ? canAny(user, permission)
    : can(user, permission)

  if (allowed) {
    return <>{children}</>
  }

  if (fallback === 'null') {
    return null
  }

  if (fallback === 'alert') {
    return (
      <Box p={3}>
        <Alert severity="warning">
          You do not have permission to view this area.
        </Alert>
      </Box>
    )
  }

  return (
    <Navigate to={redirectTo ?? getDepartmentHomePath(department)} replace />
  )
}

export type CanProps = {
  permission: PermissionLike | PermissionLike[]
  children: ReactNode
  fallback?: ReactNode
}

/** Conditionally render children when the user has the capability. */
export function Can({ permission, children, fallback = null }: CanProps) {
  const { user } = useAuth()
  const allowed = Array.isArray(permission)
    ? canAny(user, permission)
    : can(user, permission)

  if (!allowed) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/** Convenience: deny → home/login path. */
export function RequirePermissionOrHome({
  permission,
  children,
}: {
  permission: PermissionLike | PermissionLike[]
  children: ReactNode
}) {
  return (
    <RequirePermission
      permission={permission}
      redirectTo={paths.home.getHref()}
    >
      {children}
    </RequirePermission>
  )
}
