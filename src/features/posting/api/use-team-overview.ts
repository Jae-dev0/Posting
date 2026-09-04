import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { teamKeys } from './query-keys'

export const teamOverviewSchema = z.object({
  users: z.array(
    z.object({
      id: z.number(),
      email: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      name: z.string(),
      role: z.string(),
    }),
  ),
  accounts: z.array(
    z.object({
      id: z.number(),
      platform: z.string(),
      accountName: z.string(),
      handle: z.string(),
      isConnected: z.boolean(),
    }),
  ),
  permissions: z.array(
    z.object({
      id: z.number(),
      userId: z.number(),
      connectedAccountId: z.number(),
      canPublish: z.boolean(),
      canApprove: z.boolean(),
      user: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      }),
      account: z.object({
        id: z.number(),
        platform: z.string(),
        accountName: z.string(),
        handle: z.string(),
      }),
    }),
  ),
  pendingApprovals: z.array(
    z.object({
      id: z.number(),
      caption: z.string(),
      mediaUrl: z.string().nullable(),
      status: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      platforms: z.array(z.string()),
      createdBy: z
        .object({
          id: z.number(),
          name: z.string(),
          email: z.string(),
        })
        .nullable(),
    }),
  ),
  auditLog: z.array(
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
  roles: z.array(z.string()),
})

export type TeamOverview = z.infer<typeof teamOverviewSchema>

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<TeamOverview> => {
  const res = await api.get('/api/team/overview', { signal })
  return teamOverviewSchema.parse(res.data)
}

export const useTeamOverview = (options?: {
  query?: Omit<UseQueryOptions<TeamOverview>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: teamKeys.overview(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}

export type UpsertPermissionInput = {
  userId: number
  connectedAccountId: number
  canPublish: boolean
  canApprove?: boolean
}

export type UseUpsertPermissionOptions = Omit<
  UseMutationOptions<
    {
      id: number
      userId: number
      connectedAccountId: number
      canPublish: boolean
      canApprove: boolean
    },
    Error,
    UpsertPermissionInput
  >,
  'mutationFn'
>

export const useUpsertPermission = (options?: UseUpsertPermissionOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpsertPermissionInput) => {
      const res = await api.put('/api/team/permissions', data)
      return z
        .object({
          id: z.number(),
          userId: z.number(),
          connectedAccountId: z.number(),
          canPublish: z.boolean(),
          canApprove: z.boolean(),
        })
        .parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: teamKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
