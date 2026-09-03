import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { instagramKeys } from './query-keys'

export type PublishInstagramInput = {
  socialAccountId: number
  caption: string
  imageUrls?: string[]
  imageFiles?: File[]
  postId?: number
}

const publishInstagramResponseSchema = z.object({
  id: z.number(),
  externalPostId: z.string(),
  socialAccountId: z.number(),
  pageId: z.string(),
  pageName: z.string(),
  status: z.string(),
  publishedAt: z.string().nullable(),
})

export type PublishInstagramResponse = z.infer<
  typeof publishInstagramResponseSchema
>

export type UsePublishInstagramPostOptions = Omit<
  UseMutationOptions<PublishInstagramResponse, Error, PublishInstagramInput>,
  'mutationFn'
>

export const usePublishInstagramPost = (
  options?: UsePublishInstagramPostOptions,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PublishInstagramInput) => {
      const { socialAccountId, caption, imageUrls, imageFiles, postId } = input
      const files = imageFiles ?? []

      if (files.length > 0) {
        const formData = new FormData()
        formData.append('socialAccountId', String(socialAccountId))
        formData.append('caption', caption)
        for (const file of files) {
          formData.append('images', file)
        }
        if (postId !== undefined) {
          formData.append('postId', String(postId))
        }

        const res = await api.post('/api/social/instagram/publish', formData)
        return publishInstagramResponseSchema.parse(res.data)
      }

      const res = await api.post('/api/social/instagram/publish', {
        socialAccountId,
        caption,
        imageUrls: imageUrls ?? [],
        postId,
      })
      return publishInstagramResponseSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: instagramKeys.posts() })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
