import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { instagramKeys } from './query-keys'

const instagramEngagementSchema = z.object({
  postId: z.number(),
  externalPostId: z.string(),
  caption: z.string(),
  mediaType: z.string().nullable(),
  mediaUrl: z.string().nullable(),
  permalink: z.string().nullable(),
  timestamp: z.string().nullable(),
  likeCount: z.number(),
  commentsCount: z.number(),
  comments: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      timestamp: z.string().nullable(),
      username: z.string().nullable(),
    }),
  ),
})

export type InstagramEngagement = z.infer<typeof instagramEngagementSchema>

export const useInstagramPostEngagement = (
  postId: number | null,
  options?: {
    query?: Omit<UseQueryOptions<InstagramEngagement>, 'queryKey' | 'queryFn'>
  },
) => {
  return useQuery({
    ...options?.query,
    queryKey: instagramKeys.engagement(postId ?? 0),
    enabled: postId !== null && (options?.query?.enabled ?? true),
    queryFn: async ({ signal }) => {
      const res = await api.get(
        `/api/social/instagram/posts/${postId}/engagement`,
        { signal },
      )
      return instagramEngagementSchema.parse(res.data)
    },
  })
}
