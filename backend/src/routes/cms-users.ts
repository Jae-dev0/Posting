import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import { cmsAccountsWhere, cmsRolesWhere } from '../lib/department-accounts.js'
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
  createCmsAccountSchema,
  updateCmsAccountSchema,
} from '../schemas/cms-users.js'

export const cmsUsersRouter = Router()

cmsUsersRouter.use(requireAuth, resolveTenantScope(), requireTenantCompany)

const companyAdminRoleName = ROLE_NAMES.COMPANY_ADMIN

const accountInclude = {
  roleAssignments: { include: { role: { select: { id: true, name: true } } } },
  websiteAccesses: { select: { websiteId: true } },
} as const

function mapAccount(
  user: {
    id: number
    email: string
    firstName: string
    lastName: string
    status: string
    websiteAccessMode: string
    createdAt: Date
    roleAssignments: Array<{
      roleId: number
      companyId: number | null
      role: { id: number; name: string }
    }>
    websiteAccesses: Array<{ websiteId: number }>
  },
  companyId: number,
) {
  const assignments = user.roleAssignments.filter(
    (assignment) => assignment.companyId === companyId,
  )
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullname: `${user.firstName} ${user.lastName}`.trim(),
    status: user.status,
    websiteAccessMode: user.websiteAccessMode,
    roleIds: assignments.map((assignment) => assignment.roleId),
    roles: assignments.map((assignment) => assignment.role),
    websiteIds: user.websiteAccesses.map((assignment) => assignment.websiteId),
    createdAt: user.createdAt.toISOString(),
  }
}

async function getAssignableRoles(companyId: number) {
  return prisma.role.findMany({
    where: cmsRolesWhere(companyId),
    orderBy: { name: 'asc' },
  })
}

async function validateAssignments(input: {
  companyId: number
  roleIds: number[]
  websiteIds: number[]
  websiteAccessMode: 'all_websites' | 'selected_websites'
  canAssignCompanyAdmin: boolean
}) {
  const {
    companyId,
    roleIds,
    websiteIds,
    websiteAccessMode,
    canAssignCompanyAdmin,
  } = input
  const [roles, websites] = await Promise.all([
    getAssignableRoles(companyId),
    prisma.website.findMany({
      where: { id: { in: websiteIds }, companyId },
      select: { id: true },
    }),
  ])
  const availableRoleIds = new Set(roles.map((role) => role.id))
  const companyAdmin = roles.find((role) => role.name === companyAdminRoleName)
  if (!roleIds.every((roleId) => availableRoleIds.has(roleId)))
    return 'Roles must belong to the active company'
  if (websites.length !== new Set(websiteIds).size)
    return 'Websites must belong to the active company'
  if (
    companyAdmin &&
    roleIds.includes(companyAdmin.id) &&
    !canAssignCompanyAdmin
  )
    return 'Only Super Admin can assign the Company Admin role'
  if (websiteAccessMode === 'selected_websites' && !websiteIds.length)
    return 'Select at least one website for selected website access'
  return null
}

cmsUsersRouter.get(
  '/',
  requirePermission('user.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const users = await prisma.user.findMany({
        where: cmsAccountsWhere(companyId),
        include: accountInclude,
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      })
      res.json(users.map((user) => mapAccount(user, companyId)))
    } catch (error) {
      next(error)
    }
  },
)

cmsUsersRouter.get(
  '/catalog',
  requirePermission('user.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const [roles, websites] = await Promise.all([
        getAssignableRoles(companyId),
        prisma.website.findMany({
          where: { companyId },
          orderBy: { name: 'asc' },
        }),
      ])
      res.json({
        roles: roles.map((role) => ({
          id: role.id,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
        })),
        websites: websites.map((website) => ({
          id: website.id,
          name: website.name,
          domain: website.domain,
          isPrimary: website.isPrimary,
        })),
      })
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
      const body = createCmsAccountSchema.parse(req.body)
      const validationError = await validateAssignments({
        ...body,
        companyId,
        canAssignCompanyAdmin: Boolean(req.user?.isSuperAdmin),
      })
      if (validationError) {
        res.status(403).json({ message: validationError })
        return
      }
      const user = await prisma.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email.toLowerCase(),
          passwordHash: await hashPassword(body.password),
          role: 'admin',
          status: body.status,
          companyId,
          websiteAccessMode: body.websiteAccessMode,
          roleAssignments: {
            createMany: {
              data: body.roleIds.map((roleId) => ({ roleId, companyId })),
            },
          },
          websiteAccesses:
            body.websiteAccessMode === 'selected_websites'
              ? {
                  createMany: {
                    data: body.websiteIds.map((websiteId) => ({ websiteId })),
                  },
                }
              : undefined,
        },
        include: accountInclude,
      })
      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.account.created',
        entityType: 'user',
        entityId: user.id,
        summary: `Created account ${user.email}`,
        metadata: {
          roleIds: body.roleIds,
          websiteAccessMode: body.websiteAccessMode,
          websiteIds: body.websiteIds,
        },
      })
      res.status(201).json(mapAccount(user, companyId))
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
      const body = updateCmsAccountSchema.parse(req.body)
      const existing = await prisma.user.findFirst({
        where: { id, ...cmsAccountsWhere(companyId) },
        include: accountInclude,
      })
      if (!existing) {
        res.status(404).json({ message: 'Account not found' })
        return
      }
      const targetIsCompanyAdmin = existing.roleAssignments.some(
        (assignment) =>
          assignment.companyId === companyId &&
          assignment.role.name === companyAdminRoleName,
      )
      if (targetIsCompanyAdmin && !req.user?.isSuperAdmin) {
        res
          .status(403)
          .json({
            message: 'Only Super Admin can modify a Company Admin account',
          })
        return
      }
      const roleIds =
        body.roleIds ??
        existing.roleAssignments
          .filter((assignment) => assignment.companyId === companyId)
          .map((assignment) => assignment.roleId)
      const websiteAccessMode =
        body.websiteAccessMode ?? existing.websiteAccessMode
      const websiteIds =
        body.websiteIds ??
        existing.websiteAccesses.map((assignment) => assignment.websiteId)
      const validationError = await validateAssignments({
        companyId,
        roleIds,
        websiteAccessMode,
        websiteIds,
        canAssignCompanyAdmin: Boolean(req.user?.isSuperAdmin),
      })
      if (validationError) {
        res.status(403).json({ message: validationError })
        return
      }
      const user = await prisma.$transaction(async (tx) => {
        if (body.roleIds) {
          await tx.userRoleAssignment.deleteMany({
            where: { userId: id, companyId },
          })
          await tx.userRoleAssignment.createMany({
            data: roleIds.map((roleId) => ({ userId: id, roleId, companyId })),
          })
        }
        if (
          body.websiteAccessMode !== undefined ||
          body.websiteIds !== undefined
        ) {
          await tx.userWebsiteAccess.deleteMany({ where: { userId: id } })
          if (websiteAccessMode === 'selected_websites')
            await tx.userWebsiteAccess.createMany({
              data: websiteIds.map((websiteId) => ({ userId: id, websiteId })),
            })
        }
        return tx.user.update({
          where: { id },
          data: {
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email?.toLowerCase(),
            passwordHash: body.password
              ? await hashPassword(body.password)
              : undefined,
            status: body.status,
            websiteAccessMode: body.websiteAccessMode,
          },
          include: accountInclude,
        })
      })
      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.account.updated',
        entityType: 'user',
        entityId: user.id,
        summary: `Updated account ${user.email}`,
        metadata: {
          roleIds,
          websiteAccessMode,
          websiteIds,
          status: user.status,
        },
      })
      res.json(mapAccount(user, companyId))
    } catch (error) {
      next(error)
    }
  },
)

cmsUsersRouter.post(
  '/:id/suspend',
  requirePermission('user.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const id = Number(req.params.id)
      if (!Number.isInteger(id) || id === req.user?.id) {
        res.status(400).json({ message: 'Invalid account suspension request' })
        return
      }
      const user = await prisma.user.findFirst({
        where: { id, ...cmsAccountsWhere(companyId) },
        include: { roleAssignments: { include: { role: true } } },
      })
      if (!user) {
        res.status(404).json({ message: 'Account not found' })
        return
      }
      const targetIsCompanyAdmin = user.roleAssignments.some(
        (assignment) =>
          assignment.companyId === companyId &&
          assignment.role.name === companyAdminRoleName,
      )
      if (targetIsCompanyAdmin && !req.user?.isSuperAdmin) {
        res
          .status(403)
          .json({
            message: 'Only Super Admin can suspend a Company Admin account',
          })
        return
      }
      const updated = await prisma.user.update({
        where: { id },
        data: { status: 'disabled' },
      })
      await writeAuditLog({
        companyId,
        userId: req.user?.id,
        action: 'cms.account.suspended',
        entityType: 'user',
        entityId: id,
        summary: `Suspended account ${updated.email}`,
      })
      res.json({ id: updated.id, status: updated.status })
    } catch (error) {
      next(error)
    }
  },
)
