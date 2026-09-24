import { PostStatus, SocialPlatform } from '@prisma/client'

import {
  createInstagramImageContainer,
  publishInstagramContainer,
  publishPageFeedPost,
  publishPageMultiPhotoPost,
  publishPagePhotoPost,
  publishPageVideoPost,
  waitForInstagramContainer,
} from './meta-graph.js'
import { prisma } from './prisma.js'
import {
  fetchTikTokCreatorInfo,
  publishTikTokVideo,
  refreshTikTokToken,
} from './tiktok-api.js'
import { decryptSecret, encryptSecret } from './token-crypto.js'
import { writeAuditLog } from './audit.js'

type DuePost = {
  id: number
  companyId: number
  createdById: number | null
  caption: string
  mediaUrl: string | null
  mediaType?: 'image' | 'video' | null
  media: Array<{ url: string; type: 'image' | 'video'; position: number }>
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
        refreshTokenEnc: string | null
        tokenExpiresAt: Date | null
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
  mediaType?: 'image' | 'video' | null
  media?: Array<{ url: string; type: 'image' | 'video' }>
}) {
  const {
    platform,
    pageId,
    accessToken,
    caption,
    mediaUrl,
    mediaType,
    media = [],
  } = input

  if (platform === SocialPlatform.facebook) {
    if (media.length > 1) {
      const photos = await Promise.all(
        media.map((item) =>
          publishPagePhotoPost({
            pageId,
            pageAccessToken: accessToken,
            message: '',
            imageUrl: item.url,
            published: false,
          }),
        ),
      )
      const gallery = await publishPageMultiPhotoPost({
        pageId,
        pageAccessToken: accessToken,
        message: caption,
        photoIds: photos.map((photo) => photo.id),
      })
      return gallery.id
    }
    if (mediaUrl && mediaType === 'video') {
      const video = await publishPageVideoPost({
        pageId,
        pageAccessToken: accessToken,
        message: caption,
        videoUrl: mediaUrl,
      })
      return video.id
    }
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
    if (mediaType === 'video') {
      throw new Error(
        'Instagram scheduled video publishing is not configured for this account',
      )
    }
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

  if (platform === SocialPlatform.tiktok) {
    if (!mediaUrl || mediaType !== 'video') {
      throw new Error('TikTok scheduled posts require one public video URL')
    }
    const creator = await fetchTikTokCreatorInfo(accessToken)
    if (!creator.privacy_level_options.includes('SELF_ONLY')) {
      throw new Error('TikTok account does not allow private Direct Posts')
    }
    return publishTikTokVideo({
      accessToken,
      title: caption,
      videoUrl: mediaUrl,
    })
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
      let accessToken = decryptSecret(social.accessTokenEnc)
      if (
        social.platform === SocialPlatform.tiktok &&
        (!social.tokenExpiresAt ||
          social.tokenExpiresAt.getTime() <= Date.now() + 60_000)
      ) {
        if (!social.refreshTokenEnc) {
          throw new Error('TikTok account must be reconnected')
        }
        const token = await refreshTikTokToken(
          decryptSecret(social.refreshTokenEnc),
        )
        accessToken = token.access_token
        await prisma.socialAccount.update({
          where: { id: social.id },
          data: {
            accessTokenEnc: encryptSecret(token.access_token),
            refreshTokenEnc: encryptSecret(token.refresh_token),
            tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
          },
        })
      }
      lastExternalId = await publishToSocialAccount({
        platform: social.platform,
        pageId: social.pageId,
        accessToken,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        media: post.media,
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
      media: { orderBy: { position: 'asc' } },
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
