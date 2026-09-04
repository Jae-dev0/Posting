import { z } from 'zod'

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullname: z.string(),
  username: z.string(),
  role: z.enum(['main_admin', 'admin']),
  companyId: z.number(),
  createdAt: z.string(),
})

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  user: authUserSchema,
})

export const loginFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
