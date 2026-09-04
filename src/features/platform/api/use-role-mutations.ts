import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { platformKeys } from './query-keys'
import { platformRoleSchema, type PlatformRole } from './use-roles-audit-users'

export type CreateRoleInput = {
  name: string
  description: string
  scope: 'platform' | 'company'
}

export type UpdateRoleInput = {
  id: number
  data: Partial<CreateRoleInput>
}

export type SyncPermissionGrantsInput = {
  permissionIds: number[]
  grants: Array<{
    roleId: number
    permissionId: number
    granted: boolean
  }>
}

export const useCreateRole = (
  options?: Omit<
    UseMutationOptions<PlatformRole, Error, CreateRoleInput>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateRoleInput) => {
      const res = await api.post('/api/roles', data)
      return platformRoleSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.roles() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateRole = (
  options?: Omit<
    UseMutationOptions<PlatformRole, Error, UpdateRoleInput>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: UpdateRoleInput) => {
      const res = await api.patch(`/api/roles/${id}`, data)
      return platformRoleSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.roles() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useSyncRolePermissionGrants = (
  options?: Omit<
    UseMutationOptions<PlatformRole[], Error, SyncPermissionGrantsInput>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SyncPermissionGrantsInput) => {
      const res = await api.put('/api/roles/permission-grants', data)
      return z.array(platformRoleSchema).parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.roles() })
      void queryClient.invalidateQueries({
        queryKey: platformKeys.permissions(),
      })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
