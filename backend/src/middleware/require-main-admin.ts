import type { NextFunction, Response } from 'express'

import type { AuthenticatedRequest } from './auth.js'

/** Marketing Main Admin gate — Super Admin may also manage when acting in a company. */
export function requireMainAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.isSuperAdmin || req.user?.role === 'main_admin') {
    next()
    return
  }

  res.status(403).json({ message: 'Account management requires main admin access' })
}
