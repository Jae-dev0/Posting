import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { platformKeys } from './query-keys'

export const platformRoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  scope: z.enum(['platform', 'company']),
  assignmentCount: z.number(),
  permissions: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string().nullable().optional(),
    }),
  ),
})

export type PlatformRole = z.infer<typeof platformRoleSchema>

const queryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<PlatformRole[]> => {
  const res = await api.get('/api/roles', { signal })
  return z.array(platformRoleSchema).parse(res.data)
}

export const useListRoles = (options?: {
  query?: Omit<UseQueryOptions<PlatformRole[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.roles(),
    queryFn: ({ signal }) => queryFn({ signal }),
  })
}

export const auditLogSchema = z.object({
  id: z.number(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.number().nullable().optional(),
  summary: z.string(),
  createdAt: z.string(),
  company: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  user: z
    .object({ id: z.number(), name: z.string(), email: z.string() })
    .nullable()
    .optional(),
})

export type AuditLog = z.infer<typeof auditLogSchema>

const auditQueryFn = async ({
  signal,
}: {
  signal?: AbortSignal
} = {}): Promise<AuditLog[]> => {
  const res = await api.get('/api/audit', {
    signal,
    params: { all: true },
  })
  return z.array(auditLogSchema).parse(res.data)
}

export const useListAuditLogs = (options?: {
  query?: Omit<UseQueryOptions<AuditLog[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.audit({ all: true }),
    queryFn: ({ signal }) => auditQueryFn({ signal }),
  })
}

export const platformUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullname: z.string(),
  marketingRole: z.string(),
  status: z.string(),
  companyId: z.number(),
  company: z.object({ id: z.number(), name: z.string() }),
  platformRoles: z.array(
    z.object({
      roleName: z.string(),
      scope: z.string(),
      companyId: z.number().nullable(),
    }),
  ),
  createdAt: z.string(),
})

export type PlatformUser = z.infer<typeof platformUserSchema>

const usersQueryFn = async (
  filters: { search?: string } = {},
  { signal }: { signal?: AbortSignal } = {},
): Promise<PlatformUser[]> => {
  const res = await api.get('/api/platform/users', {
    signal,
    params: { search: filters.search || undefined },
  })
  return z.array(platformUserSchema).parse(res.data)
}

export const useListPlatformUsers = (
  filters: { search?: string } = {},
  options?: {
    query?: Omit<UseQueryOptions<PlatformUser[]>, 'queryKey' | 'queryFn'>
  },
) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.users(filters),
    queryFn: ({ signal }) => usersQueryFn(filters, { signal }),
  })
}

export const useUpdatePlatformUserStatus = (
  options?: Omit<
    UseMutationOptions<
      PlatformUser,
      Error,
      { id: number; status: 'active' | 'disabled' }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }) =>
      platformUserSchema.parse(
        (await api.patch(`/api/platform/users/${id}/status`, { status })).data,
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.users() })
      void queryClient.invalidateQueries({ queryKey: platformKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeletePlatformUser = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/platform/users/${id}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.users() })
      void queryClient.invalidateQueries({ queryKey: platformKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
