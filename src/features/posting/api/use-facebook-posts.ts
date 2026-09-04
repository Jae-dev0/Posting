import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { facebookKeys } from './query-keys'

export const facebookCmsPostSchema = z.object({
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

export type FacebookCmsPost = z.infer<typeof facebookCmsPostSchema>

const facebookCmsPostsSchema = z.array(facebookCmsPostSchema)

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<FacebookCmsPost[]> => {
  const res = await api.get('/api/social/facebook/posts', { signal })
  return facebookCmsPostsSchema.parse(res.data)
}

export const useFacebookPosts = (options?: {
  query?: Omit<UseQueryOptions<FacebookCmsPost[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: facebookKeys.posts(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
