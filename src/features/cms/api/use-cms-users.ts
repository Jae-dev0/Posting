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

const roleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
})
const websiteSchema = z.object({
  id: z.number(),
  name: z.string(),
  domain: z.string().nullable().optional(),
  isPrimary: z.boolean(),
})

export const cmsAccountSchema = z.object({
  id: z.number(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullname: z.string(),
  status: z.enum(['active', 'disabled']),
  websiteAccessMode: z.enum(['all_websites', 'selected_websites']),
  roleIds: z.array(z.number()),
  roles: z.array(roleSchema),
  websiteIds: z.array(z.number()),
  createdAt: z.string(),
})
export type CmsAccount = z.infer<typeof cmsAccountSchema>

export const cmsAccountCatalogSchema = z.object({
  roles: z.array(roleSchema.extend({ isSystem: z.boolean() })),
  websites: z.array(websiteSchema),
})
export type CmsAccountCatalog = z.infer<typeof cmsAccountCatalogSchema>

export type CmsAccountInput = {
  firstName: string
  lastName: string
  email: string
  password?: string
  roleIds: number[]
  websiteAccessMode: 'all_websites' | 'selected_websites'
  websiteIds: number[]
  status: 'active' | 'disabled'
}

const listCmsAccounts = async ({
  signal,
}: { signal?: AbortSignal } = {}): Promise<CmsAccount[]> => {
  const response = await api.get('/api/cms/users', { signal })
  return z.array(cmsAccountSchema).parse(response.data)
}

const getCmsAccountCatalog = async ({
  signal,
}: { signal?: AbortSignal } = {}): Promise<CmsAccountCatalog> => {
  const response = await api.get('/api/cms/users/catalog', { signal })
  return cmsAccountCatalogSchema.parse(response.data)
}

export const useListCmsAccounts = (options?: {
  query?: Omit<UseQueryOptions<CmsAccount[]>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: cmsKeys.users(),
    queryFn: ({ signal }) => listCmsAccounts({ signal }),
  })

export const useCmsAccountCatalog = (options?: {
  query?: Omit<UseQueryOptions<CmsAccountCatalog>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: cmsKeys.accountCatalog(),
    queryFn: ({ signal }) => getCmsAccountCatalog({ signal }),
  })

type CreateOptions = Omit<
  UseMutationOptions<CmsAccount, Error, Required<CmsAccountInput>>,
  'mutationFn'
>
export const useCreateCmsAccount = (options?: CreateOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Required<CmsAccountInput>) =>
      cmsAccountSchema.parse((await api.post('/api/cms/users', data)).data),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

type UpdateVariables = { id: number; data: CmsAccountInput }
type UpdateOptions = Omit<
  UseMutationOptions<CmsAccount, Error, UpdateVariables>,
  'mutationFn'
>
export const useUpdateCmsAccount = (options?: UpdateOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) =>
      cmsAccountSchema.parse(
        (await api.patch(`/api/cms/users/${id}`, data)).data,
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

type SuspendOptions = Omit<
  UseMutationOptions<{ id: number; status: 'disabled' }, Error, number>,
  'mutationFn'
>
export const useSuspendCmsAccount = (options?: SuspendOptions) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) =>
      z
        .object({ id: z.number(), status: z.literal('disabled') })
        .parse((await api.post(`/api/cms/users/${id}/suspend`)).data),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.users() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

// Compatibility exports for existing CMS imports during the accounts transition.
export const useListCmsUsers = useListCmsAccounts
export const useCreateCmsSubAdmin = useCreateCmsAccount
export const useUpdateCmsSubAdmin = useUpdateCmsAccount
export const useDeleteCmsSubAdmin = useSuspendCmsAccount
export type CmsUser = CmsAccount
