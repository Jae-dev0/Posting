import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { cmsKeys } from './query-keys'

export const cmsUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullname: z.string(),
  status: z.string(),
  cmsRole: z.enum(['cms_admin', 'cms_sub_admin']),
  createdAt: z.string(),
})

export type CmsUser = z.infer<typeof cmsUserSchema>

export type CreateCmsSubAdminInput = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type UpdateCmsSubAdminInput = {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  status?: 'active' | 'disabled'
}

export const useListCmsUsers = (options?: {
  query?: Omit<UseQueryOptions<CmsUser[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.users(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/users', { signal })
      return z.array(cmsUserSchema).parse(res.data)
    },
  })
}

export const useCreateCmsSubAdmin = (
  options?: Omit<
    UseMutationOptions<CmsUser, Error, CreateCmsSubAdminInput>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCmsSubAdminInput) => {
      const res = await api.post('/api/cms/users', data)
      return cmsUserSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateCmsSubAdmin = (
  options?: Omit<
    UseMutationOptions<
      CmsUser,
      Error,
      { id: number; data: UpdateCmsSubAdminInput }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/api/cms/users/${id}`, data)
      return cmsUserSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteCmsSubAdmin = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/cms/users/${id}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
