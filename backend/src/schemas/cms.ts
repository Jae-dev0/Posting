import { z } from 'zod'

export const createPageSchema = z.object({
  websiteId: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  content: z.string().default(''),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export const updatePageSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const upsertSettingSchema = z.object({
  websiteId: z.number().int().positive(),
  key: z.string().trim().min(1).max(100).refine((key) => !key.startsWith('visual-editor:'), 'Reserved setting; use the visual editor'),
  value: z.string(),
})

export const createNavigationSchema = z.object({
  websiteId: z.number().int().positive(),
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(500),
  sortOrder: z.number().int().default(0),
  parentId: z.number().int().positive().optional().nullable(),
})

export const updateNavigationSchema = createNavigationSchema.partial()

export const updateSectionSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().optional(),
  content: z.string(),
  sortOrder: z.number().int().optional(),
})

export const reorderSectionsSchema = z.object({
  websiteId: z.number().int().positive(),
  pageId: z.number().int().positive().optional(),
  sections: z.array(
    z.object({
      id: z.number().int().positive(),
      sortOrder: z.number().int(),
    }),
  ),
})

export const externalSyncSchema = z.object({
  targetUrl: z.string().url().default('https://demo2.bookna.com/api/v1/content-sync'),
  apiKey: z.string().optional(),
  websiteId: z.number().int().positive().optional(),
  pageId: z.number().int().positive().optional(),
  payload: z.record(z.any()).optional(),
})

