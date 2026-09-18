import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { api } from '@/lib/api-client'
import { getActiveCompanyId } from '@/lib/tenant-context'
import { cmsKeys } from './query-keys'

export const visualDocumentSchema = z.object({
  values: z.record(z.string()),
  order: z.array(z.string()),
})
export const visualStateSchema = z.object({
  revision: z.number(),
  draft: visualDocumentSchema.nullable(),
  published: visualDocumentSchema.nullable(),
  publishedAt: z.string().nullable(),
  websiteId: z.number(),
  siteUrl: z.string().url(),
})
export const manifestSchema = z.object({
  type: z.literal('GENESIS_READY'),
  sections: z.array(
    z.object({ id: z.string(), label: z.string(), reorderable: z.boolean() }),
  ),
  fields: z.array(
    z.object({
      id: z.string(),
      section: z.string(),
      kind: z.string(),
      original: z.string(),
      label: z.string(),
    }),
  ),
})
export type VisualDocument = z.infer<typeof visualDocumentSchema>
export const bridgeMessageSchema = z.discriminatedUnion('type', [
  manifestSchema,
  z.object({ type: z.literal('GENESIS_SELECT'), id: z.string() }),
  z.object({
    type: z.literal('GENESIS_CHANGE'),
    id: z.string(),
    value: z.string().max(20000),
  }),
])
export type VisualState = z.infer<typeof visualStateSchema>
export type VisualManifest = z.infer<typeof manifestSchema>
const fetchEditor = async (signal?: AbortSignal) =>
  visualStateSchema.parse(
    (await api.get('/api/visual-editor', { signal })).data,
  )
export function useVisualEditor() {
  return useQuery({
    queryKey: cmsKeys.visualEditor(getActiveCompanyId()),
    queryFn: ({ signal }) => fetchEditor(signal),
    refetchOnWindowFocus: false,
  })
}
export function useSaveVisualEditor() {
  const client = useQueryClient()
  const companyId = getActiveCompanyId()
  return useMutation({
    mutationFn: async (input: {
      action: 'draft' | 'publish'
      revision: number
      document?: VisualDocument
    }) => {
      const { action, ...body } = input
      return visualStateSchema.parse(
        (await api.put(`/api/visual-editor/${action}`, body)).data,
      )
    },
    onSuccess: (data) => {
      client.setQueryData(cmsKeys.visualEditor(companyId), data)
    },
  })
}
