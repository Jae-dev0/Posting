/** Canonical permission names for platform + company CMS RBAC. */
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

export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_ADMIN: 'company_admin',
  MARKETING_ADMIN: 'marketing_admin',
} as const

export const ALL_PERMISSIONS: Array<{ name: PermissionName; description: string }> = [
  { name: PERMISSIONS.CMS_VIEW, description: 'View CMS content' },
  { name: PERMISSIONS.CMS_CREATE, description: 'Create CMS content' },
  { name: PERMISSIONS.CMS_EDIT, description: 'Edit CMS content' },
  { name: PERMISSIONS.CMS_DELETE, description: 'Delete CMS content' },
  { name: PERMISSIONS.CMS_PUBLISH, description: 'Publish CMS content' },
  { name: PERMISSIONS.COMPANY_VIEW, description: 'View companies' },
  { name: PERMISSIONS.COMPANY_CREATE, description: 'Create companies' },
  { name: PERMISSIONS.COMPANY_EDIT, description: 'Edit companies' },
  { name: PERMISSIONS.COMPANY_DELETE, description: 'Delete or disable companies' },
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
  { name: PERMISSIONS.PLATFORM_DASHBOARD, description: 'View platform dashboard' },
  { name: PERMISSIONS.MARKETING_ACCESS, description: 'Access Marketing system' },
]

export const COMPANY_ADMIN_PERMISSIONS: PermissionName[] = [
  PERMISSIONS.CMS_VIEW,
  PERMISSIONS.CMS_CREATE,
  PERMISSIONS.CMS_EDIT,
  PERMISSIONS.CMS_DELETE,
  PERMISSIONS.CMS_PUBLISH,
  PERMISSIONS.SETTINGS_VIEW,
  PERMISSIONS.SETTINGS_EDIT,
  PERMISSIONS.AUDIT_VIEW,
]

export const MARKETING_ADMIN_PERMISSIONS: PermissionName[] = [
  PERMISSIONS.MARKETING_ACCESS,
]
