/** Canonical permission names for platform + company CMS RBAC. */
export const PERMISSIONS = {
  WEBSITE_VIEW: 'website.view',
  WEBSITE_CREATE: 'website.create',
  WEBSITE_EDIT: 'website.edit',
  WEBSITE_DELETE: 'website.delete',
  PAGE_VIEW: 'page.view',
  PAGE_CREATE: 'page.create',
  PAGE_EDIT: 'page.edit',
  PAGE_DELETE: 'page.delete',
  PAGE_PUBLISH: 'page.publish',
  NAVIGATION_VIEW: 'navigation.view',
  NAVIGATION_CREATE: 'navigation.create',
  NAVIGATION_EDIT: 'navigation.edit',
  NAVIGATION_DELETE: 'navigation.delete',
  MEDIA_VIEW: 'media.view',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  ANALYTICS_VIEW: 'analytics.view',
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

export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  /** Full CMS Admin for a company. */
  COMPANY_ADMIN: 'company_admin',
  /** Marketing Admin for a company. */
  MARKETING_ADMIN: 'marketing_admin',
  EMPLOYEE: 'employee',
} as const

export const ALL_PERMISSIONS: Array<{
  name: PermissionName
  description: string
}> = [
  { name: PERMISSIONS.WEBSITE_VIEW, description: 'View company websites' },
  { name: PERMISSIONS.WEBSITE_CREATE, description: 'Create company websites' },
  { name: PERMISSIONS.WEBSITE_EDIT, description: 'Edit company websites' },
  { name: PERMISSIONS.WEBSITE_DELETE, description: 'Delete company websites' },
  { name: PERMISSIONS.PAGE_VIEW, description: 'View website pages' },
  { name: PERMISSIONS.PAGE_CREATE, description: 'Create website pages' },
  { name: PERMISSIONS.PAGE_EDIT, description: 'Edit website pages' },
  { name: PERMISSIONS.PAGE_DELETE, description: 'Delete website pages' },
  { name: PERMISSIONS.PAGE_PUBLISH, description: 'Publish website pages' },
  { name: PERMISSIONS.NAVIGATION_VIEW, description: 'View website navigation' },
  {
    name: PERMISSIONS.NAVIGATION_CREATE,
    description: 'Create website navigation',
  },
  { name: PERMISSIONS.NAVIGATION_EDIT, description: 'Edit website navigation' },
  {
    name: PERMISSIONS.NAVIGATION_DELETE,
    description: 'Delete website navigation',
  },
  { name: PERMISSIONS.MEDIA_VIEW, description: 'View website media' },
  { name: PERMISSIONS.MEDIA_UPLOAD, description: 'Upload website media' },
  { name: PERMISSIONS.MEDIA_DELETE, description: 'Delete website media' },
  { name: PERMISSIONS.ANALYTICS_VIEW, description: 'View CMS analytics' },
  { name: PERMISSIONS.CMS_VIEW, description: 'View CMS content' },
  { name: PERMISSIONS.CMS_CREATE, description: 'Create CMS content' },
  { name: PERMISSIONS.CMS_EDIT, description: 'Edit CMS content' },
  { name: PERMISSIONS.CMS_DELETE, description: 'Delete CMS content' },
  { name: PERMISSIONS.CMS_PUBLISH, description: 'Publish CMS content' },
  { name: PERMISSIONS.COMPANY_VIEW, description: 'View companies' },
  { name: PERMISSIONS.COMPANY_CREATE, description: 'Create companies' },
  { name: PERMISSIONS.COMPANY_EDIT, description: 'Edit companies' },
  {
    name: PERMISSIONS.COMPANY_DELETE,
    description: 'Delete or disable companies',
  },
  { name: PERMISSIONS.USER_VIEW, description: 'View users' },
  { name: PERMISSIONS.USER_CREATE, description: 'Create users' },
  { name: PERMISSIONS.USER_EDIT, description: 'Edit users' },
  { name: PERMISSIONS.USER_DELETE, description: 'Delete users' },
  { name: PERMISSIONS.ROLE_VIEW, description: 'View roles' },
  { name: PERMISSIONS.ROLE_CREATE, description: 'Create roles' },
  { name: PERMISSIONS.ROLE_EDIT, description: 'Edit roles' },
  { name: PERMISSIONS.ROLE_DELETE, description: 'Delete roles' },
  { name: PERMISSIONS.SETTINGS_VIEW, description: 'View settings' },
  { name: PERMISSIONS.SETTINGS_EDIT, description: 'Edit settings' },
  { name: PERMISSIONS.AUDIT_VIEW, description: 'View audit logs' },
  {
    name: PERMISSIONS.PLATFORM_DASHBOARD,
    description: 'View platform dashboard',
  },
  {
    name: PERMISSIONS.MARKETING_ACCESS,
    description: 'Access Marketing system',
  },
]

/** CMS Admin — full CMS and company-user management. */
export const COMPANY_ADMIN_PERMISSIONS: PermissionName[] = [
  PERMISSIONS.WEBSITE_VIEW,
  PERMISSIONS.WEBSITE_CREATE,
  PERMISSIONS.WEBSITE_EDIT,
  PERMISSIONS.WEBSITE_DELETE,
  PERMISSIONS.PAGE_VIEW,
  PERMISSIONS.PAGE_CREATE,
  PERMISSIONS.PAGE_EDIT,
  PERMISSIONS.PAGE_DELETE,
  PERMISSIONS.PAGE_PUBLISH,
  PERMISSIONS.NAVIGATION_VIEW,
  PERMISSIONS.NAVIGATION_CREATE,
  PERMISSIONS.NAVIGATION_EDIT,
  PERMISSIONS.NAVIGATION_DELETE,
  PERMISSIONS.MEDIA_VIEW,
  PERMISSIONS.MEDIA_UPLOAD,
  PERMISSIONS.MEDIA_DELETE,
  PERMISSIONS.ANALYTICS_VIEW,
  PERMISSIONS.CMS_VIEW,
  PERMISSIONS.CMS_CREATE,
  PERMISSIONS.CMS_EDIT,
  PERMISSIONS.CMS_DELETE,
  PERMISSIONS.CMS_PUBLISH,
  PERMISSIONS.SETTINGS_VIEW,
  PERMISSIONS.SETTINGS_EDIT,
  PERMISSIONS.AUDIT_VIEW,
  PERMISSIONS.USER_VIEW,
  PERMISSIONS.USER_CREATE,
  PERMISSIONS.USER_EDIT,
  PERMISSIONS.USER_DELETE,
]

/** Marketing Admin — Marketing access (user CRUD uses Marketing main_admin gate). */
export const MARKETING_ADMIN_PERMISSIONS: PermissionName[] = [
  PERMISSIONS.MARKETING_ACCESS,
]

export const CMS_ROLE_NAMES = new Set<string>([ROLE_NAMES.COMPANY_ADMIN])
