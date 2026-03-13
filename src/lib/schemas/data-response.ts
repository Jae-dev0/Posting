import { z } from 'zod'

/**
 * Creates a data response schema for a single item wrapped in { data: T }.
 * Matches Laravel's DataResponse structure.
 *
 * @param dataSchema - Zod schema for the data field
 * @returns Zod schema for { data: T } response
 *
 * @example
 * ```ts
 * const getUserResponseSchema = createDataResponseSchema(userSchema)
 * type GetUserResponse = z.infer<typeof getUserResponseSchema>
 * ```
 */
export const createDataResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T,
) => z.object({ data: dataSchema })

export type DataResponse<T> = {
  data: T
}
