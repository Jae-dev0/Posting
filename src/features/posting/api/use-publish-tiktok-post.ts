import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

export type PublishTikTokInput = {
  socialAccountId: number
  caption: string
  videoFile?: File
  videoUrl?: string
  postId?: number
}

const responseSchema = z.object({
  id: z.number(),
  externalPostId: z.string(),
  socialAccountId: z.number(),
  displayName: z.string(),
  status: z.string(),
  publishedAt: z.string().nullable(),
})

type Response = z.infer<typeof responseSchema>
type Options = Omit<
  UseMutationOptions<Response, Error, PublishTikTokInput>,
  'mutationFn'
>

export const usePublishTikTokPost = (options?: Options) =>
  useMutation({
    mutationFn: async ({
      socialAccountId,
      caption,
      videoFile,
      videoUrl,
      postId,
    }) => {
      const formData = new FormData()
      formData.append('socialAccountId', String(socialAccountId))
      formData.append('caption', caption)
      if (videoFile) formData.append('video', videoFile)
      if (videoUrl) formData.append('videoUrl', videoUrl)
      if (postId !== undefined) formData.append('postId', String(postId))
      const res = await api.post('/api/social/tiktok/publish', formData)
      return responseSchema.parse(res.data)
    },
    ...options,
  })
