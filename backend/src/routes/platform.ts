import { Router } from 'express'
import { z } from 'zod'

import { writeAuditLog } from '../lib/audit.js'
import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireSuperAdmin,
  type AuthenticatedRequest,
} from '../middleware/auth.js'

export const platformRouter = Router()

const websiteInputSchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().trim().min(1),
  domain: z.string().trim().nullable().optional(),
  isPrimary: z.boolean().default(false),
})

const websiteUpdateSchema = websiteInputSchema
  .omit({ companyId: true })
  .partial()

const settingInputSchema = z.object({
  websiteId: z.number().int().positive(),
  key: z.string().trim().min(1),
  value: z.string(),
})

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
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
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
  '/websites',
  requirePermission('website.view'),
  async (_req, res, next) => {
    try {
      const websites = await prisma.website.findMany({
        include: {
          company: { select: { id: true, name: true } },
          _count: { select: { pages: true, media: true, settings: true } },
        },
        orderBy: [
          { company: { name: 'asc' } },
          { isPrimary: 'desc' },
          { name: 'asc' },
        ],
      })
      res.json(
        websites.map((website) => ({
          ...website,
          createdAt: website.createdAt.toISOString(),
          updatedAt: website.updatedAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.post(
  '/websites',
  requirePermission('website.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = websiteInputSchema.parse(req.body)
      const website = await prisma.$transaction(async (tx) => {
        if (body.isPrimary)
          await tx.website.updateMany({
            where: { companyId: body.companyId },
            data: { isPrimary: false },
          })
        return tx.website.create({
          data: body,
          include: {
            company: { select: { id: true, name: true } },
            _count: { select: { pages: true, media: true, settings: true } },
          },
        })
      })
      await writeAuditLog({
        companyId: website.companyId,
        userId: req.user?.id,
        action: 'website.created',
        entityType: 'website',
        entityId: website.id,
        summary: `Created website "${website.name}"`,
      })
      res.status(201).json({
        ...website,
        createdAt: website.createdAt.toISOString(),
        updatedAt: website.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.patch(
  '/websites/:id',
  requirePermission('website.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = websiteUpdateSchema.parse(req.body)
      const existing = await prisma.website.findUniqueOrThrow({ where: { id } })
      const website = await prisma.$transaction(async (tx) => {
        if (body.isPrimary)
          await tx.website.updateMany({
            where: { companyId: existing.companyId, id: { not: id } },
            data: { isPrimary: false },
          })
        return tx.website.update({
          where: { id },
          data: body,
          include: {
            company: { select: { id: true, name: true } },
            _count: { select: { pages: true, media: true, settings: true } },
          },
        })
      })
      await writeAuditLog({
        companyId: website.companyId,
        userId: req.user?.id,
        action: 'website.updated',
        entityType: 'website',
        entityId: website.id,
        summary: `Updated website "${website.name}"`,
      })
      res.json({
        ...website,
        createdAt: website.createdAt.toISOString(),
        updatedAt: website.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.delete(
  '/websites/:id',
  requirePermission('website.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const website = await prisma.website.findUniqueOrThrow({ where: { id } })
      if (website.isPrimary) {
        res.status(409).json({
          message: 'Set another primary website before deleting this one',
        })
        return
      }
      await prisma.website.delete({ where: { id } })
      await writeAuditLog({
        companyId: website.companyId,
        userId: req.user?.id,
        action: 'website.deleted',
        entityType: 'website',
        entityId: id,
        summary: `Deleted website "${website.name}"`,
      })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.get(
  '/media',
  requirePermission('media.view'),
  async (_req, res, next) => {
    try {
      const media = await prisma.cmsMedia.findMany({
        include: {
          company: { select: { id: true, name: true } },
          website: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
      res.json(
        media.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.delete(
  '/media/:id',
  requirePermission('media.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const item = await prisma.cmsMedia.delete({
        where: { id: Number(req.params.id) },
      })
      await writeAuditLog({
        companyId: item.companyId,
        userId: req.user?.id,
        action: 'media.deleted',
        entityType: 'cms_media',
        entityId: item.id,
        summary: `Deleted media "${item.originalName}"`,
      })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.get(
  '/settings',
  requirePermission('settings.view'),
  async (_req, res, next) => {
    try {
      const settings = await prisma.websiteSetting.findMany({
        include: {
          company: { select: { id: true, name: true } },
          website: { select: { id: true, name: true } },
        },
        orderBy: [{ company: { name: 'asc' } }, { key: 'asc' }],
      })
      res.json(
        settings.map((setting) => ({
          ...setting,
          createdAt: setting.createdAt.toISOString(),
          updatedAt: setting.updatedAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.put(
  '/settings',
  requirePermission('settings.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = settingInputSchema.parse(req.body)
      const website = await prisma.website.findUniqueOrThrow({
        where: { id: body.websiteId },
      })
      const setting = await prisma.websiteSetting.upsert({
        where: { websiteId_key: { websiteId: body.websiteId, key: body.key } },
        create: { ...body, companyId: website.companyId },
        update: { value: body.value },
        include: {
          company: { select: { id: true, name: true } },
          website: { select: { id: true, name: true } },
        },
      })
      res.json(setting)
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.delete(
  '/settings/:id',
  requirePermission('settings.edit'),
  async (req, res, next) => {
    try {
      await prisma.websiteSetting.delete({
        where: { id: Number(req.params.id) },
      })
      res.status(204).send()
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
          ...(companyId && Number.isInteger(companyId) ? { companyId } : {}),
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
            include: {
              role: { select: { id: true, name: true, scope: true } },
            },
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

platformRouter.patch(
  '/users/:id/status',
  requirePermission('user.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const { status } = z
        .object({ status: z.enum(['active', 'disabled']) })
        .parse(req.body)
      if (req.user?.id === id && status === 'disabled') {
        res.status(400).json({ message: 'You cannot disable your own account' })
        return
      }
      const user = await prisma.user.update({
        where: { id },
        data: { status },
        include: {
          company: { select: { id: true, name: true } },
          roleAssignments: { include: { role: true } },
        },
      })
      await writeAuditLog({
        companyId: user.companyId,
        userId: req.user?.id,
        action: 'user.status_updated',
        entityType: 'user',
        entityId: id,
        summary: `${status === 'active' ? 'Activated' : 'Disabled'} ${user.email}`,
      })
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullname: `${user.firstName} ${user.lastName}`.trim(),
        marketingRole: user.role,
        status: user.status,
        companyId: user.companyId,
        company: user.company,
        platformRoles: user.roleAssignments.map((assignment) => ({
          roleName: assignment.role.name,
          scope: assignment.role.scope,
          companyId: assignment.companyId,
        })),
        createdAt: user.createdAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

platformRouter.delete(
  '/users/:id',
  requirePermission('user.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      if (req.user?.id === id) {
        res.status(400).json({ message: 'You cannot delete your own account' })
        return
      }
      const user = await prisma.user.delete({ where: { id } })
      await writeAuditLog({
        companyId: user.companyId,
        userId: req.user?.id,
        action: 'user.deleted',
        entityType: 'user',
        entityId: id,
        summary: `Deleted ${user.email}`,
      })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)
