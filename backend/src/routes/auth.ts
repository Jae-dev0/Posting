import { Router } from 'express'

import { signAccessToken } from '../lib/jwt.js'
import { verifyPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { loginSchema } from '../schemas/auth.js'

export const authRouter = Router()

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })

    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      res.status(401).json({ message: 'Invalid email or password' })
      return
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email })

    res.json({
      accessToken,
      user: mapUser(user),
    })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user })
})
