import { PostStatus, PublishMode, SocialPlatform } from '@prisma/client'
import { Router, type Response } from 'express'

import { env, getTikTokOAuthScopes, isTikTokConfigured } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import {
  buildTikTokOAuthUrl,
  exchangeTikTokCode,
  fetchTikTokCreatorInfo,
  fetchTikTokUser,
  publishTikTokVideo,
  refreshTikTokToken,
  revokeTikTokToken,
  TikTokApiError,
} from '../lib/tiktok-api.js'
import {
  signTikTokOAuthState,
  verifyTikTokOAuthState,
} from '../lib/tiktok-oauth-state.js'
import { decryptSecret, encryptSecret } from '../lib/token-crypto.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { tiktokVideoUpload } from '../middleware/tiktok-video-upload.js'
import { tiktokPublishSchema } from '../schemas/tiktok.js'

export const tiktokSocialRouter = Router()
const PLATFORM = SocialPlatform.tiktok

function requireCompanyContext(req: AuthenticatedRequest, res: Response) {
  if (!req.user?.companyId) {
    res.status(403).json({ message: 'Company context required' })
    return null
  }
  return req.user
}

function frontendRedirect(params: Record<string, string>) {
  const url = new URL('/posting/accounts', env.FRONTEND_URL)
  for (const [key, value] of Object.entries(params))
    url.searchParams.set(key, value)
  return url.toString()
}

function mapTikTokAccount(account: {
  id: number
  pageId: string
  pageName: string
  isConnected: boolean
  tokenExpiresAt: Date | null
  connectedAccountId: number | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: account.id,
    platform: 'tiktok' as const,
    openId: account.pageId,
    displayName: account.pageName,
    isConnected: account.isConnected,
    tokenExpiresAt: account.tokenExpiresAt?.toISOString() ?? null,
    connectedAccountId: account.connectedAccountId,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  }
}

async function getValidAccessToken(account: {
  id: number
  accessTokenEnc: string
  refreshTokenEnc: string | null
  tokenExpiresAt: Date | null
}) {
  const expiresSoon =
    !account.tokenExpiresAt ||
    account.tokenExpiresAt.getTime() <= Date.now() + 60_000
  if (!expiresSoon) return decryptSecret(account.accessTokenEnc)
  if (!account.refreshTokenEnc)
    throw new Error('TikTok account must be reconnected')

  const token = await refreshTikTokToken(decryptSecret(account.refreshTokenEnc))
  await prisma.socialAccount.update({
    where: { id: account.id },
    data: {
      accessTokenEnc: encryptSecret(token.access_token),
      refreshTokenEnc: encryptSecret(token.refresh_token),
      tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      isConnected: true,
    },
  })
  return token.access_token
}

tiktokSocialRouter.post(
  '/connect',
  requireAuth,
  (req: AuthenticatedRequest, res) => {
    const user = requireCompanyContext(req, res)
    if (!user) return
    if (!isTikTokConfigured()) {
      res.status(503).json({
        message:
          'TikTok is not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET on the API.',
      })
      return
    }

    const scopes = getTikTokOAuthScopes()
    const state = signTikTokOAuthState({
      userId: user.id,
      companyId: user.companyId,
    })
    res.json({
      authUrl: buildTikTokOAuthUrl(state, scopes),
      redirectUri: env.TIKTOK_REDIRECT_URI,
      scopes,
    })
  },
)

tiktokSocialRouter.get('/callback', async (req, res) => {
  const code = typeof req.query.code === 'string' ? req.query.code : ''
  const stateToken = typeof req.query.state === 'string' ? req.query.state : ''
  const oauthError = typeof req.query.error === 'string' ? req.query.error : ''
  if (oauthError) {
    res.redirect(frontendRedirect({ tiktok: 'error', reason: oauthError }))
    return
  }

  try {
    if (!code || !stateToken) throw new Error('missing_code_or_state')
    const state = verifyTikTokOAuthState(stateToken)
    const token = await exchangeTikTokCode(code)
    const user = await fetchTikTokUser(token.access_token)

    const connected = await prisma.connectedAccount.upsert({
      where: {
        companyId_platform_handle: {
          companyId: state.companyId,
          platform: PLATFORM,
          handle: user.open_id,
        },
      },
      create: {
        companyId: state.companyId,
        platform: PLATFORM,
        accountName: user.display_name,
        handle: user.open_id,
      },
      update: { accountName: user.display_name, isConnected: true },
    })

    await prisma.socialAccount.upsert({
      where: {
        companyId_platform_pageId: {
          companyId: state.companyId,
          platform: PLATFORM,
          pageId: user.open_id,
        },
      },
      create: {
        companyId: state.companyId,
        connectedByUserId: state.userId,
        connectedAccountId: connected.id,
        platform: PLATFORM,
        pageId: user.open_id,
        pageName: user.display_name,
        accessTokenEnc: encryptSecret(token.access_token),
        refreshTokenEnc: encryptSecret(token.refresh_token),
        tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
      },
      update: {
        connectedByUserId: state.userId,
        connectedAccountId: connected.id,
        pageName: user.display_name,
        accessTokenEnc: encryptSecret(token.access_token),
        refreshTokenEnc: encryptSecret(token.refresh_token),
        tokenExpiresAt: new Date(Date.now() + token.expires_in * 1000),
        isConnected: true,
      },
    })

    res.redirect(frontendRedirect({ tiktok: 'connected' }))
  } catch (error) {
    const reason =
      error instanceof TikTokApiError
        ? (error.code ?? 'tiktok_api')
        : 'callback_failed'
    res.redirect(frontendRedirect({ tiktok: 'error', reason }))
  }
})

tiktokSocialRouter.get(
  '/accounts',
  requireAuth,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return
      const accounts = await prisma.socialAccount.findMany({
        where: { companyId: user.companyId, platform: PLATFORM },
        orderBy: { pageName: 'asc' },
      })
      res.json(accounts.map(mapTikTokAccount))
    } catch (error) {
      next(error)
    }
  },
)

tiktokSocialRouter.delete(
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
        where: { id, companyId: user.companyId, platform: PLATFORM },
      })
      if (!account) {
        res.status(404).json({ message: 'TikTok account not found' })
        return
      }
      try {
        await revokeTikTokToken(decryptSecret(account.accessTokenEnc))
      } catch {
        // Local disconnect must still succeed if TikTok has already expired/revoked the token.
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

tiktokSocialRouter.post(
  '/publish',
  requireAuth,
  tiktokVideoUpload.single('video'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const user = requireCompanyContext(req, res)
      if (!user) return
      const body = tiktokPublishSchema.parse(req.body)
      if (!req.file && !body.videoUrl) {
        res
          .status(400)
          .json({ message: 'A video file or video URL is required' })
        return
      }
      const account = await prisma.socialAccount.findFirst({
        where: {
          id: body.socialAccountId,
          companyId: user.companyId,
          platform: PLATFORM,
          isConnected: true,
        },
      })
      if (!account) {
        res
          .status(404)
          .json({ message: 'TikTok account not found for this company' })
        return
      }

      const accessToken = await getValidAccessToken(account)
      const creator = await fetchTikTokCreatorInfo(accessToken)
      if (!creator.privacy_level_options.includes('SELF_ONLY')) {
        res
          .status(409)
          .json({
            message:
              'This TikTok account does not currently allow private Direct Posts',
          })
        return
      }
      const publishId = await publishTikTokVideo({
        accessToken,
        title: body.caption,
        videoUrl: body.videoUrl,
        video: req.file
          ? { buffer: req.file.buffer, mimetype: req.file.mimetype }
          : undefined,
      })

      const post = body.postId
        ? await prisma.post.update({
            where: { id: body.postId, companyId: user.companyId },
            data: {
              status: PostStatus.published,
              publishedAt: new Date(),
              externalPostId: publishId,
              publishError: null,
            },
          })
        : await prisma.post.create({
            data: {
              companyId: user.companyId,
              createdById: user.id,
              caption: body.caption,
              mediaUrl: body.videoUrl ?? null,
              mediaType: 'video',
              publishMode: PublishMode.now,
              status: PostStatus.published,
              publishedAt: new Date(),
              externalPostId: publishId,
              accounts: account.connectedAccountId
                ? { create: [{ accountId: account.connectedAccountId }] }
                : undefined,
            },
          })

      res.status(201).json({
        id: post.id,
        externalPostId: publishId,
        socialAccountId: account.id,
        displayName: account.pageName,
        status: post.status,
        publishedAt: post.publishedAt?.toISOString() ?? null,
      })
    } catch (error) {
      next(error)
    }
  },
)
