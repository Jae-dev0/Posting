import { z } from 'zod'

export const socialPlatformSchema = z.enum(['facebook', 'instagram', 'tiktok'])
export const mediaTypeSchema = z.enum(['image', 'video'])
export const publishModeSchema = z.enum(['now', 'schedule', 'draft'])

export const createAccountSchema = z.object({
  platform: socialPlatformSchema,
  accountName: z.string().min(1).max(120),
  handle: z.string().min(1).max(120),
  isConnected: z.boolean().optional().default(true),
})

export const updateAccountSchema = z
  .object({
    accountName: z.string().min(1).max(120).optional(),
    handle: z.string().min(1).max(120).optional(),
    isConnected: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })

export const createPostSchema = z
  .object({
    caption: z.string().min(1).max(2200),
    mediaUrl: z.string().url().nullable().optional(),
    mediaType: mediaTypeSchema.nullable().optional(),
    selectedAccountIds: z.array(z.number().int().positive()).min(1),
    publishMode: publishModeSchema,
    scheduledAt: z.string().datetime().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.publishMode === 'schedule' && !value.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledAt'],
        message: 'scheduledAt is required when publishMode is schedule',
      })
    }
  })
