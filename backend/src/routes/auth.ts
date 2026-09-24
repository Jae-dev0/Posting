import { Router } from 'express'

import { signAccessToken } from '../lib/jwt.js'
import { verifyPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
<<<<<<< HEAD
import {
  loadAuthContext,
  requireAuth,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
=======
import { mapUser } from '../lib/user-mapper.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
>>>>>>> origin/main
import { loginSchema } from '../schemas/auth.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })

<<<<<<< HEAD
    if (
      !user ||
      user.status === 'disabled' ||
      !(await verifyPassword(body.password, user.passwordHash))
    ) {
=======
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
>>>>>>> origin/main
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

<<<<<<< HEAD
    const authUser = await loadAuthContext(user.id)
    if (!authUser) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    if (!authUser.isSuperAdmin) {
      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
      })
      if (company?.status === 'disabled') {
        res.status(403).json({ message: 'Company is disabled' })
        return
      }
    }

=======
>>>>>>> origin/main
    const accessToken = signAccessToken({ sub: user.id, email: user.email })

    res.json({
      accessToken,
<<<<<<< HEAD
      user: authUser,
=======
      user: mapUser(user),
>>>>>>> origin/main
    })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user })
})
