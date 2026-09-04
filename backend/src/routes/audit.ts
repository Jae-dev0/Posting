import { Router } from 'express'

import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  resolveTenantScope,
  type AuthenticatedRequest,
} from '../middleware/auth.js'

export const auditRouter = Router()

auditRouter.use(requireAuth, requirePermission('audit.view'), resolveTenantScope())

auditRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const isSuper = Boolean(req.user?.isSuperAdmin)
    const allCompanies =
      isSuper &&
      (req.query.all === 'true' || req.query.all === '1') &&
      !req.headers['x-company-id']

    const logs = await prisma.auditLog.findMany({
      where: allCompanies ? {} : { companyId: req.tenantCompanyId },
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: { select: { id: true, name: true } },
      },
    })

    res.json(
      logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        summary: log.summary,
        metadata: log.metadata,
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
    )
  } catch (error) {
    next(error)
  }
})
