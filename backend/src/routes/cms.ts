import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import {
  getPublicMediaUrl,
  savePublicMediaFile,
} from '../lib/media-store.js'
import { prisma } from '../lib/prisma.js'
import {
  requireAuth,
  requirePermission,
  requireTenantCompany,
  resolveTenantScope,
  type AuthenticatedRequest,
} from '../middleware/auth.js'
import { facebookImageUpload } from '../middleware/facebook-image-upload.js'
import {
  createNavigationSchema,
  createPageSchema,
  updateNavigationSchema,
  updatePageSchema,
  upsertSettingSchema,
} from '../schemas/cms.js'

export const cmsRouter = Router()

cmsRouter.use(requireAuth, resolveTenantScope(), requireTenantCompany)

async function getPrimaryWebsite(companyId: number) {
  return prisma.website.findFirst({
    where: { companyId, isPrimary: true },
    orderBy: { id: 'asc' },
  })
}

async function resolveWebsiteId(companyId: number, websiteId?: number) {
  if (websiteId) {
    const website = await prisma.website.findFirst({
      where: { id: websiteId, companyId },
    })
    return website
  }
  return getPrimaryWebsite(companyId)
}

cmsRouter.get(
  '/websites',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const websites = await prisma.website.findMany({
        where: { companyId: req.tenantCompanyId },
        orderBy: [{ isPrimary: 'desc' }, { id: 'asc' }],
      })
      res.json(websites)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/pages',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const pages = await prisma.page.findMany({
        where: { companyId: req.tenantCompanyId },
        orderBy: { updatedAt: 'desc' },
      })
      res.json(
        pages.map((page) => ({
          ...page,
          createdAt: page.createdAt.toISOString(),
          updatedAt: page.updatedAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.post(
  '/pages',
  requirePermission('cms.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createPageSchema.parse(req.body)
      const website = await resolveWebsiteId(
        req.tenantCompanyId!,
        body.websiteId,
      )
      if (!website) {
        res.status(404).json({ message: 'Website not found for company' })
        return
      }

      const page = await prisma.page.create({
        data: {
          companyId: req.tenantCompanyId!,
          websiteId: website.id,
          title: body.title,
          slug: body.slug,
          content: body.content,
          status: body.status,
          createdById: req.user?.id,
          updatedById: req.user?.id,
        },
      })

      await writeAuditLog({
        companyId: req.tenantCompanyId!,
        userId: req.user?.id,
        action: 'page.created',
        entityType: 'page',
        entityId: page.id,
        summary: `Created page "${page.title}"`,
      })

      res.status(201).json({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/pages/:id',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const page = await prisma.page.findFirst({
        where: { id, companyId: req.tenantCompanyId },
        include: { sections: { orderBy: { sortOrder: 'asc' } } },
      })
      if (!page) {
        res.status(404).json({ message: 'Page not found' })
        return
      }
      res.json({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.patch(
  '/pages/:id',
  requirePermission('cms.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = updatePageSchema.parse(req.body)
      const existing = await prisma.page.findFirst({
        where: { id, companyId: req.tenantCompanyId },
      })
      if (!existing) {
        res.status(404).json({ message: 'Page not found' })
        return
      }

      if (body.status === 'published') {
        const canPublish = req.user?.isSuperAdmin ||
          req.user?.permissions.includes('cms.publish')
        if (!canPublish) {
          res.status(403).json({ message: 'Publish permission required' })
          return
        }
      }

      const page = await prisma.page.update({
        where: { id },
        data: {
          ...(body.title != null ? { title: body.title } : {}),
          ...(body.slug != null ? { slug: body.slug } : {}),
          ...(body.content != null ? { content: body.content } : {}),
          ...(body.status != null ? { status: body.status } : {}),
          updatedById: req.user?.id,
        },
      })

      await writeAuditLog({
        companyId: req.tenantCompanyId!,
        userId: req.user?.id,
        action: 'page.updated',
        entityType: 'page',
        entityId: page.id,
        summary: `Updated page "${page.title}"`,
      })

      res.json({
        ...page,
        createdAt: page.createdAt.toISOString(),
        updatedAt: page.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.delete(
  '/pages/:id',
  requirePermission('cms.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const existing = await prisma.page.findFirst({
        where: { id, companyId: req.tenantCompanyId },
      })
      if (!existing) {
        res.status(404).json({ message: 'Page not found' })
        return
      }

      await prisma.page.delete({ where: { id } })
      await writeAuditLog({
        companyId: req.tenantCompanyId!,
        userId: req.user?.id,
        action: 'page.deleted',
        entityType: 'page',
        entityId: id,
        summary: `Deleted page "${existing.title}"`,
      })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/media',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const media = await prisma.cmsMedia.findMany({
        where: { companyId: req.tenantCompanyId },
        orderBy: { createdAt: 'desc' },
      })
      res.json(
        media.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
        })),
      )
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.post(
  '/media/upload',
  requirePermission('cms.create'),
  facebookImageUpload.single('image'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const file = req.file
      if (!file) {
        res.status(400).json({ message: 'Image file is required' })
        return
      }

      const website = await getPrimaryWebsite(req.tenantCompanyId!)
      const filename = await savePublicMediaFile({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      })
      const url = getPublicMediaUrl(filename)

      const media = await prisma.cmsMedia.create({
        data: {
          companyId: req.tenantCompanyId!,
          websiteId: website?.id ?? null,
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          url,
          uploadedById: req.user?.id,
        },
      })

      await writeAuditLog({
        companyId: req.tenantCompanyId!,
        userId: req.user?.id,
        action: 'media.uploaded',
        entityType: 'cms_media',
        entityId: media.id,
        summary: `Uploaded media "${file.originalname}"`,
      })

      res.status(201).json({
        ...media,
        createdAt: media.createdAt.toISOString(),
        updatedAt: media.updatedAt.toISOString(),
      })
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/settings',
  requirePermission('settings.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const website = await getPrimaryWebsite(req.tenantCompanyId!)
      if (!website) {
        res.json([])
        return
      }
      const settings = await prisma.websiteSetting.findMany({
        where: { companyId: req.tenantCompanyId, websiteId: website.id },
        orderBy: { key: 'asc' },
      })
      res.json(settings)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.put(
  '/settings',
  requirePermission('settings.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = upsertSettingSchema.parse(req.body)
      const website = await resolveWebsiteId(
        req.tenantCompanyId!,
        body.websiteId,
      )
      if (!website) {
        res.status(404).json({ message: 'Website not found for company' })
        return
      }

      const setting = await prisma.websiteSetting.upsert({
        where: {
          websiteId_key: { websiteId: website.id, key: body.key },
        },
        create: {
          companyId: req.tenantCompanyId!,
          websiteId: website.id,
          key: body.key,
          value: body.value,
        },
        update: { value: body.value },
      })

      await writeAuditLog({
        companyId: req.tenantCompanyId!,
        userId: req.user?.id,
        action: 'settings.updated',
        entityType: 'website_setting',
        entityId: setting.id,
        summary: `Updated setting "${setting.key}"`,
      })

      res.json(setting)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/navigation',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const items = await prisma.navigationItem.findMany({
        where: { companyId: req.tenantCompanyId },
        orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      })
      res.json(items)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.post(
  '/navigation',
  requirePermission('cms.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createNavigationSchema.parse(req.body)
      const website = await resolveWebsiteId(
        req.tenantCompanyId!,
        body.websiteId,
      )
      if (!website) {
        res.status(404).json({ message: 'Website not found for company' })
        return
      }

      const item = await prisma.navigationItem.create({
        data: {
          companyId: req.tenantCompanyId!,
          websiteId: website.id,
          label: body.label,
          href: body.href,
          sortOrder: body.sortOrder,
          parentId: body.parentId ?? null,
        },
      })
      res.status(201).json(item)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.patch(
  '/navigation/:id',
  requirePermission('cms.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = updateNavigationSchema.parse(req.body)
      const existing = await prisma.navigationItem.findFirst({
        where: { id, companyId: req.tenantCompanyId },
      })
      if (!existing) {
        res.status(404).json({ message: 'Navigation item not found' })
        return
      }

      const item = await prisma.navigationItem.update({
        where: { id },
        data: {
          ...(body.label != null ? { label: body.label } : {}),
          ...(body.href != null ? { href: body.href } : {}),
          ...(body.sortOrder != null ? { sortOrder: body.sortOrder } : {}),
          ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
        },
      })
      res.json(item)
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.delete(
  '/navigation/:id',
  requirePermission('cms.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const existing = await prisma.navigationItem.findFirst({
        where: { id, companyId: req.tenantCompanyId },
      })
      if (!existing) {
        res.status(404).json({ message: 'Navigation item not found' })
        return
      }
      await prisma.navigationItem.delete({ where: { id } })
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  },
)

cmsRouter.get(
  '/dashboard',
  requirePermission('cms.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const [pages, published, media, recent] = await Promise.all([
        prisma.page.count({ where: { companyId } }),
        prisma.page.count({ where: { companyId, status: 'published' } }),
        prisma.cmsMedia.count({ where: { companyId } }),
        prisma.auditLog.findMany({
          where: { companyId },
          take: 8,
          orderBy: { createdAt: 'desc' },
        }),
      ])

      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: { websites: { where: { isPrimary: true }, take: 1 } },
      })

      res.json({
        company: company
          ? {
              id: company.id,
              name: company.name,
              domain: company.domain,
              status: company.status,
              website: company.websites[0] ?? null,
            }
          : null,
        totals: { pages, published, media },
        recentActivity: recent.map((log) => ({
          id: log.id,
          action: log.action,
          summary: log.summary,
          createdAt: log.createdAt.toISOString(),
        })),
      })
    } catch (error) {
      next(error)
    }
  },
)
