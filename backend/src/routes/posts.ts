import { PostStatus, PublishMode } from '@prisma/client'
import { Router } from 'express'

import {
  mapPostDetail,
  mapPublishedPost,
  mapScheduledPost,
} from '../lib/mappers.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { createPostSchema } from '../schemas/posting.js'

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
          publishMode: PublishMode.now,
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
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const body = createPostSchema.parse(req.body)
    const { caption, mediaUrl, mediaType, selectedAccountIds, publishMode, scheduledAt } =
      body

    const accounts = await prisma.connectedAccount.findMany({
      where: { id: { in: selectedAccountIds }, companyId },
    })

    if (accounts.length !== selectedAccountIds.length) {
      res.status(400).json({ message: 'One or more selected accounts were not found' })
      return
    }

    const now = new Date()
    let status: PostStatus = PostStatus.draft
    let publishedAt: Date | null = null
    let scheduledAtDate: Date | null = scheduledAt ? new Date(scheduledAt) : null

    if (publishMode === 'now') {
      status = PostStatus.published
      publishedAt = now
      scheduledAtDate = null
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
        createdById: req.user?.id,
        caption,
        mediaUrl: mediaUrl ?? null,
        mediaType: mediaType ?? null,
        publishMode,
        status,
        publishedAt,
        scheduledAt: scheduledAtDate,
        accounts: {
          create: selectedAccountIds.map((accountId) => ({ accountId })),
        },
      },
      include: postInclude,
    })

    res.status(201).json(mapPostDetail(post))
  } catch (error) {
    next(error)
  }
})

postsRouter.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
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

    const existing = await prisma.post.findFirst({ where: { id, companyId } })
    if (!existing) {
      res.status(404).json({ message: 'Post not found' })
      return
    }

    await prisma.post.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})
