import { z } from 'zod'

/**
 * Zod schema for Laravel pagination links.
 * All fields are always present; prev/next are null on first/last pages.
 */
export const paginationLinksSchema = z.object({
  first: z.string(),
  last: z.string(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
})

export type PaginationLinks = z.infer<typeof paginationLinksSchema>

/**
 * Zod schema for Laravel pagination meta.
 * All fields are always present; from/to are null when no results.
 */
export const paginationMetaSchema = z.object({
  current_page: z.number(),
  from: z.number().nullable(),
  last_page: z.number(),
  per_page: z.number(),
  to: z.number().nullable(),
  total: z.number(),
})

export type PaginationMeta = z.infer<typeof paginationMetaSchema>

/**
 * Creates a paginated response schema for a given item schema.
 * Matches Laravel's default pagination response structure.
 *
 * @param itemSchema - Zod schema for individual items in the data array
 * @returns Zod schema for paginated response
 *
 * @example
 * ```ts
 * const listUsersResponseSchema = createPaginatedResponseSchema(userSchema)
 * type ListUsersResponse = z.infer<typeof listUsersResponseSchema>
 * ```
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    links: paginationLinksSchema,
    meta: paginationMetaSchema,
  })

export type PaginatedResponse<T> = {
  data: T[]
  links: PaginationLinks
  meta: PaginationMeta
}
