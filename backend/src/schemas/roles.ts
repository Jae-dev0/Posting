import { z } from 'zod'

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Use lowercase letters, numbers, and underscores (e.g. content_editor)',
    ),
  description: z.string().trim().min(1).max(500),
  scope: z.enum(['platform', 'company']),
})

export const updateRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z][a-z0-9_]*$/)
    .optional(),
  description: z.string().trim().min(1).max(500).optional(),
  scope: z.enum(['platform', 'company']).optional(),
})

export const syncRolePermissionGrantsSchema = z
  .object({
    permissionIds: z.array(z.number().int().positive()).min(1),
    grants: z
      .array(
        z.object({
          roleId: z.number().int().positive(),
          permissionId: z.number().int().positive(),
          granted: z.boolean(),
        }),
      )
      .min(1),
  })
  .superRefine((body, context) => {
    const seen = new Set<string>()
    for (const grant of body.grants) {
      const key = `${grant.roleId}:${grant.permissionId}`
      if (seen.has(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate role permission grant',
        })
      }
      seen.add(key)
    }
  })
