import { z } from 'zod'

const accountFields = {
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(255),
  roleIds: z.array(z.number().int().positive()).min(1),
  websiteAccessMode: z.enum(['all_websites', 'selected_websites']),
  websiteIds: z.array(z.number().int().positive()).default([]),
  status: z.enum(['active', 'disabled']).default('active'),
}

export const createCmsAccountSchema = z
  .object({ ...accountFields, password: z.string().min(8).max(128) })
  .superRefine((value, context) => {
    if (value.websiteAccessMode === 'selected_websites' && !value.websiteIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['websiteIds'],
        message: 'Select at least one website for selected website access',
      })
    }
  })

export const updateCmsAccountSchema = z
  .object({
    firstName: accountFields.firstName.optional(),
    lastName: accountFields.lastName.optional(),
    email: accountFields.email.optional(),
    password: z.string().min(8).max(128).optional(),
    roleIds: accountFields.roleIds.optional(),
    websiteAccessMode: accountFields.websiteAccessMode.optional(),
    websiteIds: accountFields.websiteIds.optional(),
    status: z.enum(['active', 'disabled']).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: 'At least one field is required',
  })
