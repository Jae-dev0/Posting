import type { Permission, Role, User, UserRoleAssignment } from '@prisma/client'

import { ROLE_NAMES, type PermissionName } from './permissions.js'
import { mapUser } from './user-mapper.js'

export type RoleAssignmentWithRole = UserRoleAssignment & {
  role: Role & { permissions: Array<{ permission: Permission }> }
}

export type AuthContextUser = ReturnType<typeof mapUser> & {
  status: User['status']
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

  for (const assignment of assignments) {
    if (assignment.role.name === ROLE_NAMES.SUPER_ADMIN) {
      isSuperAdmin = true
    }
    for (const rp of assignment.role.permissions) {
      permissionSet.add(rp.permission.name as PermissionName)
    }
  }

  return {
    ...mapUser(user),
    status: user.status,
    isSuperAdmin,
    permissions: [...permissionSet],
    roleAssignments: assignments.map((a) => ({
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
