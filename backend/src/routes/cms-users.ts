import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import { hashPassword } from '../lib/password.js'
import { ROLE_NAMES } from '../lib/permissions.js'
import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireTenantCompany,
  resolveTenantScope,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import {
  createCmsSubAdminSchema,
  updateCmsSubAdminSchema,
} from '../schemas/cms-users.js'

export const cmsUsersRouter = Router()

cmsUsersRouter.use(requireAuth, resolveTenantScope(), requireTenantCompany)

function mapCmsUser(user: {
  id: number
  email: string
  firstName: string
  lastName: string
  status: string
  createdAt: Date
  roleAssignments: Array<{
    role: { name: string }
    companyId: number | null
  }>
}) {
  const cmsRoles = user.roleAssignments
    .filter((a) =>
      a.role.name === ROLE_NAMES.COMPANY_ADMIN ||
      a.role.name === ROLE_NAMES.CMS_SUB_ADMIN,
    )
    .map((a) => a.role.name)

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullname: `${user.firstName} ${user.lastName}`.trim(),
    status: user.status,
    cmsRole: cmsRoles.includes(ROLE_NAMES.COMPANY_ADMIN)
      ? 'cms_admin'
      : 'cms_sub_admin',
    createdAt: user.createdAt.toISOString(),
  }
}

cmsUsersRouter.get(
  '/',
  requirePermission('user.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!

      const users = await prisma.user.findMany({
        where: {
          companyId,
          roleAssignments: {
            some: {
              companyId,
              role: {
                name: {
                  in: [ROLE_NAMES.COMPANY_ADMIN, ROLE_NAMES.CMS_SUB_ADMIN],
                },
              },
            },
          },
        },
        include: {
          roleAssignments: {
            include: { role: { select: { name: true } } },
          },
        },
        orderBy: [{ id: 'asc' }],
      })

      res.json(users.map(mapCmsUser))
    } catch (error) {
      next(error)
    }
  },
)

cmsUsersRouter.post(
  '/',
  requirePermission('user.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const body = createCmsSubAdminSchema.parse(req.body)

      const cmsSubAdminRole = await prisma.role.findUnique({
        where: { name: ROLE_NAMES.CMS_SUB_ADMIN },
      })
      if (!cmsSubAdminRole) {
        res.status(500).json({ message: 'CMS Sub Admin role is not configured' })
        return
      }

      const passwordHash = await hashPassword(body.password)
      const email = body.email.toLowerCase()

      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        res.status(409).json({ message: 'Email is already in use' })
        return
      }

      const user = await prisma.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email,
          passwordHash,
          role: 'admin',
          status: 'active',
          companyId,
          roleAssignments: {
            create: {
              roleId: cmsSubAdminRole.id,
              companyId,
            },
          },
        },
        include: {
          roleAssignments: {
            include: { role: { select: { name: true } } },
          },
        },
      })

      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.user.create',
        entityType: 'user',
        entityId: user.id,
        summary: `Created CMS Sub Admin ${user.email}`,
      })

      res.status(201).json(mapCmsUser(user))
    } catch (error) {
      next(error)
    }
  },
)

cmsUsersRouter.patch(
  '/:id',
  requirePermission('user.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid user id' })
        return
      }

      const body = updateCmsSubAdminSchema.parse(req.body)

      const existing = await prisma.user.findFirst({
        where: {
          id,
          companyId,
          roleAssignments: {
            some: {
              companyId,
              role: { name: ROLE_NAMES.CMS_SUB_ADMIN },
            },
          },
        },
      })

      if (!existing) {
        res.status(404).json({
          message: 'CMS Sub Admin not found (only sub-admins can be edited here)',
        })
        return
      }

      const passwordHash =
        body.password !== undefined
          ? await hashPassword(body.password)
          : undefined

      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email?.toLowerCase(),
          status: body.status,
          passwordHash,
        },
        include: {
          roleAssignments: {
            include: { role: { select: { name: true } } },
          },
        },
      })

      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.user.update',
        entityType: 'user',
        entityId: user.id,
        summary: `Updated CMS Sub Admin ${user.email}`,
      })

      res.json(mapCmsUser(user))
    } catch (error) {
      next(error)
    }
  },
)

cmsUsersRouter.delete(
  '/:id',
  requirePermission('user.delete'),
  async (req: AuthenticatedRequest, res, next) => {
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

      const existing = await prisma.user.findFirst({
        where: {
          id,
          companyId,
          roleAssignments: {
            some: {
              companyId,
              role: { name: ROLE_NAMES.CMS_SUB_ADMIN },
            },
          },
        },
      })

      if (!existing) {
        res.status(404).json({
          message:
            'CMS Sub Admin not found (CMS Admins cannot be deleted here)',
        })
        return
      }

      await prisma.user.delete({ where: { id } })

      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.user.delete',
        entityType: 'user',
        entityId: id,
        summary: `Deleted CMS Sub Admin ${existing.email}`,
      })

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)
