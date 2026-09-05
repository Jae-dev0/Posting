import { RoleScope } from '@prisma/client'

import {
  ALL_PERMISSIONS,
  CMS_SUB_ADMIN_PERMISSIONS,
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
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
      create: {
        roleId,
        permissionId: permission.id,
      },
      update: {},
    })
  }
}

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
      description: 'Super Admin — overall platform access; sees all accounts',
      scope: RoleScope.platform,
    },
    update: {
      description: 'Super Admin — overall platform access; sees all accounts',
      scope: RoleScope.platform,
    },
  })

  const companyAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.COMPANY_ADMIN },
    create: {
      name: ROLE_NAMES.COMPANY_ADMIN,
      description: 'CMS Admin — Website CMS + create CMS sub-admins',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Admin — Website CMS + create CMS sub-admins',
      scope: RoleScope.company,
    },
  })

  const cmsSubAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.CMS_SUB_ADMIN },
    create: {
      name: ROLE_NAMES.CMS_SUB_ADMIN,
      description: 'CMS Sub Admin — CMS content only',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Sub Admin — CMS content only',
      scope: RoleScope.company,
    },
  })

  const marketingAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.MARKETING_ADMIN },
    create: {
      name: ROLE_NAMES.MARKETING_ADMIN,
      description: 'Marketing Admin — Marketing + create Marketing sub-admins',
      scope: RoleScope.company,
    },
    update: {
      description: 'Marketing Admin — Marketing + create Marketing sub-admins',
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

  await grantPermissions(companyAdmin.id, COMPANY_ADMIN_PERMISSIONS, byName)
  await grantPermissions(cmsSubAdmin.id, CMS_SUB_ADMIN_PERMISSIONS, byName)
  await grantPermissions(marketingAdmin.id, MARKETING_ADMIN_PERMISSIONS, byName)

  return { superAdmin, companyAdmin, cmsSubAdmin, marketingAdmin }
}
