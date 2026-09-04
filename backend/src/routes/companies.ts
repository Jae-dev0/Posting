import { CompanyStatus } from '@prisma/client'
import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import { hashPassword } from '../lib/password.js'
import { ROLE_NAMES } from '../lib/permissions.js'
import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireSuperAdmin,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import {
  assignCompanyAdminSchema,
  createCompanySchema,
  updateCompanySchema,
} from '../schemas/companies.js'

export const companiesRouter = Router()

companiesRouter.use(requireAuth)

function mapCompany(
  company: {
    id: number
    name: string
    domain: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    _count?: { users: number; websites: number }
    websites?: Array<{ id: number; name: string; domain: string | null }>
  },
) {
  return {
    id: company.id,
    name: company.name,
    domain: company.domain,
    status: company.status,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
    userCount: company._count?.users ?? undefined,
    websiteCount: company._count?.websites ?? undefined,
    websites: company.websites,
  }
}

companiesRouter.get(
  '/',
  requirePermission('company.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const search =
        typeof req.query.search === 'string' ? req.query.search.trim() : ''
      const status =
        typeof req.query.status === 'string' &&
        (req.query.status === 'active' || req.query.status === 'disabled')
          ? (req.query.status as CompanyStatus)
          : undefined

      const where = {
        ...(req.user?.isSuperAdmin
          ? {}
          : { id: req.user?.companyId ?? -1 }),
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { domain: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      }

      const companies = await prisma.company.findMany({
        where,
        include: {
          _count: { select: { users: true, websites: true } },
          websites: {
            where: { isPrimary: true },
            select: { id: true, name: true, domain: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      })

      res.json(companies.map(mapCompany))
    } catch (error) {
      next(error)
    }
  },
)

companiesRouter.get(
  '/:id',
  requirePermission('company.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid company id' })
        return
      }

      if (!req.user?.isSuperAdmin && req.user?.companyId !== id) {
        res.status(403).json({ message: 'Access to another company is not allowed' })
        return
      }

      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          _count: { select: { users: true, websites: true } },
          websites: true,
          users: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              status: true,
            },
            orderBy: { id: 'asc' },
          },
        },
      })

      if (!company) {
        res.status(404).json({ message: 'Company not found' })
        return
      }

      res.json({
        ...mapCompany(company),
        users: company.users,
        websites: company.websites,
      })
    } catch (error) {
      next(error)
    }
  },
)

companiesRouter.post(
  '/',
  requireSuperAdmin,
  requirePermission('company.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createCompanySchema.parse(req.body)

      const company = await prisma.$transaction(async (tx) => {
        const created = await tx.company.create({
          data: {
            name: body.name,
            domain: body.domain ?? null,
            status: body.status,
          },
        })

        await tx.website.create({
          data: {
            companyId: created.id,
            name: body.websiteName ?? `${body.name} Website`,
            domain: body.domain ?? null,
            isPrimary: true,
          },
        })

        if (body.admin) {
          const companyAdminRole = await tx.role.findUnique({
            where: { name: ROLE_NAMES.COMPANY_ADMIN },
          })
          const passwordHash = await hashPassword(body.admin.password)
          const adminUser = await tx.user.create({
            data: {
              email: body.admin.email.toLowerCase(),
              firstName: body.admin.firstName,
              lastName: body.admin.lastName,
              passwordHash,
              role: 'admin',
              companyId: created.id,
            },
          })
          if (companyAdminRole) {
            await tx.userRoleAssignment.create({
              data: {
                userId: adminUser.id,
                roleId: companyAdminRole.id,
                companyId: created.id,
              },
            })
          }
        }

        return created
      })

      await writeAuditLog({
        companyId: company.id,
        userId: req.user?.id,
        action: 'company.created',
        entityType: 'company',
        entityId: company.id,
        summary: `Created company "${company.name}"`,
      })

      res.status(201).json(mapCompany(company))
    } catch (error) {
      next(error)
    }
  },
)

companiesRouter.patch(
  '/:id',
  requireSuperAdmin,
  requirePermission('company.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid company id' })
        return
      }

      const body = updateCompanySchema.parse(req.body)
      const company = await prisma.company.update({
        where: { id },
        data: {
          ...(body.name != null ? { name: body.name } : {}),
          ...(body.domain !== undefined ? { domain: body.domain } : {}),
          ...(body.status != null ? { status: body.status } : {}),
        },
        include: {
          _count: { select: { users: true, websites: true } },
        },
      })

      await writeAuditLog({
        companyId: company.id,
        userId: req.user?.id,
        action: 'company.updated',
        entityType: 'company',
        entityId: company.id,
        summary: `Updated company "${company.name}"`,
        metadata: body,
      })

      res.json(mapCompany(company))
    } catch (error) {
      next(error)
    }
  },
)

companiesRouter.post(
  '/:id/assign-admin',
  requireSuperAdmin,
  requirePermission('company.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid company id' })
        return
      }

      const body = assignCompanyAdminSchema.parse(req.body)
      const user = await prisma.user.findFirst({
        where: { id: body.userId, companyId: id },
      })
      if (!user) {
        res.status(404).json({ message: 'User not found in this company' })
        return
      }

      const companyAdminRole = await prisma.role.findUnique({
        where: { name: ROLE_NAMES.COMPANY_ADMIN },
      })
      if (!companyAdminRole) {
        res.status(500).json({ message: 'Company Admin role is not configured' })
        return
      }

      await prisma.userRoleAssignment.upsert({
        where: {
          userId_roleId_companyId: {
            userId: user.id,
            roleId: companyAdminRole.id,
            companyId: id,
          },
        },
        create: {
          userId: user.id,
          roleId: companyAdminRole.id,
          companyId: id,
        },
        update: {},
      })

      await writeAuditLog({
        companyId: id,
        userId: req.user?.id,
        action: 'company.admin_assigned',
        entityType: 'user',
        entityId: user.id,
        summary: `Assigned Company Admin to ${user.email}`,
      })

      res.json({ message: 'Company Admin assigned', userId: user.id })
    } catch (error) {
      next(error)
    }
  },
)
