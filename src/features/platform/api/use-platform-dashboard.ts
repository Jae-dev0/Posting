import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { platformKeys } from './query-keys'

export const platformDashboardSchema = z.object({
  totals: z.object({
    companies: z.number(),
    activeCompanies: z.number(),
    users: z.number(),
    websites: z.number(),
  }),
  systemStatus: z.string(),
  recentActivity: z.array(
    z.object({
      id: z.number(),
      action: z.string(),
      entityType: z.string(),
      entityId: z.number().nullable().optional(),
      summary: z.string(),
      createdAt: z.string(),
      company: z
        .object({ id: z.number(), name: z.string() })
        .nullable()
        .optional(),
      user: z
        .object({ id: z.number(), name: z.string(), email: z.string() })
        .nullable()
        .optional(),
    }),
  ),
  companyOverview: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      domain: z.string().nullable(),
      status: z.string(),
      userCount: z.number(),
      websiteCount: z.number(),
      updatedAt: z.string(),
    }),
  ),
})

export type PlatformDashboard = z.infer<typeof platformDashboardSchema>

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<PlatformDashboard> => {
  const res = await api.get('/api/platform/dashboard', { signal })
  return platformDashboardSchema.parse(res.data)
}

export const usePlatformDashboard = (options?: {
  query?: Omit<UseQueryOptions<PlatformDashboard>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.dashboard(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}
