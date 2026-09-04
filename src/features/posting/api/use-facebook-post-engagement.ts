import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { facebookKeys } from './query-keys'

export const facebookReactionBreakdownSchema = z.object({
  like: z.number(),
  love: z.number(),
  care: z.number(),
  haha: z.number(),
  wow: z.number(),
  sad: z.number(),
  angry: z.number(),
})

export const facebookEngagementSchema = z.object({
  postId: z.number(),
  externalPostId: z.string(),
  pageId: z.string(),
  pageName: z.string(),
  message: z.string(),
  createdTime: z.string().nullable(),
  permalinkUrl: z.string().nullable(),
  fullPicture: z.string().nullable().optional(),
  reactionCount: z.number(),
  shareCount: z.number().optional().default(0),
  reactions: facebookReactionBreakdownSchema.optional().default({
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  }),
  commentCount: z.number(),
  comments: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      createdTime: z.string().nullable(),
      fromName: z.string(),
    }),
  ),
})

export type FacebookEngagement = z.infer<typeof facebookEngagementSchema>
export type FacebookReactionBreakdown = z.infer<
  typeof facebookReactionBreakdownSchema
>

const queryFn = async (
  postId: number,
  { signal }: { signal?: AbortSignal } = {},
): Promise<FacebookEngagement> => {
  const res = await api.get(`/api/social/facebook/posts/${postId}/engagement`, {
    signal,
  })
  return facebookEngagementSchema.parse(res.data)
}

export const useFacebookPostEngagement = (
  postId: number | null,
  options?: {
    query?: Omit<UseQueryOptions<FacebookEngagement>, 'queryKey' | 'queryFn'>
  },
) => {
  return useQuery({
    ...options?.query,
    queryKey: facebookKeys.engagement(postId ?? 0),
    queryFn: ({ signal }) => queryFn(postId!, { signal }),
    enabled: postId !== null && (options?.query?.enabled ?? true),
  })
}
