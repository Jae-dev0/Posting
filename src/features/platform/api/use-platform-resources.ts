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

const companyReferenceSchema = z.object({ id: z.number(), name: z.string() })
const websiteReferenceSchema = z.object({ id: z.number(), name: z.string() })

export const platformWebsiteSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  name: z.string(),
  domain: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: companyReferenceSchema,
  _count: z.object({
    pages: z.number(),
    media: z.number(),
    settings: z.number(),
  }),
})
export type PlatformWebsite = z.infer<typeof platformWebsiteSchema>

export const platformMediaSchema = z.object({
  id: z.number(),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: companyReferenceSchema,
  website: websiteReferenceSchema.nullable(),
})
export type PlatformMedia = z.infer<typeof platformMediaSchema>

export const platformSettingSchema = z.object({
  id: z.number(),
  websiteId: z.number(),
  key: z.string(),
  value: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  company: companyReferenceSchema,
  website: websiteReferenceSchema,
})
export type PlatformSetting = z.infer<typeof platformSettingSchema>

const listWebsites = async ({ signal }: { signal?: AbortSignal } = {}) =>
  platformWebsiteSchema
    .array()
    .parse((await api.get('/api/platform/websites', { signal })).data)
const listMedia = async ({ signal }: { signal?: AbortSignal } = {}) =>
  platformMediaSchema
    .array()
    .parse((await api.get('/api/platform/media', { signal })).data)
const listSettings = async ({ signal }: { signal?: AbortSignal } = {}) =>
  platformSettingSchema
    .array()
    .parse((await api.get('/api/platform/settings', { signal })).data)

export const usePlatformWebsites = (options?: {
  query?: Omit<UseQueryOptions<PlatformWebsite[]>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: platformKeys.websites(),
    queryFn: ({ signal }) => listWebsites({ signal }),
  })
export const usePlatformMedia = (options?: {
  query?: Omit<UseQueryOptions<PlatformMedia[]>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: platformKeys.media(),
    queryFn: ({ signal }) => listMedia({ signal }),
  })
export const usePlatformSettings = (options?: {
  query?: Omit<UseQueryOptions<PlatformSetting[]>, 'queryKey' | 'queryFn'>
}) =>
  useQuery({
    ...options?.query,
    queryKey: platformKeys.settings(),
    queryFn: ({ signal }) => listSettings({ signal }),
  })

export type WebsiteInput = {
  companyId: number
  name: string
  domain?: string | null
  isPrimary: boolean
}
export const useSavePlatformWebsite = (
  options?: Omit<
    UseMutationOptions<
      PlatformWebsite,
      Error,
      { id?: number; data: WebsiteInput }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) =>
      platformWebsiteSchema.parse(
        (
          await (id
            ? api.patch(`/api/platform/websites/${id}`, data)
            : api.post('/api/platform/websites', data))
        ).data,
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.websites() })
      void queryClient.invalidateQueries({ queryKey: platformKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeletePlatformResource = (
  resource: 'websites' | 'media' | 'settings',
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  const key =
    resource === 'websites'
      ? platformKeys.websites()
      : resource === 'media'
        ? platformKeys.media()
        : platformKeys.settings()
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/platform/${resource}/${id}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: key })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useSavePlatformSetting = (
  options?: Omit<
    UseMutationOptions<
      PlatformSetting,
      Error,
      { websiteId: number; key: string; value: string }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) =>
      platformSettingSchema.parse(
        (await api.put('/api/platform/settings', data)).data,
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.settings() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
