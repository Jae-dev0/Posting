/**
 * A unique identifier for a model.
 */
export type ID = number

/**
 * ISO 8601 format string
 */
export type Timestamp = string

export type Status = 'pending' | 'error' | 'success'

export const GenderEnum = {
  Male: 'male',
  Female: 'female',
  Other: 'other',
} as const
export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum]
