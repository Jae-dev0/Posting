<<<<<<< HEAD
import { Prisma, UserRole } from '@prisma/client'
import { Router } from 'express'

import { marketingAccountsWhere } from '../lib/department-accounts.js'
import { ROLE_NAMES } from '../lib/permissions.js'
import { writeAuditLog } from '../lib/audit.js'
import { hashPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'
import {
  requireAuth,
  resolveTenantScope,
  requireTenantCompany,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
=======
import { UserRole } from '@prisma/client'
import { Router } from 'express'

import { hashPassword } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
>>>>>>> origin/main
import { requireMainAdmin } from '../middleware/require-main-admin.js'
import { createUserSchema, updateUserSchema } from '../schemas/users.js'

export const usersRouter = Router()

<<<<<<< HEAD
usersRouter.use(
  requireAuth,
  requireMainAdmin,
  resolveTenantScope(),
  requireTenantCompany,
)

const MAIN_ADMIN_ROLE = UserRole.main_admin

class LastMarketingAdminError extends Error {}

async function protectLastMarketingAdmin(
  tx: Prisma.TransactionClient,
  companyId: number,
) {
  const count = await tx.user.count({
    where: {
      companyId,
      role: MAIN_ADMIN_ROLE,
      status: 'active',
      ...marketingAccountsWhere(companyId),
    },
  })
  if (count <= 1)
    throw new LastMarketingAdminError(
      'Each company must retain an active Marketing Admin',
    )
=======
usersRouter.use(requireAuth, requireMainAdmin)

const MAIN_ADMIN_ROLE = UserRole.main_admin

async function countMainAdmins() {
  return prisma.user.count({ where: { role: MAIN_ADMIN_ROLE } })
>>>>>>> origin/main
}

usersRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
<<<<<<< HEAD
    const companyId = req.tenantCompanyId!

    const users = await prisma.user.findMany({
      where: { companyId, ...marketingAccountsWhere(companyId) },
=======
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const users = await prisma.user.findMany({
      where: { companyId },
>>>>>>> origin/main
      orderBy: [{ role: 'asc' }, { id: 'asc' }],
    })
    res.json(users.map(mapUser))
  } catch (error) {
<<<<<<< HEAD
    if (error instanceof LastMarketingAdminError) {
      res.status(400).json({ message: error.message })
      return
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      res.status(409).json({
        message: 'Account changed concurrently. Refresh and try again.',
      })
      return
    }
=======
>>>>>>> origin/main
    next(error)
  }
})

usersRouter.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
<<<<<<< HEAD
    const companyId = req.tenantCompanyId!

    const body = createUserSchema.parse(req.body)
    const { firstName, lastName, email, password } = body
    if (body.role === MAIN_ADMIN_ROLE && !req.user?.isSuperAdmin) {
      res
        .status(403)
        .json({ message: 'Only Super Admin can create Marketing Admins' })
      return
    }
    // Marketing Admin may only create Marketing Sub Admins (`admin`).
    // Super Admin may also create Marketing Admins (`main_admin`).
    const role =
      req.user?.isSuperAdmin && body.role === MAIN_ADMIN_ROLE
        ? MAIN_ADMIN_ROLE
        : UserRole.admin

=======
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const body = createUserSchema.parse(req.body)
    const { firstName, lastName, email, password, role } = body
>>>>>>> origin/main
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

<<<<<<< HEAD
    await writeAuditLog({
      companyId,
      userId: req.user!.id,
      action: 'user.created',
      entityType: 'user',
      entityId: user.id,
      summary: `Created Marketing account ${user.email}`,
    })
    res.status(201).json(mapUser(user))
  } catch (error) {
    if (error instanceof LastMarketingAdminError) {
      res.status(400).json({ message: error.message })
      return
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      res.status(409).json({
        message: 'Account changed concurrently. Refresh and try again.',
      })
      return
    }
=======
    res.status(201).json(mapUser(user))
  } catch (error) {
>>>>>>> origin/main
    next(error)
  }
})

usersRouter.patch('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
<<<<<<< HEAD
    const companyId = req.tenantCompanyId!
=======
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }
>>>>>>> origin/main

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    const body = updateUserSchema.parse(req.body)
<<<<<<< HEAD
    const existing = await prisma.user.findFirst({
      where: { id, companyId, ...marketingAccountsWhere(companyId) },
      include: {
        roleAssignments: { select: { role: { select: { name: true } } } },
      },
    })
=======
    const existing = await prisma.user.findFirst({ where: { id, companyId } })
>>>>>>> origin/main

    if (!existing) {
      res.status(404).json({ message: 'User not found' })
      return
    }

<<<<<<< HEAD
    const hasAdminAssignment = existing.roleAssignments?.some(
      (assignment) => assignment.role.name === ROLE_NAMES.MARKETING_ADMIN,
    )
    if (
      (existing.role === MAIN_ADMIN_ROLE || hasAdminAssignment) &&
      !req.user?.isSuperAdmin
    ) {
      res.status(403).json({
        message: 'Only Super Admin can modify Marketing Admin accounts',
      })
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

=======
>>>>>>> origin/main
    const isDemotingMainAdmin =
      existing.role === MAIN_ADMIN_ROLE &&
      body.role !== undefined &&
      body.role !== MAIN_ADMIN_ROLE

<<<<<<< HEAD
    const passwordHash =
      body.password !== undefined
        ? await hashPassword(body.password)
        : undefined

    const user = await prisma.$transaction(
      async (tx) => {
        if (isDemotingMainAdmin && existing.status === 'active') {
          await protectLastMarketingAdmin(tx, companyId)
        }
        if (isDemotingMainAdmin) {
          await tx.userRoleAssignment.deleteMany({
            where: { userId: id, role: { name: ROLE_NAMES.MARKETING_ADMIN } },
          })
        }
        return tx.user.update({
          where: { id },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email?.toLowerCase(),
            role: body.role,
            passwordHash,
          },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    await writeAuditLog({
      companyId,
      userId: req.user!.id,
      action: 'user.updated',
      entityType: 'user',
      entityId: user.id,
      summary: `Updated Marketing account ${user.email}`,
    })
    res.json(mapUser(user))
  } catch (error) {
    if (error instanceof LastMarketingAdminError) {
      res.status(400).json({ message: error.message })
      return
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      res.status(409).json({
        message: 'Account changed concurrently. Refresh and try again.',
      })
      return
    }
=======
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
>>>>>>> origin/main
    next(error)
  }
})

usersRouter.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
<<<<<<< HEAD
    const companyId = req.tenantCompanyId!
=======
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }
>>>>>>> origin/main

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    if (req.user?.id === id) {
      res.status(400).json({ message: 'You cannot delete your own account' })
      return
    }

<<<<<<< HEAD
    const existing = await prisma.user.findFirst({
      where: { id, companyId, ...marketingAccountsWhere(companyId) },
      include: {
        roleAssignments: { select: { role: { select: { name: true } } } },
      },
    })
=======
    const existing = await prisma.user.findFirst({ where: { id, companyId } })
>>>>>>> origin/main

    if (!existing) {
      res.status(404).json({ message: 'User not found' })
      return
    }

<<<<<<< HEAD
    const hasAdminAssignment = existing.roleAssignments?.some(
      (assignment) => assignment.role.name === ROLE_NAMES.MARKETING_ADMIN,
    )
    if (
      (existing.role === MAIN_ADMIN_ROLE || hasAdminAssignment) &&
      !req.user?.isSuperAdmin
    ) {
      res.status(403).json({
        message: 'Only Super Admin can delete Marketing Admin accounts',
      })
      return
    }

    await prisma.$transaction(
      async (tx) => {
        if (existing.role === MAIN_ADMIN_ROLE && existing.status === 'active') {
          await protectLastMarketingAdmin(tx, companyId)
        }
        await tx.user.delete({ where: { id } })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
    await writeAuditLog({
      companyId,
      userId: req.user!.id,
      action: 'user.deleted',
      entityType: 'user',
      entityId: id,
      summary: `Deleted Marketing account ${existing.email}`,
    })
    res.status(204).send()
  } catch (error) {
    if (error instanceof LastMarketingAdminError) {
      res.status(400).json({ message: error.message })
      return
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      res.status(409).json({
        message: 'Account changed concurrently. Refresh and try again.',
      })
      return
    }
=======
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
>>>>>>> origin/main
    next(error)
  }
})
