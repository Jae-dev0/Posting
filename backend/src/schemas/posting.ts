import { z } from 'zod'

export const socialPlatformSchema = z.enum(['facebook', 'instagram', 'tiktok'])
export const mediaTypeSchema = z.enum(['image', 'video'])
<<<<<<< HEAD
export const postMediaSchema = z.object({
  url: z.string().url(),
  type: mediaTypeSchema,
})
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
    caption: z.string().max(2200),
    media: z.array(postMediaSchema).max(10).optional().default([]),
    selectedAccountIds: z.array(z.number().int().positive()).default([]),
    publishMode: publishModeSchema,
    scheduledAt: z.string().datetime().nullable().optional(),
    /** When true, create as pending_approval instead of publishing immediately. */
    requireApproval: z.boolean().optional().default(false),
  })
  .superRefine((value, ctx) => {
    const hasVideo = value.media.some((item) => item.type === 'video')
    if (hasVideo && value.media.length !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['media'], message: 'A post can contain one video or up to ten images' })
    }
    if (!hasVideo && value.media.some((item) => item.type !== 'image')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['media'], message: 'Image galleries can contain images only' })
    }
=======
    caption: z.string().min(1).max(2200),
    mediaUrl: z.string().url().nullable().optional(),
    mediaType: mediaTypeSchema.nullable().optional(),
    selectedAccountIds: z.array(z.number().int().positive()).min(1),
    publishMode: publishModeSchema,
    scheduledAt: z.string().datetime().nullable().optional(),
  })
  .superRefine((value, ctx) => {
>>>>>>> origin/main
    if (value.publishMode === 'schedule' && !value.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['scheduledAt'],
        message: 'scheduledAt is required when publishMode is schedule',
      })
    }
<<<<<<< HEAD

    if (value.publishMode !== 'draft') {
      if (!value.caption.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['caption'],
          message: 'caption is required unless saving a draft',
        })
      }
      if (value.selectedAccountIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['selectedAccountIds'],
          message: 'Select at least one account unless saving a draft',
        })
      }
    }
  })

export const updatePostSchema = z
  .object({
    caption: z.string().max(2200).optional(),
    media: z.array(postMediaSchema).max(10).optional(),
    selectedAccountIds: z.array(z.number().int().positive()).optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
    action: z
      .enum([
        'reschedule',
        'cancel',
        'submit_for_approval',
        'approve',
        'reject_to_draft',
      ])
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  })
  .superRefine((value, ctx) => {
    if (!value.media) return
    const hasVideo = value.media.some((item) => item.type === 'video')
    if (hasVideo && value.media.length !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['media'], message: 'A post can contain one video or up to ten images' })
    }
=======
>>>>>>> origin/main
  })
