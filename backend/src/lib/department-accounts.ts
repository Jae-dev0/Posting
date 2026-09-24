import type { Prisma } from '@prisma/client'

import { ROLE_NAMES } from './permissions.js'

/** Company-owned custom roles belong to CMS in the current account model. */
export function cmsRolesWhere(companyId: number): Prisma.RoleWhereInput {
  return {
    scope: 'company',
    name: { notIn: [ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.MARKETING_ADMIN] },
    OR: [
      { companyId },
      {
        companyId: null,
        name: ROLE_NAMES.COMPANY_ADMIN,
      },
    ],
  }
}

/** Department screens never manage platform or mixed-department identities. */
export function cmsAccountsWhere(companyId: number): Prisma.UserWhereInput {
  const assignment = { companyId, role: cmsRolesWhere(companyId) }
  return {
    companyId,
    roleAssignments: { some: assignment, every: assignment },
  }
}

export function marketingAccountsWhere(
  companyId: number,
): Prisma.UserWhereInput {
  return {
    companyId,
    // Marketing Sub Admins use the legacy User.role without an RBAC assignment.
    // An explicit CMS/platform/foreign-company assignment excludes the account.
    roleAssignments: {
      every: {
        companyId,
        role: {
          name: ROLE_NAMES.MARKETING_ADMIN,
          scope: 'company',
          OR: [{ companyId: null }, { companyId }],
        },
      },
    },
  }
}
