import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { analyticsKeys } from './query-keys'

export const analyticsSummarySchema = z.object({
  postsPublishedThisWeek: z.number(),
  postsPublishedThisMonth: z.number(),
  failedPublishCount: z.number(),
  scheduledCount: z.number(),
  draftCount: z.number(),
  pendingApprovalCount: z.number(),
  publishedWithEngagementAvailable: z.number(),
  publishingTrend: z
    .array(
      z.object({
        date: z.string(),
        count: z.number(),
      }),
    )
    .default([]),
  accountHealth: z.array(
    z.object({
      id: z.number(),
      platform: z.string(),
      pageName: z.string(),
      isConnected: z.boolean(),
      tokenExpiresAt: z.string().nullable(),
      health: z.enum(['healthy', 'expiring_soon', 'expired', 'disconnected']),
    }),
  ),
  recentActivity: z.array(
    z.object({
      id: z.number(),
      action: z.string(),
      entityType: z.string(),
      entityId: z.number().nullable(),
      summary: z.string(),
      createdAt: z.string(),
      user: z
        .object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        })
        .nullable(),
    }),
  ),
})

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<AnalyticsSummary> => {
  const res = await api.get('/api/analytics/summary', { signal })
  return analyticsSummarySchema.parse(res.data)
}

export const useAnalyticsSummary = (options?: {
  query?: Omit<UseQueryOptions<AnalyticsSummary>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: analyticsKeys.summary(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
