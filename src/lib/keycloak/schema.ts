import { z } from 'zod/v4'

import type { TokenState } from './context'

export const tokenParsedSchema = z.object({
  sub: z.string(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string(),
  email_verified: z.boolean(),
  preferred_username: z.string(),
  employee_number: z.string(),
  company_id: z.int(),
  company_active_id: z.int(),
  azp: z.string(),
  scope: z.string(),
})

/**
 * Validates the parsed Keycloak token and returns a TokenState.
 * Use this for consistent validation in provider and anywhere token shape is checked.
 */
export function validateTokenParsed(input: unknown): TokenState {
  const result = tokenParsedSchema.safeParse(input)
  if (result.success) {
    return { isValid: true, missingFields: [] }
  }
  const missingFields: string[] = result.error.issues
    .filter((issue) => issue.code === 'invalid_type')
    .map((issue) => issue.path.join('.'))
  return { isValid: false, missingFields }
}
