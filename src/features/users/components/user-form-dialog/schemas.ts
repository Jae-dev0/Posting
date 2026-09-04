import { z } from 'zod'

import { USER_ROLE } from '../../constants'

const baseUserFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  role: z.enum([USER_ROLE.MAIN_ADMIN, USER_ROLE.ADMIN]),
  password: z.string(),
  confirmPassword: z.string(),
})

export const userFormSchema = baseUserFormSchema.superRefine((value, ctx) => {
  const hasPassword = value.password.length > 0
  const hasConfirmPassword = value.confirmPassword.length > 0

  if (!hasPassword && !hasConfirmPassword) {
    return
  }

  if (value.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Password must be at least 8 characters',
      path: ['password'],
    })
  }

  if (value.password !== value.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
  }
})

export const createUserFormSchema = baseUserFormSchema
  .extend({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type UserFormValues = z.infer<typeof baseUserFormSchema>
