import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { facebookKeys } from './query-keys'

export const facebookPageSchema = z.object({
  id: z.number(),
  platform: z.literal('facebook'),
  pageId: z.string(),
  pageName: z.string(),
  facebookUserId: z.string().nullable(),
  isConnected: z.boolean(),
  tokenExpiresAt: z.string().nullable(),
  connectedAccountId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type FacebookPage = z.infer<typeof facebookPageSchema>

const facebookPagesSchema = z.array(facebookPageSchema)

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<FacebookPage[]> => {
  const res = await api.get('/api/social/facebook/pages', { signal })
  return facebookPagesSchema.parse(res.data)
}

export const useFacebookPages = (options?: {
  query?: Omit<UseQueryOptions<FacebookPage[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: facebookKeys.pages(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
