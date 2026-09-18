import {
  useMutation,
  useQuery,
  useQueryClient,
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

// ─── Plain callback helper ────────────────────────────────────────────────────
// TanStack Query v5 removed onSuccess/onError from UseMutationOptions.
// We accept a plain callback bag so callers can still react to results.
type MutationCallbacks<TData = unknown, TError = Error, TVariables = void> = {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: TError, variables: TVariables) => void
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useCmsDashboard = (options?: {
  query?: Omit<UseQueryOptions<CmsDashboard>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.dashboard(),
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
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
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
      const res = await api.get('/api/cms/pages', { signal })
      return z.array(cmsPageSchema).parse(res.data)
    },
  })
}

export const useListCmsMedia = (options?: {
  query?: Omit<UseQueryOptions<CmsMedia[]>, 'queryKey' | 'queryFn'>
}) => {
  return useQuery({
    ...options?.query,
    queryKey: cmsKeys.media(),
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
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
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
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
    queryFn: async ({ signal }: { signal?: AbortSignal }) => {
      const res = await api.get('/api/cms/settings', { signal })
      return z.array(cmsSettingSchema).parse(res.data)
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export type CreateCmsPageInput = {
  title: string
  slug: string
  content?: string
  status?: 'draft' | 'published' | 'archived'
}

export const useCreateCmsPage = (callbacks?: MutationCallbacks<CmsPage, Error, CreateCmsPageInput>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCmsPageInput) => {
      const res = await api.post('/api/cms/pages', data)
      return cmsPageSchema.parse(res.data)
    },
    onSuccess: (data: CmsPage, variables: CreateCmsPageInput) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      void queryClient.invalidateQueries({ queryKey: cmsKeys.dashboard() })
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (error: Error, variables: CreateCmsPageInput) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export const useUpdateCmsPage = (
  callbacks?: MutationCallbacks<CmsPage, Error, { id: number; data: Partial<CreateCmsPageInput> }>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateCmsPageInput> }) => {
      const res = await api.patch(`/api/cms/pages/${id}`, data)
      return cmsPageSchema.parse(res.data)
    },
    onSuccess: (data: CmsPage, variables: { id: number; data: Partial<CreateCmsPageInput> }) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (error: Error, variables: { id: number; data: Partial<CreateCmsPageInput> }) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export const useDeleteCmsPage = (callbacks?: MutationCallbacks<void, Error, number>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/cms/pages/${id}`)
    },
    onSuccess: (_data: void, variables: number) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      callbacks?.onSuccess?.(undefined, variables)
    },
    onError: (error: Error, variables: number) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export const useUpsertCmsSetting = (
  callbacks?: MutationCallbacks<CmsSetting, Error, { key: string; value: string }>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { key: string; value: string }) => {
      const res = await api.put('/api/cms/settings', data)
      return cmsSettingSchema.parse(res.data)
    },
    onSuccess: (data: CmsSetting, variables: { key: string; value: string }) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.settings() })
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (error: Error, variables: { key: string; value: string }) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export const usePublishCmsPage = (
  callbacks?: MutationCallbacks<CmsPage & { externalSync?: Record<string, unknown> }, Error, number>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.post(`/api/cms/pages/${id}/publish`)
      return res.data as CmsPage & { externalSync?: Record<string, unknown> }
    },
    onSuccess: (
      data: CmsPage & { externalSync?: Record<string, unknown> },
      variables: number,
    ) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      void queryClient.invalidateQueries({ queryKey: cmsKeys.dashboard() })
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (error: Error, variables: number) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export const useReorderCmsSections = (
  callbacks?: MutationCallbacks<
    { success: boolean },
    Error,
    { websiteId: number; pageId?: number; sections: Array<{ id: number; sortOrder: number }> }
  >,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      websiteId: number
      pageId?: number
      sections: Array<{ id: number; sortOrder: number }>
    }) => {
      const res = await api.post('/api/cms/sections/reorder', data)
      return res.data as { success: boolean }
    },
    onSuccess: (
      data: { success: boolean },
      variables: { websiteId: number; pageId?: number; sections: Array<{ id: number; sortOrder: number }> },
    ) => {
      void queryClient.invalidateQueries({ queryKey: cmsKeys.pages() })
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (
      error: Error,
      variables: { websiteId: number; pageId?: number; sections: Array<{ id: number; sortOrder: number }> },
    ) => {
      callbacks?.onError?.(error, variables)
    },
  })
}

export type BooknaSyncPayload = {
  targetUrl?: string
  apiKey?: string
  websiteId?: number
  pageId?: number
  payload?: Record<string, unknown>
}

export type BooknaSyncResult = {
  success: boolean
  targetUrl: string
  syncedAt: string
  status: string
  payloadSummary: Record<string, unknown>
}

export const useSyncCmsToBookna = (
  callbacks?: MutationCallbacks<BooknaSyncResult, Error, BooknaSyncPayload>,
) => {
  return useMutation({
    mutationFn: async (data: BooknaSyncPayload) => {
      const res = await api.post('/api/cms/sync/external', data)
      return res.data as BooknaSyncResult
    },
    onSuccess: (data: BooknaSyncResult, variables: BooknaSyncPayload) => {
      callbacks?.onSuccess?.(data, variables)
    },
    onError: (error: Error, variables: BooknaSyncPayload) => {
      callbacks?.onError?.(error, variables)
    },
  })
}
