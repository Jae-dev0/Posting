import { z } from 'zod'

export const userRoleSchema = z.enum(['main_admin', 'admin'])

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: userRoleSchema.default('admin'),
})

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80).optional(),
    lastName: z.string().trim().min(1).max(80).optional(),
    email: z.string().trim().email().max(255).optional(),
    password: z.string().min(8).max(128).optional(),
    role: userRoleSchema.optional(),
  })
  .refine(
    (value) =>
      value.firstName !== undefined ||
      value.lastName !== undefined ||
      value.email !== undefined ||
      value.password !== undefined ||
      value.role !== undefined,
    { message: 'At least one field is required' },
  )
