import { z } from 'zod'

export const tiktokPublishSchema = z.object({
  socialAccountId: z.coerce.number().int().positive(),
  caption: z.string().max(2200).default(''),
  videoUrl: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.string().url().optional(),
  ),
  postId: z.coerce.number().int().positive().optional(),
})
