import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { hashPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'
import {
  requireAuth,
  resolveTenantScope,
  requireTenantCompany,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { requireMainAdmin } from '../middleware/require-main-admin.js'
import { createUserSchema, updateUserSchema } from '../schemas/users.js'

export const usersRouter = Router()

usersRouter.use(
  requireAuth,
  requireMainAdmin,
  resolveTenantScope(),
  requireTenantCompany,
)

const MAIN_ADMIN_ROLE = UserRole.main_admin

async function countMainAdmins() {
  return prisma.user.count({ where: { role: MAIN_ADMIN_ROLE } })
}

usersRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.tenantCompanyId!

    const users = await prisma.user.findMany({
      where: { companyId },
      orderBy: [{ role: 'asc' }, { id: 'asc' }],
    })
    res.json(users.map(mapUser))
  } catch (error) {
    next(error)
  }
})

usersRouter.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.tenantCompanyId!

    const body = createUserSchema.parse(req.body)
    const { firstName, lastName, email, password } = body
    // Marketing Admin may only create Marketing Sub Admins (`admin`).
    // Super Admin may also create Marketing Admins (`main_admin`).
    const role =
      req.user?.isSuperAdmin && body.role === MAIN_ADMIN_ROLE
        ? MAIN_ADMIN_ROLE
        : UserRole.admin

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email.toLowerCase(),
        passwordHash,
        role,
        companyId,
      },
    })

    res.status(201).json(mapUser(user))
  } catch (error) {
    next(error)
  }
})

usersRouter.patch('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.tenantCompanyId!

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    const body = updateUserSchema.parse(req.body)
    const existing = await prisma.user.findFirst({ where: { id, companyId } })

    if (!existing) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    const isPromotingToMainAdmin =
      body.role === MAIN_ADMIN_ROLE && existing.role !== MAIN_ADMIN_ROLE

    if (isPromotingToMainAdmin && !req.user?.isSuperAdmin) {
      res.status(403).json({
        message: 'Only Super Admin can promote a Marketing Sub Admin',
      })
      return
    }

    const isDemotingMainAdmin =
      existing.role === MAIN_ADMIN_ROLE &&
      body.role !== undefined &&
      body.role !== MAIN_ADMIN_ROLE

    if (isDemotingMainAdmin) {
      const mainAdminCount = await countMainAdmins()
      if (mainAdminCount <= 1) {
        res.status(400).json({
          message: 'Cannot demote the last main admin',
        })
        return
      }
    }

    const passwordHash =
      body.password !== undefined ? await hashPassword(body.password) : undefined

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email?.toLowerCase(),
        role: body.role,
        passwordHash,
      },
    })

    res.json(mapUser(user))
  } catch (error) {
    next(error)
  }
})

usersRouter.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.tenantCompanyId!

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    if (req.user?.id === id) {
      res.status(400).json({ message: 'You cannot delete your own account' })
      return
    }

    const existing = await prisma.user.findFirst({ where: { id, companyId } })

    if (!existing) {
      res.status(404).json({ message: 'User not found' })
      return
    }

    if (existing.role === MAIN_ADMIN_ROLE) {
      const mainAdminCount = await countMainAdmins()
      if (mainAdminCount <= 1) {
        res.status(400).json({
          message: 'Cannot delete the last main admin',
        })
        return
      }
    }

    await prisma.user.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
