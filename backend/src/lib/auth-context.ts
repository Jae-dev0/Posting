import type {
  Permission,
  Role,
  User,
  UserRoleAssignment,
  WebsiteAccessMode,
} from '@prisma/client'

import { ROLE_NAMES, type PermissionName } from './permissions.js'
import { mapUser } from './user-mapper.js'

export type RoleAssignmentWithRole = UserRoleAssignment & {
  role: Role & { permissions: Array<{ permission: Permission }> }
}

export type AuthContextUser = ReturnType<typeof mapUser> & {
  status: User['status']
  websiteAccessMode: WebsiteAccessMode
  isSuperAdmin: boolean
  permissions: PermissionName[]
  roleAssignments: Array<{
    roleId: number
    roleName: string
    scope: Role['scope']
    companyId: number | null
  }>
}

export function buildAuthContext(
  user: User,
  assignments: RoleAssignmentWithRole[],
): AuthContextUser {
  const permissionSet = new Set<PermissionName>()
  let isSuperAdmin = false

  // Never merge another company's grants into the user's home-company session.
  const applicableAssignments = assignments.filter((assignment) =>
    assignment.role.scope === 'platform'
      ? assignment.companyId === null
      : assignment.companyId === user.companyId &&
        (assignment.role.companyId == null ||
          assignment.role.companyId === user.companyId),
  )

  for (const assignment of applicableAssignments) {
    if (
      assignment.role.name === ROLE_NAMES.SUPER_ADMIN &&
      assignment.role.scope === 'platform'
    ) {
      isSuperAdmin = true
    }
    for (const rp of assignment.role.permissions) {
      permissionSet.add(rp.permission.name as PermissionName)
    }
  }

  return {
    ...mapUser(user),
    status: user.status,
    websiteAccessMode: user.websiteAccessMode,
    isSuperAdmin,
    permissions: [...permissionSet],
    roleAssignments: applicableAssignments.map((a) => ({
      roleId: a.roleId,
      roleName: a.role.name,
      scope: a.role.scope,
      companyId: a.companyId,
    })),
  }
}

export function userHasPermission(
  user: AuthContextUser,
  permission: PermissionName,
) {
  if (user.isSuperAdmin) {
    return true
  }
  return user.permissions.includes(permission)
}
