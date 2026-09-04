import { z } from 'zod'

export const rolesFormSchemas = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Role name is required')
    .max(64)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Use lowercase letters, numbers, and underscores (e.g. content_editor)',
    ),
  description: z.string().trim().min(1, 'Description is required').max(500),
  scope: z.enum(['platform', 'company']),
})

export type RoleFormValues = z.infer<typeof rolesFormSchemas>
