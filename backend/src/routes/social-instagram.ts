import { SocialPlatform } from '@prisma/client'
import { Router, type Response } from 'express'

import {
  env,
  getMetaInstagramOAuthScopes,
  isMetaConfigured,
} from '../config/env.js'
import { signMetaOAuthState } from '../lib/facebook-oauth-state.js'
import { mapAccount } from '../lib/mappers.js'
import {
  getPublicMediaUrl,
  isPubliclyReachableUrl,
  savePublicMediaFile,
} from '../lib/media-store.js'
import {
  buildFacebookOAuthUrl,
  createInstagramCarouselContainer,
  createInstagramImageContainer,
  fetchInstagramMediaEngagement,
  MetaGraphError,
  publishInstagramContainer,
  waitForInstagramContainer,
} from '../lib/meta-graph.js'
import { prisma } from '../lib/prisma.js'
import { decryptSecret } from '../lib/token-crypto.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import {
  facebookImageUpload,
  MAX_IMAGES_PER_POST,
} from '../middleware/facebook-image-upload.js'
import { instagramPublishSchema } from '../schemas/instagram.js'

export const instagramSocialRouter = Router()

const PLATFORM_INSTAGRAM = SocialPlatform.instagram

function requireCompanyContext(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.companyId) {
    res.status(403).json({ message: 'Company context required' })
    return null
  }
  return req.user
}

function mapInstagramAccount(account: {
  id: number
  pageId: string
  pageName: string
  facebookUserId: string | null
  isConnected: boolean
  tokenExpiresAt: Date | null
  connectedAccountId: number | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: account.id,
    platform: 'instagram' as const,
    pageId: account.pageId,
    pageName: account.pageName,
    facebookUserId: account.facebookUserId,
    isConnected: account.isConnected,
    tokenExpiresAt: account.tokenExpiresAt?.toISOString() ?? null,
    connectedAccountId: account.connectedAccountId,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }
}

/**
 * Start Instagram connect via Facebook Login (same Meta app as Facebook Pages).
 * Callback: GET /api/social/facebook/callback with state.platform=instagram
 * POST /api/social/instagram/connect
 */
instagramSocialRouter.post(
  '/connect',
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    const user = requireCompanyContext(req, res)
    if (!user) return

    if (!isMetaConfigured()) {
      res.status(503).json({
        message:
          'Meta App is not configured. Set META_APP_ID and META_APP_SECRET on the API.',
      })
      return
    }

    const state = signMetaOAuthState({
      userId: user.id,
      companyId: user.companyId,
      platform: 'instagram',
    })

    res.json({
      authUrl: buildFacebookOAuthUrl(state, getMetaInstagramOAuthScopes()),
      redirectUri: env.META_REDIRECT_URI,
      graphApiVersion: env.META_GRAPH_API_VERSION,
      scopes: getMetaInstagramOAuthScopes(),
    })
  },
)

/**
 * List connected Instagram accounts for the company.
 * GET /api/social/instagram/accounts
 */
instagramSocialRouter.get(
  '/accounts',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const accounts = await prisma.socialAccount.findMany({
        where: {
          companyId: user.companyId,
          platform: PLATFORM_INSTAGRAM,
        },
        orderBy: { pageName: 'asc' },
      })

      res.json(accounts.map(mapInstagramAccount))
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Disconnect an Instagram account.
 * DELETE /api/social/instagram/accounts/:id
 */
instagramSocialRouter.delete(
  '/accounts/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid account id' })
        return
      }

      const account = await prisma.socialAccount.findFirst({
        where: {
          id,
          companyId: user.companyId,
          platform: PLATFORM_INSTAGRAM,
        },
      })

      if (!account) {
        res.status(404).json({ message: 'Instagram account not found' })
        return
      }

      if (account.connectedAccountId) {
        await prisma.connectedAccount.delete({
          where: { id: account.connectedAccountId },
        })
      }

      await prisma.socialAccount.delete({ where: { id: account.id } })

      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Publish an image / carousel post to Instagram (Facebook Login + Page token).
 * POST /api/social/instagram/publish
 */
instagramSocialRouter.post(
  '/publish',
  requireAuth,
  facebookImageUpload.array('images', MAX_IMAGES_PER_POST),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const body = instagramPublishSchema.parse(req.body)
      const uploadedImages = (req.files as Express.Multer.File[] | undefined) ?? []
      const imageUrlsFromBody = [
        ...body.imageUrls,
        ...(body.imageUrl ? [body.imageUrl] : []),
      ]

      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          id: body.socialAccountId,
          companyId: user.companyId,
          platform: PLATFORM_INSTAGRAM,
          isConnected: true,
        },
      })

      if (!socialAccount) {
        res.status(404).json({
          message: 'Instagram account not found for this company',
        })
        return
      }

      let pageAccessToken: string
      try {
        pageAccessToken = decryptSecret(socialAccount.accessTokenEnc)
      } catch {
        res.status(500).json({
          message: 'Stored Instagram token could not be decrypted',
        })
        return
      }

      const imageUrls: string[] = [...imageUrlsFromBody]
      for (const file of uploadedImages) {
        const filename = await savePublicMediaFile({
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
        })
        imageUrls.push(getPublicMediaUrl(filename))
      }

      if (imageUrls.length === 0) {
        res.status(400).json({
          message:
            'Instagram publishing requires at least one image file or public image URL.',
        })
        return
      }

      for (const imageUrl of imageUrls) {
        if (!isPubliclyReachableUrl(imageUrl)) {
          res.status(400).json({
            message:
              'Instagram needs publicly reachable image URLs (Meta cannot fetch localhost). Set PUBLIC_API_BASE_URL to an https tunnel (e.g. ngrok) pointing at this API, or paste public https image URLs.',
          })
          return
        }
      }

      let externalPostId: string
      try {
        if (imageUrls.length === 1) {
          const container = await createInstagramImageContainer({
            igUserId: socialAccount.pageId,
            pageAccessToken,
            imageUrl: imageUrls[0],
            caption: body.caption,
          })

          await waitForInstagramContainer({
            containerId: container.id,
            pageAccessToken,
          })

          const published = await publishInstagramContainer({
            igUserId: socialAccount.pageId,
            pageAccessToken,
            creationId: container.id,
          })

          externalPostId = published.id
        } else {
          const childIds: string[] = []
          for (const imageUrl of imageUrls) {
            const child = await createInstagramImageContainer({
              igUserId: socialAccount.pageId,
              pageAccessToken,
              imageUrl,
              isCarouselItem: true,
            })
            await waitForInstagramContainer({
              containerId: child.id,
              pageAccessToken,
            })
            childIds.push(child.id)
          }

          const carousel = await createInstagramCarouselContainer({
            igUserId: socialAccount.pageId,
            pageAccessToken,
            childContainerIds: childIds,
            caption: body.caption,
          })

          await waitForInstagramContainer({
            containerId: carousel.id,
            pageAccessToken,
          })

          const published = await publishInstagramContainer({
            igUserId: socialAccount.pageId,
            pageAccessToken,
            creationId: carousel.id,
          })

          externalPostId = published.id
        }
      } catch (error) {
        if (error instanceof MetaGraphError) {
          const isAuthError = error.code === 190 || error.status === 401

          if (isAuthError) {
            await prisma.socialAccount.update({
              where: { id: socialAccount.id },
              data: { isConnected: false },
            })
            res.status(401).json({
              message:
                'Instagram token expired or revoked. Reconnect in Connected Accounts.',
            })
            return
          }

          if (
            error.message.toLowerCase().includes('instagram_content_publish') ||
            error.code === 10 ||
            error.code === 200
          ) {
            res.status(403).json({
              message:
                'Publishing requires instagram_content_publish. Enable it under Meta → Instagram API → API setup with Facebook login, set META_INSTAGRAM_OAUTH_SCOPES, restart the API, then Disconnect and Connect Instagram again.',
            })
            return
          }

          res.status(502).json({ message: error.message })
          return
        }
        throw error
      }

      const primaryMediaUrl = imageUrls[0]

      let cmsPost =
        body.postId !== undefined
          ? await prisma.post.findFirst({
              where: { id: body.postId, companyId: user.companyId },
              include: {
                accounts: { include: { account: true } },
              },
            })
          : null

      if (!cmsPost) {
        cmsPost = await prisma.post.create({
          data: {
            companyId: user.companyId,
            createdById: user.id,
            caption: body.caption,
            mediaUrl: primaryMediaUrl,
            mediaType: 'image',
            publishMode: 'now',
            status: 'published',
            publishedAt: new Date(),
            externalPostId,
            accounts: socialAccount.connectedAccountId
              ? {
                  create: [{ accountId: socialAccount.connectedAccountId }],
                }
              : undefined,
          },
          include: {
            accounts: { include: { account: true } },
          },
        })
      } else {
        cmsPost = await prisma.post.update({
          where: { id: cmsPost.id },
          data: {
            status: 'published',
            publishedAt: new Date(),
            externalPostId,
            publishError: null,
            caption: body.caption,
            mediaUrl: primaryMediaUrl,
            mediaType: 'image',
          },
          include: {
            accounts: { include: { account: true } },
          },
        })
      }

      console.info(
        '[instagram] Published post',
        JSON.stringify({
          companyId: user.companyId,
          socialAccountId: socialAccount.id,
          cmsPostId: cmsPost.id,
        }),
      )

      res.status(201).json({
        id: cmsPost.id,
        externalPostId,
        socialAccountId: socialAccount.id,
        pageId: socialAccount.pageId,
        pageName: socialAccount.pageName,
        status: cmsPost.status,
        publishedAt: cmsPost.publishedAt?.toISOString() ?? null,
        connectedAccount: socialAccount.connectedAccountId
          ? mapAccount(
              await prisma.connectedAccount.findUniqueOrThrow({
                where: { id: socialAccount.connectedAccountId },
              }),
            )
          : null,
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * List CMS posts published to Instagram for this company.
 * GET /api/social/instagram/posts
 */
instagramSocialRouter.get(
  '/posts',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const posts = await prisma.post.findMany({
        where: {
          companyId: user.companyId,
          accounts: {
            some: { account: { platform: PLATFORM_INSTAGRAM } },
          },
        },
        include: {
          accounts: { include: { account: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      res.json(
        posts.map((post) => ({
          id: post.id,
          caption: post.caption,
          mediaUrl: post.mediaUrl,
          status: post.status,
          externalPostId: post.externalPostId,
          publishError: post.publishError,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          createdAt: post.createdAt.toISOString(),
          platforms: post.accounts.map((item) => item.account.platform),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Fetch engagement for a published Instagram media item.
 * GET /api/social/instagram/posts/:id/engagement
 */
instagramSocialRouter.get(
  '/posts/:id/engagement',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const postId = Number(req.params.id)
      if (!Number.isInteger(postId)) {
        res.status(400).json({ message: 'Invalid post id' })
        return
      }

      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          companyId: user.companyId,
          externalPostId: { not: null },
          accounts: {
            some: { account: { platform: PLATFORM_INSTAGRAM } },
          },
        },
        include: {
          accounts: {
            include: {
              account: {
                include: { socialAccount: true },
              },
            },
          },
        },
      })

      if (!post?.externalPostId) {
        res.status(404).json({ message: 'Instagram post not found' })
        return
      }

      const socialAccount =
        post.accounts
          .map((item) => item.account.socialAccount)
          .find(
            (account) =>
              account?.platform === PLATFORM_INSTAGRAM && account.isConnected,
          ) ??
        (await prisma.socialAccount.findFirst({
          where: {
            companyId: user.companyId,
            platform: PLATFORM_INSTAGRAM,
            isConnected: true,
          },
        }))

      if (!socialAccount) {
        res.status(404).json({
          message: 'No connected Instagram account available for engagement',
        })
        return
      }

      let pageAccessToken: string
      try {
        pageAccessToken = decryptSecret(socialAccount.accessTokenEnc)
      } catch {
        res.status(500).json({ message: 'Stored token could not be decrypted' })
        return
      }

      try {
        const engagement = await fetchInstagramMediaEngagement({
          mediaId: post.externalPostId,
          pageAccessToken,
        })

        res.json({
          postId: post.id,
          externalPostId: post.externalPostId,
          caption: engagement.caption ?? post.caption,
          mediaType: engagement.media_type ?? null,
          mediaUrl: engagement.media_url ?? post.mediaUrl,
          permalink: engagement.permalink ?? null,
          timestamp: engagement.timestamp ?? null,
          likeCount: engagement.like_count ?? 0,
          commentsCount: engagement.comments_count ?? 0,
          comments: (engagement.comments?.data ?? []).map((comment) => ({
            id: comment.id,
            text: comment.text ?? '',
            timestamp: comment.timestamp ?? null,
            username: comment.username ?? null,
          })),
        })
      } catch (error) {
        if (error instanceof MetaGraphError) {
          res.status(502).json({ message: error.message })
          return
        }
        throw error
      }
    } catch (error) {
      next(error)
    }
  },
)
