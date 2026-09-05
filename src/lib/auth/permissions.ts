/**
 * Canonical permission names — keep in sync with backend/src/lib/permissions.ts
 */
export const PERMISSIONS = {
  CMS_VIEW: 'cms.view',
  CMS_CREATE: 'cms.create',
  CMS_EDIT: 'cms.edit',
  CMS_DELETE: 'cms.delete',
  CMS_PUBLISH: 'cms.publish',
  COMPANY_VIEW: 'company.view',
  COMPANY_CREATE: 'company.create',
  COMPANY_EDIT: 'company.edit',
  COMPANY_DELETE: 'company.delete',
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_EDIT: 'role.edit',
  ROLE_DELETE: 'role.delete',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  AUDIT_VIEW: 'audit.view',
  PLATFORM_DASHBOARD: 'platform.dashboard',
  MARKETING_ACCESS: 'marketing.access',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export type PermissionLike = PermissionName | string

export type PermissionSubject = {
  isSuperAdmin?: boolean
  permissions?: string[]
  role?: string
  roleAssignments?: Array<{
    roleName: string
    scope: string
    companyId: number | null
  }>
  companyId?: number
}

/** True when the subject may perform the permission (Super Admin bypasses). */
export function can(
  subject: PermissionSubject | null | undefined,
  permission: PermissionLike,
): boolean {
  if (!subject) return false
  if (subject.isSuperAdmin) return true
  return Boolean(subject.permissions?.includes(permission))
}

export function canAny(
  subject: PermissionSubject | null | undefined,
  permissions: PermissionLike[],
): boolean {
  if (!subject) return false
  if (subject.isSuperAdmin) return true
  return permissions.some((permission) => can(subject, permission))
}

export function canAll(
  subject: PermissionSubject | null | undefined,
  permissions: PermissionLike[],
): boolean {
  if (!subject) return false
  if (subject.isSuperAdmin) return true
  return permissions.every((permission) => can(subject, permission))
}

/**
 * Tenant resource access: Super Admin sees all companies;
 * others only their own companyId.
 */
export function canAccessCompany(
  subject: PermissionSubject | null | undefined,
  resourceCompanyId: number,
): boolean {
  if (!subject) return false
  if (subject.isSuperAdmin) return true
  return subject.companyId === resourceCompanyId
}

/** Platform admin area — dashboard or any company/user/role admin capability. */
export function canAccessPlatform(
  subject: PermissionSubject | null | undefined,
): boolean {
  return canAny(subject, [
    PERMISSIONS.PLATFORM_DASHBOARD,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.AUDIT_VIEW,
  ])
}

/** Company CMS area. */
export function canAccessCms(
  subject: PermissionSubject | null | undefined,
): boolean {
  if (can(subject, PERMISSIONS.CMS_VIEW)) return true
  return Boolean(
    subject?.roleAssignments?.some((a) =>
      ['company_admin', 'cms_admin', 'cms_sub_admin'].includes(a.roleName),
    ),
  )
}

/**
 * Marketing area — prefers `marketing.access`, falls back to Marketing roles.
 * CMS Admin / CMS Sub Admin are excluded from the legacy fallback.
 */
export function canAccessMarketing(
  subject: PermissionSubject | null | undefined,
): boolean {
  if (!subject) return false
  if (can(subject, PERMISSIONS.MARKETING_ACCESS)) return true
  if (subject.isSuperAdmin) return true
  if (
    subject.roleAssignments?.some((a) => a.roleName === 'marketing_admin')
  ) {
    return true
  }
  const isCmsOnly = subject.roleAssignments?.some((a) =>
    ['company_admin', 'cms_admin', 'cms_sub_admin'].includes(a.roleName),
  )
  if (isCmsOnly) return false
  return subject.role === 'main_admin' || subject.role === 'admin'
}
