import { Router } from 'express'

import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireSuperAdmin,
  type AuthenticatedRequest,
} from '../middleware/auth.js'

export const platformRouter = Router()

platformRouter.use(requireAuth, requireSuperAdmin)

platformRouter.get(
  '/dashboard',
  requirePermission('platform.dashboard'),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const [
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalWebsites,
        recentActivity,
      ] = await Promise.all([
        prisma.company.count(),
        prisma.company.count({ where: { status: 'active' } }),
        prisma.user.count(),
        prisma.website.count(),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            company: { select: { id: true, name: true } },
          },
        }),
      ])

      const companies = await prisma.company.findMany({
        take: 8,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { users: true, websites: true } },
        },
      })

      res.json({
        totals: {
          companies: totalCompanies,
          activeCompanies,
          users: totalUsers,
          websites: totalWebsites,
        },
        systemStatus: 'operational',
        recentActivity: recentActivity.map((log) => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          summary: log.summary,
          createdAt: log.createdAt.toISOString(),
          company: log.company,
          user: log.user
            ? {
                id: log.user.id,
                name: `${log.user.firstName} ${log.user.lastName}`.trim(),
                email: log.user.email,
              }
            : null,
        })),
        companyOverview: companies.map((c) => ({
          id: c.id,
          name: c.name,
          domain: c.domain,
          status: c.status,
          userCount: c._count.users,
          websiteCount: c._count.websites,
          updatedAt: c.updatedAt.toISOString(),
        })),
      })
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.get(
  '/users',
  requirePermission('user.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const search =
        typeof req.query.search === 'string' ? req.query.search.trim() : ''
      const companyIdRaw = req.query.companyId
      const companyId =
        companyIdRaw != null && String(companyIdRaw) !== ''
          ? Number(companyIdRaw)
          : undefined

      const users = await prisma.user.findMany({
        where: {
          ...(companyId && Number.isInteger(companyId)
            ? { companyId }
            : {}),
          ...(search
            ? {
                OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {}),
        },
        include: {
          company: { select: { id: true, name: true } },
          roleAssignments: {
            include: { role: { select: { id: true, name: true, scope: true } } },
          },
        },
        orderBy: [{ companyId: 'asc' }, { id: 'asc' }],
        take: 200,
      })

      res.json(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          fullname: `${u.firstName} ${u.lastName}`.trim(),
          marketingRole: u.role,
          status: u.status,
          companyId: u.companyId,
          company: u.company,
          platformRoles: u.roleAssignments.map((a) => ({
            roleName: a.role.name,
            scope: a.role.scope,
            companyId: a.companyId,
          })),
          createdAt: u.createdAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)
