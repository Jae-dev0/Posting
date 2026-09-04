import type { PlatformRole, PermissionCatalogItem } from '@/features/platform/api'
import type { ID } from '@/types'

export type PermissionGroupTypes = {
  group_id: string
  name: string
  description: string
  is_active: boolean
  prefix: string
}

export type PermissionTypes = {
  permission_id: ID
  group_id: string
  category: string
  name: string
  description: string
  rawName: string
}

export type RolePermissionGrant = {
  role_id: ID
  permission_id: ID
  granted: boolean
}

const GROUP_META: Record<
  string,
  { name: string; description: string; order: number }
> = {
  cms: {
    name: 'Content Management',
    description: 'Pages, media, navigation, and CMS publishing',
    order: 1,
  },
  company: {
    name: 'Companies',
    description: 'Company records and tenant administration',
    order: 2,
  },
  user: {
    name: 'Users',
    description: 'User accounts and assignments',
    order: 3,
  },
  role: {
    name: 'Roles',
    description: 'Role catalog and permission management',
    order: 4,
  },
  settings: {
    name: 'Settings',
    description: 'CMS and platform configuration',
    order: 5,
  },
  audit: {
    name: 'Audit',
    description: 'Audit log visibility',
    order: 6,
  },
  platform: {
    name: 'Platform',
    description: 'Platform dashboard and system controls',
    order: 7,
  },
  marketing: {
    name: 'Marketing',
    description: 'Access to the existing Marketing system',
    order: 8,
  },
}

function humanizePermissionName(name: string): string {
  const action = name.split('.').slice(1).join(' ') || name
  return action
    .split(/[._\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Template-style categories: View / Create / Edit / Delete / Publish / General */
function categoryFromPermission(name: string): string {
  const action = (name.split('.')[1] ?? 'general').toLowerCase()
  const known: Record<string, string> = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    publish: 'Publish',
    access: 'Access',
    dashboard: 'Dashboard',
  }
  return known[action] ?? 'General'
}

export function buildPermissionGroups(
  permissions: PermissionCatalogItem[],
): PermissionGroupTypes[] {
  const prefixes = new Set(
    permissions.map((permission) => permission.name.split('.')[0] ?? 'other'),
  )

  return [...prefixes]
    .map((prefix) => {
      const meta = GROUP_META[prefix]
      return {
        group_id: prefix,
        name: meta?.name ?? prefix.charAt(0).toUpperCase() + prefix.slice(1),
        description: meta?.description ?? `Permissions under ${prefix}.*`,
        is_active: true,
        prefix,
        order: meta?.order ?? 99,
      }
    })
    .sort((a, b) => a.order - b.order)
    .map(({ order: _order, ...group }) => group)
}

export function getPermissionsByGroup(
  groupId: string,
  permissions: PermissionCatalogItem[],
): PermissionTypes[] {
  return permissions
    .filter((permission) => (permission.name.split('.')[0] ?? '') === groupId)
    .map((permission) => ({
      permission_id: permission.id,
      group_id: groupId,
      category: categoryFromPermission(permission.name),
      name: humanizePermissionName(permission.name),
      description: permission.description ?? permission.name,
      rawName: permission.name,
    }))
}

export function getAssignedRoleCount(
  groupId: string,
  permissions: PermissionCatalogItem[],
  roles: PlatformRole[],
): number {
  const permissionIds = new Set(
    getPermissionsByGroup(groupId, permissions).map((p) => p.permission_id),
  )
  return roles.filter((role) =>
    role.permissions.some((permission) => permissionIds.has(permission.id)),
  ).length
}

export function buildRolePermissionGrants(
  groupPermissions: PermissionTypes[],
  roles: PlatformRole[],
): RolePermissionGrant[] {
  const permissionIds = new Set(
    groupPermissions.map((permission) => permission.permission_id),
  )

  return roles.flatMap((role) => {
    const grantedIds = new Set(role.permissions.map((p) => p.id))
    return [...permissionIds].map((permission_id) => ({
      role_id: role.id,
      permission_id,
      granted: grantedIds.has(permission_id),
    }))
  })
}

export function groupPermissionsByCategory(
  permissions: PermissionTypes[],
): { category: string; permissions: PermissionTypes[] }[] {
  const categories: string[] = []
  const byCategory = new Map<string, PermissionTypes[]>()

  for (const permission of permissions) {
    const { category } = permission
    if (!byCategory.has(category)) {
      byCategory.set(category, [])
      categories.push(category)
    }
    byCategory.get(category)?.push(permission)
  }

  return categories.map((category) => ({
    category,
    permissions: byCategory.get(category) ?? [],
  }))
}
