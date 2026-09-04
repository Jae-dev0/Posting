import type { AuthUser } from './types'
import {
  canAccessCms,
  canAccessMarketing,
  canAccessPlatform,
} from './permissions'

export type AppDepartment = 'platform' | 'cms' | 'marketing'

export function hasPlatformRole(user: AuthUser | null | undefined) {
  return canAccessPlatform(user)
}

export function hasCmsRole(user: AuthUser | null | undefined) {
  return canAccessCms(user)
}

/** Marketing Admin — or marketing.access permission. */
export function hasMarketingRole(user: AuthUser | null | undefined) {
  return canAccessMarketing(user)
}

export function getHomeDepartment(user: AuthUser | null | undefined): AppDepartment {
  if (hasPlatformRole(user)) return 'platform'
  if (hasCmsRole(user) && !hasMarketingRole(user)) return 'cms'
  if (hasMarketingRole(user)) return 'marketing'
  if (hasCmsRole(user)) return 'cms'
  return 'marketing'
}

export function getDepartmentFromPath(pathname: string): AppDepartment {
  if (pathname.startsWith('/platform')) return 'platform'
  if (pathname.startsWith('/cms')) return 'cms'
  return 'marketing'
}

export function getDepartmentHomePath(department: AppDepartment) {
  switch (department) {
    case 'platform':
      return '/platform/dashboard'
    case 'cms':
      return '/cms/dashboard'
    default:
      return '/posting/create'
  }
}

export function getRoleLabel(user: AuthUser | null | undefined) {
  if (!user) return 'Guest'
  if (user.isSuperAdmin) return 'Super Admin'
  if (hasCmsRole(user) && !hasMarketingRole(user)) return 'CMS Admin'
  if (hasMarketingRole(user)) return 'Marketing Admin'
  return 'User'
}
