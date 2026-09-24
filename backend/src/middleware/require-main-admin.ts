import type { NextFunction, Response } from 'express'

import type { AuthenticatedRequest } from './auth.js'

<<<<<<< HEAD
/** Marketing Main Admin gate — Super Admin may also manage when acting in a company. */
=======
>>>>>>> origin/main
export function requireMainAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
<<<<<<< HEAD
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
=======
  if (req.user?.role !== 'main_admin') {
    res.status(403).json({ message: 'Account management requires main admin access' })
    return
  }

  next()
>>>>>>> origin/main
}
