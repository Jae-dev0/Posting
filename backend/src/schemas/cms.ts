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
  key: z.string().trim().min(1).max(100),
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
