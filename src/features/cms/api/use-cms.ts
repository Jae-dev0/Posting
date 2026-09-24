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

export const cmsDashboardSchema = z.object({
  company: z
    .object({
      id: z.number(),
      name: z.string(),
      domain: z.string().nullable(),
      status: z.string(),
      website: z
        .object({
          id: z.number(),
          name: z.string(),
          domain: z.string().nullable(),
        })
        .nullable(),
    })
    .nullable(),
  totals: z.object({
    pages: z.number(),
    published: z.number(),
    media: z.number(),
  }),
  recentActivity: z.array(
    z.object({
      id: z.number(),
      action: z.string(),
      summary: z.string(),
      createdAt: z.string(),
    }),
  ),
})

export type CmsDashboard = z.infer<typeof cmsDashboardSchema>

export const cmsPageSchema = z.object({
  id: z.number(),
  companyId: z.number(),
  websiteId: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CmsPage = z.infer<typeof cmsPageSchema>

export const cmsMediaSchema = z.object({
  id: z.number(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type CmsMedia = z.infer<typeof cmsMediaSchema>

export const cmsNavSchema = z.object({
  id: z.number(),
  label: z.string(),
  href: z.string(),
  sortOrder: z.number(),
  parentId: z.number().nullable(),
})

export type CmsNavItem = z.infer<typeof cmsNavSchema>

export const cmsSettingSchema = z.object({
  id: z.number(),
  key: z.string(),
  value: z.string(),
})

export type CmsSetting = z.infer<typeof cmsSettingSchema>

export const useCmsDashboard = (options?: {
  query?: Omit<UseQueryOptions<CmsDashboard>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.dashboard(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/dashboard', { signal })
      return cmsDashboardSchema.parse(res.data)
    },
  })
}

export const useListCmsPages = (options?: {
  query?: Omit<UseQueryOptions<CmsPage[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.pageList(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/pages', { signal })
      return z.array(cmsPageSchema).parse(res.data)
    },
  })
}

export type CreateCmsPageInput = {
  title: string
  slug: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
}

export const useCreateCmsPage = (
  options?: Omit<
    UseMutationOptions<CmsPage, Error, CreateCmsPageInput>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCmsPageInput) => {
      const res = await api.post('/api/cms/pages', data)
      return cmsPageSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      void queryClient.invalidateQueries({ queryKey: cmsKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateCmsPage = (
  options?: Omit<
    UseMutationOptions<
      CmsPage,
      Error,
      { id: number; data: Partial<CreateCmsPageInput> }
    >,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/api/cms/pages/${id}`, data)
      return cmsPageSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteCmsPage = (
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/cms/pages/${id}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useListCmsMedia = (options?: {
  query?: Omit<UseQueryOptions<CmsMedia[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.media(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/media', { signal })
      return z.array(cmsMediaSchema).parse(res.data)
    },
  })
}

export const useListCmsNavigation = (options?: {
  query?: Omit<UseQueryOptions<CmsNavItem[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.navigation(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/navigation', { signal })
      return z.array(cmsNavSchema).parse(res.data)
    },
  })
}

export const useListCmsSettings = (options?: {
  query?: Omit<UseQueryOptions<CmsSetting[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.settings(),
    queryFn: async ({ signal }) => {
      const res = await api.get('/api/cms/settings', { signal })
      return z.array(cmsSettingSchema).parse(res.data)
    },
  })
}

export const useUpsertCmsSetting = (
  options?: Omit<
    UseMutationOptions<CmsSetting, Error, { key: string; value: string }>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const res = await api.put('/api/cms/settings', data)
      return cmsSettingSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.settings() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
