import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().trim().min(1).max(200),
  domain: z.string().trim().max(255).optional().nullable(),
  status: z.enum(['active', 'disabled']).default('active'),
  admin: z
    .object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      email: z.string().trim().email(),
      password: z.string().min(8),
    })
    .optional(),
  websiteName: z.string().trim().min(1).max(200).optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  domain: z.string().trim().max(255).optional().nullable(),
  status: z.enum(['active', 'disabled']).optional(),
})

export const assignCompanyAdminSchema = z.object({
  userId: z.number().int().positive(),
})
