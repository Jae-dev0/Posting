import { RoleScope } from '@prisma/client'

import {
  ALL_PERMISSIONS,
  COMPANY_ADMIN_PERMISSIONS,
  MARKETING_ADMIN_PERMISSIONS,
  ROLE_NAMES,
  type PermissionName,
} from './permissions.js'
import { prisma } from './prisma.js'

async function grantPermissions(
  roleId: number,
  names: PermissionName[],
  byName: Map<string, { id: number }>,
) {
  for (const name of names) {
    const permission = byName.get(name)
    if (!permission) continue
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId: permission.id } },
      create: { roleId, permissionId: permission.id },
      update: {},
    })
  }
}

export async function ensureRbacCatalog() {
  for (const permission of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      create: permission,
      update: { description: permission.description },
    })
  }

  const allPermissions = await prisma.permission.findMany()
  const byName = new Map(
    allPermissions.map((permission) => [permission.name, permission]),
  )
  const existingRoles = await prisma.role.findMany({ select: { name: true } })
  const existingRoleNames = new Set(existingRoles.map((role) => role.name))

  const superAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.SUPER_ADMIN },
    create: {
      name: ROLE_NAMES.SUPER_ADMIN,
      description: 'Main Admin — overall platform access',
      scope: RoleScope.platform,
    },
    update: {
      description: 'Main Admin — overall platform access',
      scope: RoleScope.platform,
    },
  })
  const companyAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.COMPANY_ADMIN },
    create: {
      name: ROLE_NAMES.COMPANY_ADMIN,
      description: 'CMS Admin — Website CMS management',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Admin — Website CMS management',
      scope: RoleScope.company,
    },
  })
  const marketingAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.MARKETING_ADMIN },
    create: {
      name: ROLE_NAMES.MARKETING_ADMIN,
      description: 'Marketing Admin — Marketing management',
      scope: RoleScope.company,
    },
    update: {
      description: 'Marketing Admin — Marketing management',
      scope: RoleScope.company,
    },
  })
  const employee = await prisma.role.upsert({
    where: { name: ROLE_NAMES.EMPLOYEE },
    create: {
      name: ROLE_NAMES.EMPLOYEE,
      description: 'Employee — standard non-admin account',
      scope: RoleScope.company,
    },
    update: {
      description: 'Employee — standard non-admin account',
      scope: RoleScope.company,
    },
  })

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdmin.id,
          permissionId: permission.id,
        },
      },
      create: { roleId: superAdmin.id, permissionId: permission.id },
      update: {},
    })
  }
  if (!existingRoleNames.has(ROLE_NAMES.COMPANY_ADMIN))
    await grantPermissions(companyAdmin.id, COMPANY_ADMIN_PERMISSIONS, byName)
  if (!existingRoleNames.has(ROLE_NAMES.MARKETING_ADMIN))
    await grantPermissions(
      marketingAdmin.id,
      MARKETING_ADMIN_PERMISSIONS,
      byName,
    )

  const obsoleteRole = await prisma.role.findUnique({
    where: { name: 'cms_sub_admin' },
  })
  if (obsoleteRole) {
    const assignments = await prisma.userRoleAssignment.findMany({
      where: { roleId: obsoleteRole.id },
    })
    for (const assignment of assignments) {
      const existing = await prisma.userRoleAssignment.findFirst({
        where: {
          userId: assignment.userId,
          roleId: employee.id,
          companyId: assignment.companyId,
        },
      })
      if (!existing) {
        await prisma.userRoleAssignment.create({
          data: {
            userId: assignment.userId,
            roleId: employee.id,
            companyId: assignment.companyId,
          },
        })
      }
    }
    await prisma.role.delete({ where: { id: obsoleteRole.id } })
  }

  return { superAdmin, companyAdmin, marketingAdmin, employee }
}
