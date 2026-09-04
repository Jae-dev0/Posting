import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { postKeys } from './query-keys'

export const cmsPostSchema = z.object({
  id: z.number(),
  caption: z.string(),
  mediaUrl: z.string().nullable(),
  mediaType: z.enum(['image', 'video']).nullable().optional(),
  publishMode: z.enum(['now', 'schedule', 'draft']).optional(),
  status: z.string(),
  scheduledAt: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  selectedAccountIds: z.array(z.number()).optional(),
  platforms: z.array(z.string()),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type CmsPost = z.infer<typeof cmsPostSchema>

const cmsPostsSchema = z.array(cmsPostSchema)

export type PostListStatus =
  | 'published'
  | 'scheduled'
  | 'draft'
  | 'pending_approval'
  | 'calendar'
  | 'all'

const queryFn = async ({
  status,
  signal,
}: {
  status?: PostListStatus
  signal?: AbortSignal
}): Promise<CmsPost[]> => {
  const params =
    status && status !== 'all' ? { status } : undefined
  const res = await api.get('/api/posts', { params, signal })
  return cmsPostsSchema.parse(res.data)
}

export const usePosts = (
  status?: PostListStatus,
  options?: {
    query?: Omit<UseQueryOptions<CmsPost[]>, 'queryKey' | 'queryFn'>
  },
) => {
  return useQuery({
    ...options?.query,
    queryKey: postKeys.list(status),
    queryFn: ({ signal }) => queryFn({ status, signal }),
  })
}
