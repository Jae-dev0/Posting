import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { env } from '../config/env.js'
import { prisma } from '../lib/prisma.js'
import { canAccessWebsite } from '../lib/cms-access.js'
import {
  requireAuth,
  resolveTenantScope,
  requireTenantCompany,
  requirePermission,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import {
  EMPTY_VISUAL_STATE,
  VISUAL_SETTING_KEY,
  visualSaveSchema,
  visualStateSchema,
} from '../schemas/visual-editor.js'

export const visualEditorRouter = Router()
export const publicVisualRouter = Router()

// Public visitors receive only the published snapshot, never the draft.
publicVisualRouter.get('/', async (_req, res, next) => {
  try {
    const setting = await prisma.websiteSetting.findUnique({
      where: {
        websiteId_key: {
          websiteId: env.GENESIS_WEBSITE_ID,
          key: VISUAL_SETTING_KEY,
        },
      },
    })
    const state = setting
      ? visualStateSchema.parse(JSON.parse(setting.value))
      : EMPTY_VISUAL_STATE
    res.set('Access-Control-Allow-Origin', env.GENESIS_SITE_URL)
    res.set('Cache-Control', 'no-store')
    res.json({ document: state.published, publishedAt: state.publishedAt })
  } catch (error) {
    next(error)
  }
})

visualEditorRouter.use(requireAuth, resolveTenantScope(), requireTenantCompany)
visualEditorRouter.use(async (req: AuthenticatedRequest, res, next) => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: env.GENESIS_WEBSITE_ID, companyId: req.tenantCompanyId! },
    })
    if (
      !website ||
      !(await canAccessWebsite(req, req.tenantCompanyId!, website.id))
    ) {
      res
        .status(403)
        .json({
          message:
            'You do not have access to the Genesis website in this company.',
        })
      return
    }
    next()
  } catch (error) {
    next(error)
  }
})

visualEditorRouter.get(
  '/',
  requirePermission('page.view'),
  async (_req, res, next) => {
    try {
      const setting = await prisma.websiteSetting.findUnique({
        where: {
          websiteId_key: {
            websiteId: env.GENESIS_WEBSITE_ID,
            key: VISUAL_SETTING_KEY,
          },
        },
      })
      res.set('Cache-Control', 'no-store')
      res.json({
        ...(setting
          ? visualStateSchema.parse(JSON.parse(setting.value))
          : EMPTY_VISUAL_STATE),
        websiteId: env.GENESIS_WEBSITE_ID,
        siteUrl: env.GENESIS_SITE_URL,
      })
    } catch (error) {
      next(error)
    }
  },
)

for (const action of ['draft', 'publish'] as const) {
  visualEditorRouter.put(
    `/${action}`,
    requirePermission(action === 'publish' ? 'page.publish' : 'page.edit'),
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const body =
          action === 'draft'
            ? visualSaveSchema.parse(req.body)
            : z
                .object({ revision: z.number().int().nonnegative() })
                .strict()
                .parse(req.body)
        const state = await prisma.$transaction(
          async (tx) => {
            const where = {
              websiteId_key: {
                websiteId: env.GENESIS_WEBSITE_ID,
                key: VISUAL_SETTING_KEY,
              },
            }
            const setting = await tx.websiteSetting.findUnique({ where })
            const previous = setting
              ? visualStateSchema.parse(JSON.parse(setting.value))
              : EMPTY_VISUAL_STATE
            if (previous.revision !== body.revision)
              throw new Error('EDITOR_CONFLICT')
            if (action === 'publish' && !previous.draft)
              throw new Error('NO_DRAFT')
            const nextState = {
              ...previous,
              revision: previous.revision + 1,
              ...(action === 'draft' && 'document' in body
                ? { draft: body.document }
                : {
                    published: previous.draft,
                    publishedAt: new Date().toISOString(),
                  }),
            }
            await tx.websiteSetting.upsert({
              where,
              create: {
                companyId: req.tenantCompanyId!,
                websiteId: env.GENESIS_WEBSITE_ID,
                key: VISUAL_SETTING_KEY,
                value: JSON.stringify(nextState),
              },
              update: { value: JSON.stringify(nextState) },
            })
            await tx.auditLog.create({
              data: {
                companyId: req.tenantCompanyId!,
                userId: req.user?.id,
                action: `website.${action === 'publish' ? 'published' : 'draft_saved'}`,
                entityType: 'website',
                entityId: env.GENESIS_WEBSITE_ID,
                summary: `Genesis homepage ${action === 'publish' ? 'published' : 'draft saved'}`,
              },
            })
            return nextState
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
        res.json({
          ...state,
          websiteId: env.GENESIS_WEBSITE_ID,
          siteUrl: env.GENESIS_SITE_URL,
        })
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message === 'EDITOR_CONFLICT' ||
            ('code' in error &&
              ['P2034', 'P2002'].includes(String(error.code))))
        ) {
          res
            .status(409)
            .json({
              message:
                'Another editor saved changes. Reload the saved draft before saving again.',
            })
        } else if (error instanceof Error && error.message === 'NO_DRAFT') {
          res.status(400).json({ message: 'Save a draft before publishing.' })
        } else next(error)
      }
    },
  )
}
