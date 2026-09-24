import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { platformKeys } from './query-keys'

export const permissionCatalogSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
})

export type PermissionCatalogItem = z.infer<typeof permissionCatalogSchema>

const permissionsQueryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<PermissionCatalogItem[]> => {
  const res = await api.get('/api/roles/permissions', { signal })
  return z.array(permissionCatalogSchema).parse(res.data)
}

export const useListPermissions = (options?: {
  query?: Omit<UseQueryOptions<PermissionCatalogItem[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.permissions(),
    queryFn: ({ signal }) => permissionsQueryFn({ signal }),
  })
}
