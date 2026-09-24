import { SocialPlatform } from '@prisma/client'
import { Router, type Response } from 'express'

import { env, isMetaConfigured } from '../config/env.js'
import {
  signMetaOAuthState,
  verifyMetaOAuthState,
} from '../lib/facebook-oauth-state.js'
import { mapAccount } from '../lib/mappers.js'
import {
  getPublicMediaUrl,
  savePublicMediaFile,
} from '../lib/media-store.js'
import {
  buildFacebookOAuthUrl,
  exchangeCodeForUserToken,
  exchangeForLongLivedUserToken,
  fetchFacebookUser,
  fetchManagedPages,
  fetchPagesWithInstagram,
<<<<<<< HEAD
  fetchPhotoLargestSource,
=======
>>>>>>> origin/main
  fetchPostEngagement,
  MetaGraphError,
  publishPageFeedPost,
  publishPageMultiPhotoPost,
  publishPagePhotoFromFile,
  publishPagePhotoPost,
  summarizeFacebookReactions,
} from '../lib/meta-graph.js'
import { prisma } from '../lib/prisma.js'
import { decryptSecret, encryptSecret } from '../lib/token-crypto.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import {
  facebookImageUpload,
  MAX_IMAGES_PER_POST,
} from '../middleware/facebook-image-upload.js'
import { facebookPublishSchema } from '../schemas/facebook.js'

export const facebookSocialRouter = Router()

const CREATE_CONTENT_TASK = 'CREATE_CONTENT'
const PLATFORM_FACEBOOK = SocialPlatform.facebook
const PLATFORM_INSTAGRAM = SocialPlatform.instagram

function requireCompanyContext(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.companyId) {
    res.status(403).json({ message: 'Company context required' })
    return null
  }
  return req.user
}

function frontendAccountsRedirect(query: Record<string, string>) {
  const url = new URL('/posting/accounts', env.FRONTEND_URL)
  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

function mapSocialAccount(account: {
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
    platform: 'facebook' as const,
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

async function upsertFacebookPage(input: {
  companyId: number
  userId: number
  facebookUserId: string
  page: { id: string; name: string; access_token: string }
  tokenExpiresAt: Date | null
}) {
  const { companyId, userId, facebookUserId, page, tokenExpiresAt } = input
  const accessTokenEnc = encryptSecret(page.access_token)

  const connectedAccount = await prisma.connectedAccount.upsert({
    where: {
      companyId_platform_handle: {
        companyId,
        platform: PLATFORM_FACEBOOK,
        handle: page.name,
      },
    },
    create: {
      companyId,
      platform: PLATFORM_FACEBOOK,
      accountName: page.name,
      handle: page.name,
      isConnected: true,
    },
    update: {
      accountName: page.name,
      isConnected: true,
    },
  })

  return prisma.socialAccount.upsert({
    where: {
      companyId_platform_pageId: {
        companyId,
        platform: PLATFORM_FACEBOOK,
        pageId: page.id,
      },
    },
    create: {
      companyId,
      connectedByUserId: userId,
      connectedAccountId: connectedAccount.id,
      platform: PLATFORM_FACEBOOK,
      facebookUserId,
      pageId: page.id,
      pageName: page.name,
      accessTokenEnc,
      tokenExpiresAt,
      isConnected: true,
    },
    update: {
      connectedByUserId: userId,
      connectedAccountId: connectedAccount.id,
      pageName: page.name,
      facebookUserId,
      accessTokenEnc,
      tokenExpiresAt,
      isConnected: true,
    },
  })
}

async function upsertInstagramAccount(input: {
  companyId: number
  userId: number
  facebookUserId: string
  facebookPageName: string
  ig: { id: string; username?: string; name?: string }
  pageAccessToken: string
  tokenExpiresAt: Date | null
}) {
  const {
    companyId,
    userId,
    facebookUserId,
    facebookPageName,
    ig,
    pageAccessToken,
    tokenExpiresAt,
  } = input

  const displayName = ig.username
    ? `@${ig.username}`
    : (ig.name ?? `IG ${ig.id}`)
  const accessTokenEnc = encryptSecret(pageAccessToken)

  const connectedAccount = await prisma.connectedAccount.upsert({
    where: {
      companyId_platform_handle: {
        companyId,
        platform: PLATFORM_INSTAGRAM,
        handle: displayName,
      },
    },
    create: {
      companyId,
      platform: PLATFORM_INSTAGRAM,
      accountName: displayName,
      handle: displayName,
      isConnected: true,
    },
    update: {
      accountName: displayName,
      isConnected: true,
    },
  })

  return prisma.socialAccount.upsert({
    where: {
      companyId_platform_pageId: {
        companyId,
        platform: PLATFORM_INSTAGRAM,
        pageId: ig.id,
      },
    },
    create: {
      companyId,
      connectedByUserId: userId,
      connectedAccountId: connectedAccount.id,
      platform: PLATFORM_INSTAGRAM,
      facebookUserId,
      pageId: ig.id,
      pageName: `${displayName} · ${facebookPageName}`,
      accessTokenEnc,
      tokenExpiresAt,
      isConnected: true,
    },
    update: {
      connectedByUserId: userId,
      connectedAccountId: connectedAccount.id,
      pageName: `${displayName} · ${facebookPageName}`,
      facebookUserId,
      accessTokenEnc,
      tokenExpiresAt,
      isConnected: true,
    },
  })
}

/**
 * Start Facebook OAuth. Returns authUrl — never exposes App Secret.
 * POST /api/social/facebook/connect
 */
facebookSocialRouter.post(
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
      platform: 'facebook',
    })

    res.json({
      authUrl: buildFacebookOAuthUrl(state),
      redirectUri: env.META_REDIRECT_URI,
      graphApiVersion: env.META_GRAPH_API_VERSION,
    })
  },
)

/**
 * OAuth redirect callback from Meta (no Bearer token — state JWT carries identity).
 * Handles both Facebook Pages and Instagram Business accounts via state.platform.
 * GET /api/social/facebook/callback
 */
facebookSocialRouter.get('/callback', async (req, res) => {
  try {
    if (!isMetaConfigured()) {
      res.redirect(frontendAccountsRedirect({ facebook: 'error', reason: 'not_configured' }))
      return
    }

    const error = typeof req.query.error === 'string' ? req.query.error : null
    if (error) {
      const stateHint =
        typeof req.query.state === 'string'
          ? (() => {
              try {
                return verifyMetaOAuthState(req.query.state as string).platform
              } catch {
                return 'facebook'
              }
            })()
          : 'facebook'

      res.redirect(
        frontendAccountsRedirect({
          [stateHint]: 'error',
          reason: error,
        }),
      )
      return
    }

    const code = typeof req.query.code === 'string' ? req.query.code : null
    const stateToken = typeof req.query.state === 'string' ? req.query.state : null

    if (!code || !stateToken) {
      res.redirect(frontendAccountsRedirect({ facebook: 'error', reason: 'missing_code' }))
      return
    }

    const state = verifyMetaOAuthState(stateToken)
    const shortLived = await exchangeCodeForUserToken(code)
    const longLived = await exchangeForLongLivedUserToken(shortLived.access_token)
    const facebookUser = await fetchFacebookUser(longLived.access_token)

    const expiresAt =
      typeof longLived.expires_in === 'number'
        ? new Date(Date.now() + longLived.expires_in * 1000)
        : null

    if (state.platform === 'instagram') {
      const pages = await fetchPagesWithInstagram(longLived.access_token)
      const linked = pages.filter((page) => page.instagram_business_account?.id)

      for (const page of linked) {
        const ig = page.instagram_business_account
        if (!ig) continue

        await upsertInstagramAccount({
          companyId: state.companyId,
          userId: state.userId,
          facebookUserId: facebookUser.id,
          facebookPageName: page.name,
          ig: {
            id: ig.id,
            username: ig.username,
            name: ig.name,
          },
          pageAccessToken: page.access_token,
          tokenExpiresAt: expiresAt,
        })
      }

      console.info(
        '[instagram] OAuth connected via Facebook Login',
        JSON.stringify({
          companyId: state.companyId,
          userId: state.userId,
          accountCount: linked.length,
        }),
      )

      res.redirect(
        frontendAccountsRedirect({
          instagram: 'connected',
          accounts: String(linked.length),
        }),
      )
      return
    }

    const pages = await fetchManagedPages(longLived.access_token)

    const publishablePages = pages.filter((page) =>
      (page.tasks ?? []).includes(CREATE_CONTENT_TASK),
    )

    const pagesToStore = publishablePages.length > 0 ? publishablePages : pages

    for (const page of pagesToStore) {
      await upsertFacebookPage({
        companyId: state.companyId,
        userId: state.userId,
        facebookUserId: facebookUser.id,
        page: {
          id: page.id,
          name: page.name,
          access_token: page.access_token,
        },
        tokenExpiresAt: expiresAt,
      })
    }

    console.info(
      '[facebook] OAuth connected',
      JSON.stringify({
        companyId: state.companyId,
        userId: state.userId,
        pageCount: pagesToStore.length,
      }),
    )

    res.redirect(
      frontendAccountsRedirect({
        facebook: 'connected',
        pages: String(pagesToStore.length),
      }),
    )
  } catch (error) {
    const reason =
      error instanceof MetaGraphError
        ? 'graph_error'
        : error instanceof Error && error.message.includes('OAuth')
          ? 'invalid_state'
          : 'callback_failed'

    console.error('[meta] OAuth callback failed', {
      reason,
      message: error instanceof Error ? error.message : 'unknown',
    })

    res.redirect(frontendAccountsRedirect({ facebook: 'error', reason }))
  }
})

/**
 * List connected Facebook Pages for the current user's company.
 * GET /api/social/facebook/pages
 */
facebookSocialRouter.get(
  '/pages',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const accounts = await prisma.socialAccount.findMany({
        where: {
          companyId: user.companyId,
          platform: PLATFORM_FACEBOOK,
        },
        orderBy: { pageName: 'asc' },
      })

      res.json(accounts.map(mapSocialAccount))
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Disconnect a Facebook Page for this company.
 * DELETE /api/social/facebook/pages/:id
 */
facebookSocialRouter.delete(
  '/pages/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid page id' })
        return
      }

      const account = await prisma.socialAccount.findFirst({
        where: {
          id,
          companyId: user.companyId,
          platform: PLATFORM_FACEBOOK,
        },
      })

      if (!account) {
        res.status(404).json({ message: 'Facebook page not found' })
        return
      }

      if (account.connectedAccountId) {
        await prisma.connectedAccount.update({
          where: { id: account.connectedAccountId },
          data: { isConnected: false },
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
 * Publish a post to a connected Facebook Page.
 * POST /api/social/facebook/publish
 * JSON body or multipart form-data with optional `images` files (up to 10).
 */
facebookSocialRouter.post(
  '/publish',
  requireAuth,
  facebookImageUpload.array('images', MAX_IMAGES_PER_POST),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const body = facebookPublishSchema.parse(req.body)
      const uploadedImages = (req.files as Express.Multer.File[] | undefined) ?? []
      const imageUrls = [
        ...body.imageUrls,
        ...(body.imageUrl ? [body.imageUrl] : []),
      ]

      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          id: body.socialAccountId,
          companyId: user.companyId,
          platform: PLATFORM_FACEBOOK,
          isConnected: true,
        },
      })

      if (!socialAccount) {
        res.status(404).json({ message: 'Facebook page not found for this company' })
        return
      }

      let pageAccessToken: string
      try {
        pageAccessToken = decryptSecret(socialAccount.accessTokenEnc)
      } catch {
        res.status(500).json({ message: 'Stored Facebook token could not be decrypted' })
        return
      }

      let externalPostId: string
      let primaryMediaUrl: string | null = imageUrls[0] ?? null

      if (uploadedImages.length > 0) {
        const storedUrls: string[] = []
        for (const file of uploadedImages) {
          const filename = await savePublicMediaFile({
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname,
          })
          storedUrls.push(getPublicMediaUrl(filename))
        }
        primaryMediaUrl = storedUrls[0] ?? primaryMediaUrl
      }

      try {
        if (uploadedImages.length > 1) {
          const photoIds: string[] = []
          for (const file of uploadedImages) {
            const photo = await publishPagePhotoFromFile({
              pageId: socialAccount.pageId,
              pageAccessToken,
              message: body.message,
              published: false,
              file: {
                buffer: file.buffer,
                mimetype: file.mimetype,
                originalname: file.originalname,
              },
            })
            photoIds.push(photo.id)
          }
          const feed = await publishPageMultiPhotoPost({
            pageId: socialAccount.pageId,
            pageAccessToken,
            message: body.message,
            photoIds,
          })
          externalPostId = feed.id
        } else if (uploadedImages.length === 1) {
          const photo = await publishPagePhotoFromFile({
            pageId: socialAccount.pageId,
            pageAccessToken,
            message: body.message,
            file: {
              buffer: uploadedImages[0].buffer,
              mimetype: uploadedImages[0].mimetype,
              originalname: uploadedImages[0].originalname,
            },
          })
          externalPostId = photo.post_id ?? photo.id
<<<<<<< HEAD
          try {
            primaryMediaUrl = await fetchPhotoLargestSource({
              photoId: photo.id,
              pageAccessToken,
            })
          } catch {
            // Keep local media URL if CDN lookup fails.
          }
=======
>>>>>>> origin/main
        } else if (imageUrls.length > 1) {
          const photoIds: string[] = []
          for (const imageUrl of imageUrls) {
            const photo = await publishPagePhotoPost({
              pageId: socialAccount.pageId,
              pageAccessToken,
              message: body.message,
              imageUrl,
              published: false,
            })
            photoIds.push(photo.id)
          }
          const feed = await publishPageMultiPhotoPost({
            pageId: socialAccount.pageId,
            pageAccessToken,
            message: body.message,
            photoIds,
          })
          externalPostId = feed.id
          primaryMediaUrl = imageUrls[0]
        } else if (imageUrls.length === 1) {
          const photo = await publishPagePhotoPost({
            pageId: socialAccount.pageId,
            pageAccessToken,
            message: body.message,
            imageUrl: imageUrls[0],
          })
          externalPostId = photo.post_id ?? photo.id
          primaryMediaUrl = imageUrls[0]
        } else {
          const feed = await publishPageFeedPost({
            pageId: socialAccount.pageId,
            pageAccessToken,
            message: body.message,
          })
          externalPostId = feed.id
        }
      } catch (error) {
        if (error instanceof MetaGraphError) {
          const isAuthError = error.code === 190 || error.status === 401
          const isPermissionError =
            error.code === 200 ||
            error.message.toLowerCase().includes('pages_manage_posts')

          if (isAuthError) {
            await prisma.socialAccount.update({
              where: { id: socialAccount.id },
              data: { isConnected: false },
            })
            res.status(401).json({
              message:
                'Facebook token expired or revoked. Reconnect the Page in Connected Accounts.',
            })
            return
          }

          if (isPermissionError) {
            res.status(403).json({
              message:
                'Publishing requires pages_manage_posts. In Meta → Use cases → Manage everything on your Page, set pages_manage_posts to Ready for testing, add it to META_OAUTH_SCOPES, restart the API, then Disconnect and Connect Facebook again.',
            })
            return
          }

          res.status(502).json({ message: error.message })
          return
        }
        throw error
      }

      const hasImage = uploadedImages.length > 0 || imageUrls.length > 0

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
            caption: body.message,
            mediaUrl: primaryMediaUrl,
            mediaType: hasImage ? 'image' : null,
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
            caption: body.message,
            mediaUrl: primaryMediaUrl ?? cmsPost.mediaUrl,
            mediaType: hasImage ? 'image' : cmsPost.mediaType,
          },
          include: {
            accounts: { include: { account: true } },
          },
        })
      }

      console.info(
        '[facebook] Published post',
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
 * List CMS posts that were published to Facebook for this company.
 * GET /api/social/facebook/posts
 */
facebookSocialRouter.get(
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
            some: { account: { platform: PLATFORM_FACEBOOK } },
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
 * Fetch engagement for a published Facebook post (company-scoped).
 * GET /api/social/facebook/posts/:id/engagement
 */
facebookSocialRouter.get(
  '/posts/:id/engagement',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return

      const id = Number(req.params.id)
      if (!Number.isInteger(id)) {
        res.status(400).json({ message: 'Invalid post id' })
        return
      }

      const post = await prisma.post.findFirst({
        where: { id, companyId: user.companyId },
        include: {
          accounts: { include: { account: true } },
        },
      })

      if (!post) {
        res.status(404).json({ message: 'Post not found' })
        return
      }

      if (!post.externalPostId) {
        res.status(400).json({
          message: 'This post has no Facebook Graph post id yet',
        })
        return
      }

      const facebookAccountIds = post.accounts
        .filter((item) => item.account.platform === PLATFORM_FACEBOOK)
        .map((item) => item.accountId)

      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          companyId: user.companyId,
          platform: PLATFORM_FACEBOOK,
          isConnected: true,
          ...(facebookAccountIds.length > 0
            ? { connectedAccountId: { in: facebookAccountIds } }
            : {}),
        },
      })

      if (!socialAccount) {
        res.status(404).json({
          message: 'No connected Facebook Page token available for this post',
        })
        return
      }

      let pageAccessToken: string
      try {
        pageAccessToken = decryptSecret(socialAccount.accessTokenEnc)
      } catch {
        res.status(500).json({ message: 'Stored Facebook token could not be decrypted' })
        return
      }

      try {
        const engagement = await fetchPostEngagement({
          postId: post.externalPostId,
          pageAccessToken,
        })
        const reactions = summarizeFacebookReactions(engagement)

        res.json({
          postId: post.id,
          externalPostId: post.externalPostId,
          pageId: socialAccount.pageId,
          pageName: socialAccount.pageName,
          message: engagement.message ?? post.caption,
          createdTime: engagement.created_time ?? null,
          permalinkUrl: engagement.permalink_url ?? null,
          fullPicture: engagement.full_picture ?? post.mediaUrl,
          reactionCount: engagement.reactions?.summary?.total_count ?? 0,
          shareCount: engagement.shares?.count ?? 0,
          reactions,
          commentCount: engagement.comments?.summary?.total_count ?? 0,
          comments: (engagement.comments?.data ?? []).map((comment) => ({
            id: comment.id,
            message: comment.message ?? '',
            createdTime: comment.created_time ?? null,
            fromName: comment.from?.name ?? 'Facebook user',
          })),
        })
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
                'Facebook token expired or revoked. Reconnect the Page in Connected Accounts.',
            })
            return
          }
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
