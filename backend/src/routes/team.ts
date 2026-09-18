import { UserRole } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

import { marketingAccountsWhere } from '../lib/department-accounts.js'
import { writeAuditLog } from '../lib/audit.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { requireMainAdmin } from '../middleware/require-main-admin.js'

export const teamRouter = Router()

teamRouter.use(requireAuth)

const upsertPermissionSchema = z.object({
  userId: z.number().int().positive(),
  connectedAccountId: z.number().int().positive(),
  canPublish: z.boolean(),
  canApprove: z.boolean().optional().default(false),
})

teamRouter.get(
  '/overview',
  requireMainAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.user?.companyId
      if (!companyId) {
        res.status(403).json({ message: 'Company context required' })
        return
      }

      const [users, accounts, permissions, auditLogs, pendingPosts] =
        await Promise.all([
          prisma.user.findMany({
            where: marketingAccountsWhere(companyId),
            orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          }),
          prisma.connectedAccount.findMany({
            where: { companyId, isConnected: true },
            orderBy: [{ platform: 'asc' }, { accountName: 'asc' }],
          }),
          prisma.accountPermission.findMany({
            where: { companyId, user: marketingAccountsWhere(companyId) },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              connectedAccount: {
                select: {
                  id: true,
                  platform: true,
                  accountName: true,
                  handle: true,
                },
              },
            },
          }),
          prisma.auditLog.findMany({
            where: { companyId },
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          }),
          prisma.post.findMany({
            where: { companyId, status: 'pending_approval' },
            orderBy: { updatedAt: 'desc' },
            include: {
              accounts: { include: { account: true } },
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          }),
        ])

      res.json({
        users: users.map((user) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`.trim(),
          role: user.role,
        })),
        accounts: accounts.map((account) => ({
          id: account.id,
          platform: account.platform,
          accountName: account.accountName,
          handle: account.handle,
          isConnected: account.isConnected,
        })),
        permissions: permissions.map((permission) => ({
          id: permission.id,
          userId: permission.userId,
          connectedAccountId: permission.connectedAccountId,
          canPublish: permission.canPublish,
          canApprove: permission.canApprove,
          user: {
            id: permission.user.id,
            name: `${permission.user.firstName} ${permission.user.lastName}`.trim(),
            email: permission.user.email,
          },
          account: permission.connectedAccount,
        })),
        pendingApprovals: pendingPosts.map((post) => ({
          id: post.id,
          caption: post.caption,
          mediaUrl: post.mediaUrl,
          status: post.status,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          platforms: post.accounts.map(({ account }) => account.platform),
          createdBy: post.createdBy
            ? {
                id: post.createdBy.id,
                name: `${post.createdBy.firstName} ${post.createdBy.lastName}`.trim(),
                email: post.createdBy.email,
              }
            : null,
        })),
        auditLog: auditLogs.map((entry) => ({
          id: entry.id,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          summary: entry.summary,
          createdAt: entry.createdAt.toISOString(),
          user: entry.user
            ? {
                id: entry.user.id,
                name: `${entry.user.firstName} ${entry.user.lastName}`.trim(),
                email: entry.user.email,
              }
            : null,
        })),
        roles: Object.values(UserRole),
      })
    } catch (error) {
      next(error)
    }
  },
)

teamRouter.put(
  '/permissions',
  requireMainAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.user?.companyId
      const actorId = req.user?.id
      if (!companyId || !actorId) {
        res.status(403).json({ message: 'Company context required' })
        return
      }

      const body = upsertPermissionSchema.parse(req.body)

      const [user, account] = await Promise.all([
        prisma.user.findFirst({
          where: { id: body.userId, ...marketingAccountsWhere(companyId) },
        }),
        prisma.connectedAccount.findFirst({
          where: { id: body.connectedAccountId, companyId },
        }),
      ])

      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return
      }
      if (!account) {
        res.status(404).json({ message: 'Connected account not found' })
        return
      }

      const permission = await prisma.accountPermission.upsert({
        where: {
          userId_connectedAccountId: {
            userId: body.userId,
            connectedAccountId: body.connectedAccountId,
          },
        },
        create: {
          companyId,
          userId: body.userId,
          connectedAccountId: body.connectedAccountId,
          canPublish: body.canPublish,
          canApprove: body.canApprove,
        },
        update: {
          canPublish: body.canPublish,
          canApprove: body.canApprove,
        },
      })

      await writeAuditLog({
        companyId,
        userId: actorId,
        action: 'permission.updated',
        entityType: 'account_permission',
        entityId: permission.id,
        summary: `Updated publish permission for user #${body.userId} on account #${body.connectedAccountId}`,
      })

      res.json({
        id: permission.id,
        userId: permission.userId,
        connectedAccountId: permission.connectedAccountId,
        canPublish: permission.canPublish,
        canApprove: permission.canApprove,
      })
    } catch (error) {
      next(error)
    }
  },
)

teamRouter.delete(
  '/permissions/:id',
  requireMainAdmin,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.user?.companyId
      const actorId = req.user?.id
      if (!companyId) {
        res.status(403).json({ message: 'Company context required' })
        return
      }

      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid permission id' })
        return
      }

      const existing = await prisma.accountPermission.findFirst({
        where: { id, companyId, user: marketingAccountsWhere(companyId) },
      })
      if (!existing) {
        res.status(404).json({ message: 'Permission not found' })
        return
      }

      await prisma.accountPermission.delete({ where: { id } })

      await writeAuditLog({
        companyId,
        userId: actorId,
        action: 'permission.deleted',
        entityType: 'account_permission',
        entityId: id,
        summary: `Removed permission #${id}`,
      })

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)
