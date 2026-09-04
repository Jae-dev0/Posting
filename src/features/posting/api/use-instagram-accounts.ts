import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { instagramKeys } from './query-keys'

export const instagramAccountSchema = z.object({
  id: z.number(),
  platform: z.literal('instagram'),
  pageId: z.string(),
  pageName: z.string(),
  facebookUserId: z.string().nullable(),
  isConnected: z.boolean(),
  tokenExpiresAt: z.string().nullable(),
  connectedAccountId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type InstagramAccount = z.infer<typeof instagramAccountSchema>

const instagramAccountsSchema = z.array(instagramAccountSchema)

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<InstagramAccount[]> => {
  const res = await api.get('/api/social/instagram/accounts', { signal })
  return instagramAccountsSchema.parse(res.data)
}

export const useInstagramAccounts = (options?: {
  query?: Omit<UseQueryOptions<InstagramAccount[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: instagramKeys.accounts(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
