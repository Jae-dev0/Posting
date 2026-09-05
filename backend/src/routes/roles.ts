import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import { ROLE_NAMES } from '../lib/permissions.js'
import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireSuperAdmin,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import {
  createRoleSchema,
  syncRolePermissionGrantsSchema,
  updateRoleSchema,
} from '../schemas/roles.js'

export const rolesRouter = Router()

rolesRouter.use(requireAuth)

const SYSTEM_ROLE_NAMES = new Set<string>([
  ROLE_NAMES.SUPER_ADMIN,
  ROLE_NAMES.COMPANY_ADMIN,
  ROLE_NAMES.CMS_SUB_ADMIN,
  ROLE_NAMES.MARKETING_ADMIN,
])

function mapRole(role: {
  id: number
  name: string
  description: string | null
  scope: string
  _count?: { assignments: number }
  permissions?: Array<{
    permission: {
      id: number
      name: string
      description: string | null
    }
  }>
}) {
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    scope: role.scope,
    assignmentCount: role._count?.assignments ?? 0,
    permissions:
      role.permissions?.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
      })) ?? [],
  }
}

const roleInclude = {
  permissions: { include: { permission: true } },
  _count: { select: { assignments: true } },
} as const

rolesRouter.get(
  '/',
  requirePermission('role.view'),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const roles = await prisma.role.findMany({
        include: roleInclude,
        orderBy: { name: 'asc' },
      })
      res.json(roles.map(mapRole))
    } catch (error) {
      next(error)
    }
  },
)

rolesRouter.get(
  '/permissions',
  requirePermission('role.view'),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: { name: 'asc' },
      })
      res.json(permissions)
    } catch (error) {
      next(error)
    }
  },
)

rolesRouter.get(
  '/assignments',
  requireSuperAdmin,
  requirePermission('role.view'),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const assignments = await prisma.userRoleAssignment.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              companyId: true,
            },
          },
          role: { select: { id: true, name: true, scope: true } },
          company: { select: { id: true, name: true } },
        },
        orderBy: { id: 'asc' },
      })

      res.json(
        assignments.map((a) => ({
          id: a.id,
          user: a.user,
          role: a.role,
          company: a.company,
          createdAt: a.createdAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

rolesRouter.post(
  '/',
  requirePermission('role.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createRoleSchema.parse(req.body)
      const role = await prisma.role.create({
        data: {
          name: body.name,
          description: body.description,
          scope: body.scope,
        },
        include: roleInclude,
      })

      await writeAuditLog({
        companyId: req.user!.companyId,
        userId: req.user?.id,
        action: 'role.created',
        entityType: 'role',
        entityId: role.id,
        summary: `Created role "${role.name}"`,
      })

      res.status(201).json(mapRole(role))
    } catch (error) {
      next(error)
    }
  },
)

rolesRouter.patch(
  '/:id',
  requirePermission('role.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid role id' })
        return
      }

      const existing = await prisma.role.findUnique({ where: { id } })
      if (!existing) {
        res.status(404).json({ message: 'Role not found' })
        return
      }

      const body = updateRoleSchema.parse(req.body)

      if (SYSTEM_ROLE_NAMES.has(existing.name)) {
        if (body.name && body.name !== existing.name) {
          res.status(400).json({
            message: 'System role names cannot be renamed',
          })
          return
        }
        if (body.scope && body.scope !== existing.scope) {
          res.status(400).json({
            message: 'System role scope cannot be changed',
          })
          return
        }
      }

      const role = await prisma.role.update({
        where: { id },
        data: {
          ...(body.name != null ? { name: body.name } : {}),
          ...(body.description != null ? { description: body.description } : {}),
          ...(body.scope != null ? { scope: body.scope } : {}),
        },
        include: roleInclude,
      })

      await writeAuditLog({
        companyId: req.user!.companyId,
        userId: req.user?.id,
        action: 'role.updated',
        entityType: 'role',
        entityId: role.id,
        summary: `Updated role "${role.name}"`,
      })

      res.json(mapRole(role))
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Sync grants for a permission-group editor save.
 * Only permissions in `permissionIds` are added/removed — other modules untouched.
 */
rolesRouter.put(
  '/permission-grants',
  requirePermission('role.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = syncRolePermissionGrantsSchema.parse(req.body)
      const permissionIdSet = new Set(body.permissionIds)

      for (const grant of body.grants) {
        if (!permissionIdSet.has(grant.permissionId)) {
          res.status(400).json({
            message: 'Grant permissionId must be included in permissionIds',
          })
          return
        }
      }

      const roles = await prisma.role.findMany({
        where: {
          id: { in: [...new Set(body.grants.map((g) => g.roleId))] },
        },
      })
      const roleById = new Map(roles.map((r) => [r.id, r]))

      await prisma.$transaction(async (tx) => {
        for (const grant of body.grants) {
          const role = roleById.get(grant.roleId)
          if (!role) continue

          // Super Admin always keeps all permissions — skip mutations.
          if (role.name === ROLE_NAMES.SUPER_ADMIN) continue

          if (grant.granted) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: grant.roleId,
                  permissionId: grant.permissionId,
                },
              },
              create: {
                roleId: grant.roleId,
                permissionId: grant.permissionId,
              },
              update: {},
            })
          } else {
            await tx.rolePermission.deleteMany({
              where: {
                roleId: grant.roleId,
                permissionId: grant.permissionId,
              },
            })
          }
        }
      })

      await writeAuditLog({
        companyId: req.user!.companyId,
        userId: req.user?.id,
        action: 'role.permissions_synced',
        entityType: 'role_permission',
        summary: `Synced ${body.grants.length} permission grants`,
        metadata: { permissionIds: body.permissionIds },
      })

      const updatedRoles = await prisma.role.findMany({
        include: roleInclude,
        orderBy: { name: 'asc' },
      })

      res.json(updatedRoles.map(mapRole))
    } catch (error) {
      next(error)
    }
  },
)
