import { Router } from 'express'

import { writeAuditLog } from '../lib/audit.js'
import { canAccessWebsite, getAccessibleWebsiteIds } from '../lib/cms-access.js'
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

async function resolveWebsite(
  req: AuthenticatedRequest,
  websiteId: number,
) {
  const companyId = req.tenantCompanyId!
  const website = await prisma.website.findFirst({ where: { id: websiteId, companyId } })
  if (!website || !(await canAccessWebsite(req, companyId, websiteId))) return null
  return website
}

async function websiteWhere(req: AuthenticatedRequest) {
  const companyId = req.tenantCompanyId!
  const ids = await getAccessibleWebsiteIds(req, companyId)
  return ids === null ? { companyId } : { companyId, websiteId: { in: ids } }
}

cmsRouter.get(
  '/websites',
  requirePermission('website.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const ids = await getAccessibleWebsiteIds(req, req.tenantCompanyId!)
      const websites = await prisma.website.findMany({
        where: ids === null ? { companyId: req.tenantCompanyId } : { companyId: req.tenantCompanyId, id: { in: ids } },
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
  requirePermission('page.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const pages = await prisma.page.findMany({
        where: await websiteWhere(req),
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
  requirePermission('page.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createPageSchema.parse(req.body)
      const website = await resolveWebsite(req, body.websiteId)
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
  requirePermission('page.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const page = await prisma.page.findFirst({
        where: { ...(await websiteWhere(req)), id },
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
  requirePermission('page.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = updatePageSchema.parse(req.body)
      const existing = await prisma.page.findFirst({
        where: { ...(await websiteWhere(req)), id },
      })
      if (!existing) {
        res.status(404).json({ message: 'Page not found' })
        return
      }

      if (body.status === 'published') {
        const canPublish = req.user?.isSuperAdmin ||
          req.user?.permissions.includes('page.publish')
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
  requirePermission('page.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const existing = await prisma.page.findFirst({
        where: { ...(await websiteWhere(req)), id },
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
  requirePermission('media.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const media = await prisma.cmsMedia.findMany({
        where: await websiteWhere(req),
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
  requirePermission('media.upload'),
  facebookImageUpload.single('image'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const file = req.file
      if (!file) {
        res.status(400).json({ message: 'Image file is required' })
        return
      }

      const websiteId = Number(req.body.websiteId)
      if (!Number.isInteger(websiteId)) {
        res.status(400).json({ message: 'websiteId is required' })
        return
      }
      const website = await resolveWebsite(req, websiteId)
      if (!website) {
        res.status(404).json({ message: 'Website not found or not assigned' })
        return
      }
      const filename = await savePublicMediaFile({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      })
      const url = getPublicMediaUrl(filename)

      const media = await prisma.cmsMedia.create({
        data: {
          companyId: req.tenantCompanyId!,
          websiteId: website.id,
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
      const websiteId = Number(req.query.websiteId)
      if (!Number.isInteger(websiteId)) { res.status(400).json({ message: 'websiteId is required' }); return }
      const website = await resolveWebsite(req, websiteId)
      if (!website) { res.status(404).json({ message: 'Website not found or not assigned' }); return }
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
      const website = await resolveWebsite(req, body.websiteId)
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
  requirePermission('navigation.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const items = await prisma.navigationItem.findMany({
        where: await websiteWhere(req),
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
  requirePermission('navigation.create'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const body = createNavigationSchema.parse(req.body)
      const website = await resolveWebsite(req, body.websiteId)
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
  requirePermission('navigation.edit'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const body = updateNavigationSchema.parse(req.body)
      const existing = await prisma.navigationItem.findFirst({
        where: { ...(await websiteWhere(req)), id },
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
  requirePermission('navigation.delete'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const id = Number(req.params.id)
      const existing = await prisma.navigationItem.findFirst({
        where: { ...(await websiteWhere(req)), id },
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
  requirePermission('page.view'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const companyId = req.tenantCompanyId!
      const accessibleWebsiteIds = await getAccessibleWebsiteIds(req, companyId)
      const websiteScope = accessibleWebsiteIds === null ? {} : { websiteId: { in: accessibleWebsiteIds } }
      const [pages, published, media, recent] = await Promise.all([
        prisma.page.count({ where: { companyId, ...websiteScope } }),
        prisma.page.count({ where: { companyId, status: 'published', ...websiteScope } }),
        prisma.cmsMedia.count({ where: { companyId, ...websiteScope } }),
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
