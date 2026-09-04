import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { instagramKeys } from './query-keys'

const instagramPostSchema = z.object({
  id: z.number(),
  caption: z.string(),
  mediaUrl: z.string().nullable(),
  status: z.string(),
  externalPostId: z.string().nullable(),
  publishError: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  platforms: z.array(z.string()),
})

export type InstagramPost = z.infer<typeof instagramPostSchema>

const instagramPostsSchema = z.array(instagramPostSchema)

export const useInstagramPosts = (options?: {
  query?: Omit<UseQueryOptions<InstagramPost[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: instagramKeys.posts(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/social/instagram/posts', { signal })
      return instagramPostsSchema.parse(res.data)
    },
  })
}
