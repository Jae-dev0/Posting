import { z } from 'zod'

const fieldId = z
  .string()
  .regex(/^[a-zA-Z0-9_.:-]+$/)
  .max(180)
export const visualDocumentSchema = z
  .object({
    values: z.record(fieldId, z.string().max(20000)),
    order: z
      .array(fieldId)
      .max(100)
      .refine((items) => new Set(items).size === items.length),
  })
  .strict()
  .superRefine(({ values }, ctx) => {
    for (const [id, value] of Object.entries(values)) {
      const kind = id.split('.').at(-1)
      if (!['src', 'poster', 'href'].includes(kind ?? '')) continue
      try {
        const url = new URL(value, 'https://demo2.bookna.com')
        const allowed = [
          'http:',
          'https:',
          ...(kind === 'href' ? ['mailto:', 'tel:'] : []),
        ]
        if (!allowed.includes(url.protocol)) throw new Error('Invalid protocol')
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['values', id],
          message:
            'Use an HTTP(S) URL or relative path; links may also use mailto or tel.',
        })
      }
    }
  })
export const visualStateSchema = z.object({
  revision: z.number().int().nonnegative(),
  draft: visualDocumentSchema.nullable(),
  published: visualDocumentSchema.nullable(),
  publishedAt: z.string().nullable(),
})
export const visualSaveSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    document: visualDocumentSchema,
  })
  .strict()
export const VISUAL_SETTING_KEY = 'visual-editor:home:v1'
export const EMPTY_VISUAL_STATE = {
  revision: 0,
  draft: null,
  published: null,
  publishedAt: null,
}
