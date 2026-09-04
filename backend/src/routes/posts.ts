import { PostStatus, PublishMode, UserRole } from '@prisma/client'
import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import {
  mapPostDetail,
  mapPublishedPost,
  mapScheduledPost,
} from '../lib/mappers.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { createPostSchema, updatePostSchema } from '../schemas/posting.js'

const postInclude = {
  accounts: {
    include: {
      account: true,
    },
  },
} as const

export const postsRouter = Router()

postsRouter.use(requireAuth)

postsRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const status = typeof req.query.status === 'string' ? req.query.status : undefined

    if (status === 'published') {
      const posts = await prisma.post.findMany({
        where: {
          companyId,
          status: { in: [PostStatus.published, PostStatus.failed] },
        },
        include: postInclude,
        orderBy: { publishedAt: 'desc' },
      })
      res.json(posts.map(mapPublishedPost))
      return
    }

    if (status === 'scheduled') {
      const posts = await prisma.post.findMany({
        where: {
          companyId,
          status: { in: [PostStatus.scheduled, PostStatus.failed] },
          publishMode: PublishMode.schedule,
        },
        include: postInclude,
        orderBy: { scheduledAt: 'asc' },
      })
      res.json(posts.map(mapScheduledPost))
      return
    }

    if (status === 'draft') {
      const posts = await prisma.post.findMany({
        where: { companyId, status: PostStatus.draft },
        include: postInclude,
        orderBy: { updatedAt: 'desc' },
      })
      res.json(posts.map(mapPostDetail))
      return
    }

    if (status === 'pending_approval') {
      const posts = await prisma.post.findMany({
        where: { companyId, status: PostStatus.pending_approval },
        include: postInclude,
        orderBy: { updatedAt: 'desc' },
      })
      res.json(posts.map(mapPostDetail))
      return
    }

    if (status === 'calendar') {
      const posts = await prisma.post.findMany({
        where: {
          companyId,
          status: {
            in: [
              PostStatus.scheduled,
              PostStatus.published,
              PostStatus.pending_approval,
            ],
          },
        },
        include: postInclude,
        orderBy: [{ scheduledAt: 'asc' }, { publishedAt: 'asc' }],
      })
      res.json(posts.map(mapPostDetail))
      return
    }

    const posts = await prisma.post.findMany({
      where: { companyId },
      include: postInclude,
      orderBy: { createdAt: 'desc' },
    })
    res.json(posts.map(mapPostDetail))
  } catch (error) {
    next(error)
  }
})

postsRouter.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const post = await prisma.post.findFirst({
      where: { id, companyId },
      include: postInclude,
    })

    if (!post) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    res.json(mapPostDetail(post))
  } catch (error) {
    next(error)
  }
})

postsRouter.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    const userId = req.user?.id
    if (!companyId || !userId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const body = createPostSchema.parse(req.body)
    const {
      caption,
      mediaUrl,
      mediaType,
      selectedAccountIds,
      publishMode,
      scheduledAt,
      requireApproval,
    } = body

    const accounts = await prisma.connectedAccount.findMany({
      where: { id: { in: selectedAccountIds }, companyId },
    })

    if (accounts.length !== selectedAccountIds.length) {
      res.status(400).json({ message: 'One or more selected accounts were not found' })
      return
    }

    if (
      selectedAccountIds.length > 0 &&
      req.user?.role !== UserRole.main_admin
    ) {
      const permissions = await prisma.accountPermission.findMany({
        where: {
          companyId,
          userId,
          connectedAccountId: { in: selectedAccountIds },
          canPublish: true,
        },
      })

      const allowed = new Set(permissions.map((p) => p.connectedAccountId))
      const denied = selectedAccountIds.filter((id) => !allowed.has(id))

      // If no permission rows exist for the company yet, allow publish (open by default).
      const anyPermissions = await prisma.accountPermission.count({
        where: { companyId },
      })
      if (anyPermissions > 0 && denied.length > 0) {
        res.status(403).json({
          message:
            'You do not have publish permission for one or more selected accounts',
        })
        return
      }
    }

    const now = new Date()
    let status: PostStatus = PostStatus.draft
    let publishedAt: Date | null = null
    let scheduledAtDate: Date | null = scheduledAt ? new Date(scheduledAt) : null
    let mode = publishMode

    if (publishMode === 'now') {
      const needsApproval =
        requireApproval || req.user?.role === UserRole.admin
      if (needsApproval) {
        status = PostStatus.pending_approval
        mode = PublishMode.draft
        publishedAt = null
        scheduledAtDate = null
      } else {
        // Immediate Meta publish is handled by social routes; CMS "now" without Meta
        // is stored as published for local tracking only.
        status = PostStatus.published
        publishedAt = now
        scheduledAtDate = null
      }
    } else if (publishMode === 'schedule') {
      status = PostStatus.scheduled
      publishedAt = null
    } else {
      status = PostStatus.draft
      publishedAt = null
      scheduledAtDate = null
    }

    const post = await prisma.post.create({
      data: {
        companyId,
        createdById: userId,
        caption: caption.trim() || '(untitled draft)',
        mediaUrl: mediaUrl ?? null,
        mediaType: mediaType ?? null,
        publishMode: mode,
        status,
        publishedAt,
        scheduledAt: scheduledAtDate,
        accounts: {
          create: selectedAccountIds.map((accountId) => ({ accountId })),
        },
      },
      include: postInclude,
    })

    await writeAuditLog({
      companyId,
      userId,
      action:
        status === PostStatus.scheduled
          ? 'post.scheduled'
          : status === PostStatus.pending_approval
            ? 'post.submitted_for_approval'
            : status === PostStatus.draft
              ? 'post.draft_saved'
              : 'post.created',
      entityType: 'post',
      entityId: post.id,
      summary: `Post #${post.id} created as ${status}`,
    })

    res.status(201).json(mapPostDetail(post))
  } catch (error) {
    next(error)
  }
})

postsRouter.patch('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    const userId = req.user?.id
    if (!companyId || !userId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const existing = await prisma.post.findFirst({
      where: { id, companyId },
      include: postInclude,
    })

    if (!existing) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    const body = updatePostSchema.parse(req.body)
    const { action, caption, mediaUrl, mediaType, selectedAccountIds, scheduledAt } =
      body

    if (selectedAccountIds) {
      const accounts = await prisma.connectedAccount.findMany({
        where: { id: { in: selectedAccountIds }, companyId },
      })
      if (accounts.length !== selectedAccountIds.length) {
        res.status(400).json({
          message: 'One or more selected accounts were not found',
        })
        return
      }
    }

    let nextStatus = existing.status
    let nextMode = existing.publishMode
    let nextScheduledAt = existing.scheduledAt
    let nextPublishedAt = existing.publishedAt
    let auditAction = 'post.updated'
    let auditSummary = `Post #${id} updated`

    if (action === 'cancel') {
      if (
        existing.status !== PostStatus.scheduled &&
        existing.status !== PostStatus.pending_approval
      ) {
        res.status(400).json({ message: 'Only scheduled or pending posts can be cancelled' })
        return
      }
      nextStatus = PostStatus.cancelled
      nextScheduledAt = null
      auditAction = 'post.cancelled'
      auditSummary = `Post #${id} cancelled`
    } else if (action === 'reschedule') {
      if (!scheduledAt) {
        res.status(400).json({ message: 'scheduledAt is required to reschedule' })
        return
      }
      nextStatus = PostStatus.scheduled
      nextMode = PublishMode.schedule
      nextScheduledAt = new Date(scheduledAt)
      nextPublishedAt = null
      auditAction = 'post.rescheduled'
      auditSummary = `Post #${id} rescheduled`
    } else if (action === 'submit_for_approval') {
      nextStatus = PostStatus.pending_approval
      auditAction = 'post.submitted_for_approval'
      auditSummary = `Post #${id} submitted for approval`
    } else if (action === 'approve') {
      if (req.user?.role !== UserRole.main_admin) {
        res.status(403).json({ message: 'Only main admins can approve posts' })
        return
      }
      nextStatus = PostStatus.scheduled
      nextMode = PublishMode.schedule
      if (!nextScheduledAt) {
        nextScheduledAt = new Date()
      }
      auditAction = 'post.approved'
      auditSummary = `Post #${id} approved for publishing`
    } else if (action === 'reject_to_draft') {
      if (req.user?.role !== UserRole.main_admin) {
        res.status(403).json({ message: 'Only main admins can reject posts' })
        return
      }
      nextStatus = PostStatus.draft
      nextMode = PublishMode.draft
      nextScheduledAt = null
      auditAction = 'post.rejected'
      auditSummary = `Post #${id} rejected to draft`
    } else if (scheduledAt !== undefined) {
      nextScheduledAt = scheduledAt ? new Date(scheduledAt) : null
      if (scheduledAt && existing.status === PostStatus.scheduled) {
        nextStatus = PostStatus.scheduled
      }
    }

    const post = await prisma.$transaction(async (tx) => {
      if (selectedAccountIds) {
        await tx.postAccount.deleteMany({ where: { postId: id } })
        if (selectedAccountIds.length > 0) {
          await tx.postAccount.createMany({
            data: selectedAccountIds.map((accountId) => ({
              postId: id,
              accountId,
            })),
          })
        }
      }

      return tx.post.update({
        where: { id },
        data: {
          caption: caption !== undefined ? caption.trim() || existing.caption : undefined,
          mediaUrl: mediaUrl !== undefined ? mediaUrl : undefined,
          mediaType: mediaType !== undefined ? mediaType : undefined,
          status: nextStatus,
          publishMode: nextMode,
          scheduledAt: nextScheduledAt,
          publishedAt: nextPublishedAt,
        },
        include: postInclude,
      })
    })

    await writeAuditLog({
      companyId,
      userId,
      action: auditAction,
      entityType: 'post',
      entityId: id,
      summary: auditSummary,
    })

    res.json(mapPostDetail(post))
  } catch (error) {
    next(error)
  }
})

postsRouter.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    const userId = req.user?.id
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid post id' })
      return
    }

    const existing = await prisma.post.findFirst({ where: { id, companyId } })
    if (!existing) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    await prisma.post.delete({ where: { id } })

    await writeAuditLog({
      companyId,
      userId,
      action: 'post.deleted',
      entityType: 'post',
      entityId: id,
      summary: `Post #${id} deleted`,
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
