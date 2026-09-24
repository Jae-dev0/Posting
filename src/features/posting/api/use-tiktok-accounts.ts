import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { tiktokKeys } from './query-keys'

export const tiktokAccountSchema = z.object({
  id: z.number(),
  platform: z.literal('tiktok'),
  openId: z.string(),
  displayName: z.string(),
  isConnected: z.boolean(),
  tokenExpiresAt: z.string().nullable(),
  connectedAccountId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type TikTokAccount = z.infer<typeof tiktokAccountSchema>
const tiktokAccountsSchema = z.array(tiktokAccountSchema)

const queryFn = async ({ signal }: { signal?: AbortSignal } = {}) => {
  const res = await api.get('/api/social/tiktok/accounts', { signal })
  return tiktokAccountsSchema.parse(res.data)
}

export const useTikTokAccounts = (options?: {
  query?: Omit<UseQueryOptions<TikTokAccount[]>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: tiktokKeys.accounts(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
