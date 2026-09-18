import type { AuthenticatedRequest } from '../middleware/auth.js'

import { ROLE_NAMES } from './permissions.js'
import { prisma } from './prisma.js'

export function isCompanyAdmin(
  req: AuthenticatedRequest,
  companyId: number,
) {
  return Boolean(
    req.user?.isSuperAdmin ||
      req.user?.roleAssignments.some(
        (assignment) =>
          assignment.companyId === companyId &&
          assignment.roleName === ROLE_NAMES.COMPANY_ADMIN,
      ),
  )
}

export async function getAccessibleWebsiteIds(
  req: AuthenticatedRequest,
  companyId: number,
): Promise<number[] | null> {
  const user = req.user
  if (!user || user.isSuperAdmin || isCompanyAdmin(req, companyId)) {
    return null
  }

  if (user.websiteAccessMode === 'all_websites') {
    const websites = await prisma.website.findMany({
      where: { companyId },
      select: { id: true },
    })
    return websites.map((website) => website.id)
  }

  const assignments = await prisma.userWebsiteAccess.findMany({
    where: { userId: user.id, website: { companyId } },
    select: { websiteId: true },
  })
  return assignments.map((assignment) => assignment.websiteId)
}

export async function canAccessWebsite(
  req: AuthenticatedRequest,
  companyId: number,
  websiteId: number,
) {
  const websiteIds = await getAccessibleWebsiteIds(req, companyId)
  return websiteIds === null || websiteIds.includes(websiteId)
}
