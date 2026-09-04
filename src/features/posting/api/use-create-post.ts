import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { postKeys } from './query-keys'
import { cmsPostSchema, type CmsPost } from './use-posts'

export type CreatePostInput = {
  caption: string
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | null
  selectedAccountIds: number[]
  publishMode: 'now' | 'schedule' | 'draft'
  scheduledAt?: string | null
  requireApproval?: boolean
}

export type UseCreatePostOptions = Omit<
  UseMutationOptions<CmsPost, Error, CreatePostInput>,
  'mutationFn'
>

export const useCreatePost = (options?: UseCreatePostOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePostInput) => {
      const res = await api.post('/api/posts', data)
      return cmsPostSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export type UpdatePostInput = {
  postId: number
  caption?: string
  mediaUrl?: string | null
  mediaType?: 'image' | 'video' | null
  selectedAccountIds?: number[]
  scheduledAt?: string | null
  action?:
    | 'reschedule'
    | 'cancel'
    | 'submit_for_approval'
    | 'approve'
    | 'reject_to_draft'
}

export type UseUpdatePostOptions = Omit<
  UseMutationOptions<CmsPost, Error, UpdatePostInput>,
  'mutationFn'
>

export const useUpdatePost = (options?: UseUpdatePostOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ postId, ...data }: UpdatePostInput) => {
      const res = await api.patch(`/api/posts/${postId}`, data)
      return cmsPostSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export type UseDeletePostOptions = Omit<
  UseMutationOptions<void, Error, number>,
  'mutationFn'
>

export const useDeletePost = (options?: UseDeletePostOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/api/posts/${postId}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: postKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

const uploadMediaSchema = z.object({
  filename: z.string(),
  url: z.string().url(),
})

export type UseUploadMediaOptions = Omit<
  UseMutationOptions<z.infer<typeof uploadMediaSchema>, Error, File>,
  'mutationFn'
>

export const useUploadMedia = (options?: UseUploadMediaOptions) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      const res = await api.post('/api/media/upload', formData)
      return uploadMediaSchema.parse(res.data)
    },
    ...options,
  })
}
