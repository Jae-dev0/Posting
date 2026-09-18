import type { NextFunction, Response } from 'express'

import type { AuthenticatedRequest } from './auth.js'

/** Marketing Main Admin gate — Super Admin may also manage when acting in a company. */
export function requireMainAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const user = req.user
  const hasMarketingAdminRole = user?.roleAssignments.some(
    (assignment) =>
      assignment.roleName === 'marketing_admin' &&
      assignment.companyId === user.companyId,
  )
  const isLegacyMarketingAdmin =
    user?.role === 'main_admin' && user.roleAssignments.length === 0
  if (user?.isSuperAdmin || hasMarketingAdminRole || isLegacyMarketingAdmin) {
    next()
    return
  }

  res
    .status(403)
    .json({ message: 'Account management requires main admin access' })
}
