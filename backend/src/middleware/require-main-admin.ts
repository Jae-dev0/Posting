import type { NextFunction, Response } from 'express'

import type { AuthenticatedRequest } from './auth.js'

export function requireMainAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== 'main_admin') {
    res.status(403).json({ message: 'Account management requires main admin access' })
    return
  }

  next()
}
