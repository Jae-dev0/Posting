import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { facebookKeys } from './query-keys'

export type PublishFacebookInput = {
  socialAccountId: number
  message: string
  imageUrls?: string[]
  imageFiles?: File[]
  postId?: number
}

const publishFacebookResponseSchema = z.object({
  id: z.number(),
  externalPostId: z.string(),
  socialAccountId: z.number(),
  pageId: z.string(),
  pageName: z.string(),
  status: z.string(),
  publishedAt: z.string().nullable(),
})

export type PublishFacebookResponse = z.infer<
  typeof publishFacebookResponseSchema
>

export type UsePublishFacebookPostOptions = Omit<
  UseMutationOptions<PublishFacebookResponse, Error, PublishFacebookInput>,
  'mutationFn'
>

export const usePublishFacebookPost = (
  options?: UsePublishFacebookPostOptions,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: PublishFacebookInput) => {
      const { socialAccountId, message, imageUrls, imageFiles, postId } = input
      const files = imageFiles ?? []

      if (files.length > 0) {
        const formData = new FormData()
        formData.append('socialAccountId', String(socialAccountId))
        formData.append('message', message)
        for (const file of files) {
          formData.append('images', file)
        }
        if (postId !== undefined) {
          formData.append('postId', String(postId))
        }

        const res = await api.post('/api/social/facebook/publish', formData)
        return publishFacebookResponseSchema.parse(res.data)
      }

      const res = await api.post('/api/social/facebook/publish', {
        socialAccountId,
        message,
        imageUrls: imageUrls ?? [],
        postId,
      })
      return publishFacebookResponseSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: facebookKeys.posts() })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
