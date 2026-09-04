import { RoleScope } from '@prisma/client'

import {
  ALL_PERMISSIONS,
  COMPANY_ADMIN_PERMISSIONS,
  MARKETING_ADMIN_PERMISSIONS,
  ROLE_NAMES,
} from './permissions.js'
import { prisma } from './prisma.js'

/** Idempotent: ensure RBAC catalog + platform roles exist. */
export async function ensureRbacCatalog() {
  for (const permission of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      create: permission,
      update: { description: permission.description },
    })
  }

  const allPermissions = await prisma.permission.findMany()
  const byName = new Map(allPermissions.map((p) => [p.name, p]))

  const superAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.SUPER_ADMIN },
    create: {
      name: ROLE_NAMES.SUPER_ADMIN,
      description: 'Super Admin — overall platform access',
      scope: RoleScope.platform,
    },
    update: {
      description: 'Super Admin — overall platform access',
      scope: RoleScope.platform,
    },
  })

  const companyAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.COMPANY_ADMIN },
    create: {
      name: ROLE_NAMES.COMPANY_ADMIN,
      description: 'CMS Admin — Website CMS for assigned company',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Admin — Website CMS for assigned company',
      scope: RoleScope.company,
    },
  })

  const marketingAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.MARKETING_ADMIN },
    create: {
      name: ROLE_NAMES.MARKETING_ADMIN,
      description: 'Marketing Admin — Marketing / Social Media Publisher',
      scope: RoleScope.company,
    },
    update: {
      description: 'Marketing Admin — Marketing / Social Media Publisher',
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
      create: {
        roleId: superAdmin.id,
        permissionId: permission.id,
      },
      update: {},
    })
  }

  for (const name of COMPANY_ADMIN_PERMISSIONS) {
    const permission = byName.get(name)
    if (!permission) continue
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: companyAdmin.id,
          permissionId: permission.id,
        },
      },
      create: {
        roleId: companyAdmin.id,
        permissionId: permission.id,
      },
      update: {},
    })
  }

  for (const name of MARKETING_ADMIN_PERMISSIONS) {
    const permission = byName.get(name)
    if (!permission) continue
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: marketingAdmin.id,
          permissionId: permission.id,
        },
      },
      create: {
        roleId: marketingAdmin.id,
        permissionId: permission.id,
      },
      update: {},
    })
  }

  return { superAdmin, companyAdmin, marketingAdmin }
}
