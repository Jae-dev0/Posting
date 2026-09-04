import type { NextFunction, Request, Response } from 'express'

import { verifyAccessToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'

export type AuthenticatedRequest = Request & {
  user?: ReturnType<typeof mapUser>
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user) {
      res.status(401).json({ message: 'Invalid or expired token' })
      return
    }

    req.user = mapUser(user)
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
