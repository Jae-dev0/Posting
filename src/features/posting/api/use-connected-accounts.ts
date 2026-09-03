import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

export const connectedAccountSchema = z.object({
  id: z.number(),
  platform: z.enum(['facebook', 'instagram', 'tiktok']),
  accountName: z.string(),
  handle: z.string(),
  isConnected: z.boolean(),
})

export type ApiConnectedAccount = z.infer<typeof connectedAccountSchema>

const connectedAccountsSchema = z.array(connectedAccountSchema)

export const accountKeys = {
  all: ['accounts'] as const,
  list: () => [...accountKeys.all, 'list'] as const,
}

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<ApiConnectedAccount[]> => {
  const res = await api.get('/api/accounts', { signal })
  return connectedAccountsSchema.parse(res.data)
}

export const useConnectedAccounts = (options?: {
  query?: Omit<UseQueryOptions<ApiConnectedAccount[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: accountKeys.list(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
