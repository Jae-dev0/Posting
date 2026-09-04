import { PostStatus } from '@prisma/client'
import { Router } from 'express'

import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'

export const analyticsRouter = Router()

analyticsRouter.use(requireAuth)

analyticsRouter.get('/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setUTCDate(now.getUTCDate() - 7)
    const startOfMonth = new Date(now)
    startOfMonth.setUTCDate(now.getUTCDate() - 30)

    const [
      publishedThisWeek,
      publishedThisMonth,
      failedCount,
      scheduledCount,
      draftCount,
      pendingApprovalCount,
      socialAccounts,
      recentAudit,
    ] = await Promise.all([
      prisma.post.count({
        where: {
          companyId,
          status: PostStatus.published,
          publishedAt: { gte: startOfWeek },
        },
      }),
      prisma.post.count({
        where: {
          companyId,
          status: PostStatus.published,
          publishedAt: { gte: startOfMonth },
        },
      }),
      prisma.post.count({
        where: { companyId, status: PostStatus.failed },
      }),
      prisma.post.count({
        where: { companyId, status: PostStatus.scheduled },
      }),
      prisma.post.count({
        where: { companyId, status: PostStatus.draft },
      }),
      prisma.post.count({
        where: { companyId, status: PostStatus.pending_approval },
      }),
      prisma.socialAccount.findMany({
        where: { companyId },
        select: {
          id: true,
          platform: true,
          pageName: true,
          isConnected: true,
          tokenExpiresAt: true,
        },
        orderBy: { pageName: 'asc' },
      }),
      prisma.auditLog.findMany({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      }),
    ])

    const publishingTrend = await Promise.all(
      Array.from({ length: 7 }, (_, index) => {
        const dayStart = new Date(now)
        dayStart.setUTCDate(now.getUTCDate() - (6 - index))
        dayStart.setUTCHours(0, 0, 0, 0)
        const dayEnd = new Date(dayStart)
        dayEnd.setUTCDate(dayStart.getUTCDate() + 1)

        return prisma.post
          .count({
            where: {
              companyId,
              status: PostStatus.published,
              publishedAt: { gte: dayStart, lt: dayEnd },
            },
          })
          .then((count) => ({
            date: dayStart.toISOString(),
            count,
          }))
      }),
    )

    const weekFromMs = 7 * 24 * 60 * 60 * 1000
    const accountHealth = socialAccounts.map((account) => {
      const expiresAt = account.tokenExpiresAt
      const msUntilExpiry = expiresAt
        ? expiresAt.getTime() - now.getTime()
        : null
      const expiringSoon =
        msUntilExpiry !== null && msUntilExpiry > 0 && msUntilExpiry < weekFromMs
      const expired =
        msUntilExpiry !== null ? msUntilExpiry <= 0 : !account.isConnected

      return {
        id: account.id,
        platform: account.platform,
        pageName: account.pageName,
        isConnected: account.isConnected,
        tokenExpiresAt: expiresAt?.toISOString() ?? null,
        health: expired
          ? 'expired'
          : expiringSoon
            ? 'expiring_soon'
            : account.isConnected
              ? 'healthy'
              : 'disconnected',
      }
    })

    // Engagement aggregates from published posts with external IDs (counts only —
    // live Meta engagement is fetched on demand from history).
    const publishedWithExternal = await prisma.post.count({
      where: {
        companyId,
        status: PostStatus.published,
        externalPostId: { not: null },
      },
    })

    res.json({
      postsPublishedThisWeek: publishedThisWeek,
      postsPublishedThisMonth: publishedThisMonth,
      failedPublishCount: failedCount,
      scheduledCount,
      draftCount,
      pendingApprovalCount,
      publishedWithEngagementAvailable: publishedWithExternal,
      publishingTrend,
      accountHealth,
      recentActivity: recentAudit.map((entry) => ({
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
    })
  } catch (error) {
    next(error)
  }
})
