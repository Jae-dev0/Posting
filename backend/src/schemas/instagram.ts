import { z } from 'zod'

const imageUrlListSchema = z.preprocess((value) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    try {
      return JSON.parse(trimmed) as unknown
    } catch {
      return [trimmed]
    }
  }
  return value
}, z.array(z.string().url()).max(10).optional().default([]))

export const instagramPublishSchema = z.object({
  socialAccountId: z.coerce.number().int().positive(),
  caption: z.string().trim().min(1).max(2200),
  /** @deprecated Prefer imageUrls */
  imageUrl: z
    .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
    .optional()
    .transform((value) => {
      if (!value) return null
      return value
    }),
  imageUrls: imageUrlListSchema,
  postId: z.coerce.number().int().positive().optional(),
})
