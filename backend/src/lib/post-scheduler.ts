import { PostStatus, SocialPlatform } from '@prisma/client'

import {
  createInstagramImageContainer,
  publishInstagramContainer,
  publishPageFeedPost,
  publishPagePhotoPost,
  waitForInstagramContainer,
} from './meta-graph.js'
import { prisma } from './prisma.js'
import { decryptSecret } from './token-crypto.js'
import { writeAuditLog } from './audit.js'

type DuePost = {
  id: number
  companyId: number
  createdById: number | null
  caption: string
  mediaUrl: string | null
  accounts: Array<{
    accountId: number
    account: {
      id: number
      platform: SocialPlatform
      socialAccount: {
        id: number
        pageId: string
        pageName: string
        accessTokenEnc: string
        isConnected: boolean
        platform: SocialPlatform
      } | null
    }
  }>
}

async function publishToSocialAccount(input: {
  platform: SocialPlatform
  pageId: string
  accessToken: string
  caption: string
  mediaUrl: string | null
}) {
  const { platform, pageId, accessToken, caption, mediaUrl } = input

  if (platform === SocialPlatform.facebook) {
    if (mediaUrl) {
      const photo = await publishPagePhotoPost({
        pageId,
        pageAccessToken: accessToken,
        message: caption,
        imageUrl: mediaUrl,
      })
      return photo.post_id ?? photo.id
    }

    const feed = await publishPageFeedPost({
      pageId,
      pageAccessToken: accessToken,
      message: caption,
    })
    return feed.id
  }

  if (platform === SocialPlatform.instagram) {
    if (!mediaUrl) {
      throw new Error('Instagram scheduled posts require an image URL')
    }

    const container = await createInstagramImageContainer({
      igUserId: pageId,
      pageAccessToken: accessToken,
      imageUrl: mediaUrl,
      caption,
    })

    await waitForInstagramContainer({
      containerId: container.id,
      pageAccessToken: accessToken,
    })

    const published = await publishInstagramContainer({
      igUserId: pageId,
      pageAccessToken: accessToken,
      creationId: container.id,
    })
    return published.id
  }

  throw new Error(`Unsupported platform for scheduled publish: ${platform}`)
}

async function processDuePost(post: DuePost) {
  const errors: string[] = []
  let lastExternalId: string | null = null

  for (const { account } of post.accounts) {
    const social = account.socialAccount
    if (!social || !social.isConnected) {
      errors.push(`${account.platform}: no connected social account`)
      continue
    }

    try {
      const accessToken = decryptSecret(social.accessTokenEnc)
      lastExternalId = await publishToSocialAccount({
        platform: social.platform,
        pageId: social.pageId,
        accessToken,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Publish failed'
      errors.push(`${account.platform}: ${message}`)
    }
  }

  if (errors.length > 0 && !lastExternalId) {
    await prisma.post.update({
      where: { id: post.id },
      data: {
        status: PostStatus.failed,
        publishError: errors.join('; '),
      },
    })

    await writeAuditLog({
      companyId: post.companyId,
      userId: post.createdById,
      action: 'post.publish_failed',
      entityType: 'post',
      entityId: post.id,
      summary: `Scheduled post #${post.id} failed to publish`,
      metadata: { errors },
    })
    return
  }

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: PostStatus.published,
      publishedAt: new Date(),
      externalPostId: lastExternalId,
      publishError: errors.length > 0 ? errors.join('; ') : null,
    },
  })

  await writeAuditLog({
    companyId: post.companyId,
    userId: post.createdById,
    action: 'post.published',
    entityType: 'post',
    entityId: post.id,
    summary: `Scheduled post #${post.id} published`,
    metadata: { externalPostId: lastExternalId, partialErrors: errors },
  })
}

export async function processDueScheduledPosts() {
  const now = new Date()
  const duePosts = await prisma.post.findMany({
    where: {
      status: PostStatus.scheduled,
      scheduledAt: { lte: now },
    },
    include: {
      accounts: {
        include: {
          account: {
            include: {
              socialAccount: true,
            },
          },
        },
      },
    },
    take: 20,
    orderBy: { scheduledAt: 'asc' },
  })

  for (const post of duePosts) {
    try {
      await processDuePost(post)
    } catch (error) {
      console.error(`[scheduler] Failed processing post #${post.id}`, error)
      await prisma.post.update({
        where: { id: post.id },
        data: {
          status: PostStatus.failed,
          publishError:
            error instanceof Error ? error.message : 'Scheduler error',
        },
      })
    }
  }

  return duePosts.length
}

let schedulerTimer: ReturnType<typeof setInterval> | null = null

export function startPostScheduler(intervalMs = 30_000) {
  if (schedulerTimer) return

  const tick = () => {
    void processDueScheduledPosts().catch((error) => {
      console.error('[scheduler] Tick failed', error)
    })
  }

  tick()
  schedulerTimer = setInterval(tick, intervalMs)
  console.log(`[scheduler] Started (every ${intervalMs / 1000}s)`)
}
