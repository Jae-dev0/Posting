import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { userKeys } from './query-keys'

export const managedUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  fullname: z.string(),
  username: z.string(),
  role: z.enum(['main_admin', 'admin']),
  companyId: z.number().optional(),
  createdAt: z.string(),
})

export type ManagedUser = z.infer<typeof managedUserSchema>

const managedUsersSchema = z.array(managedUserSchema)

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<ManagedUser[]> => {
  const res = await api.get('/api/users', { signal })
  return managedUsersSchema.parse(res.data)
}

export const useListUsers = (options?: {
  query?: Omit<UseQueryOptions<ManagedUser[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: userKeys.list(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
