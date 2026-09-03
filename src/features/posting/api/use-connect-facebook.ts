import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

const connectResponseSchema = z.object({
  authUrl: z.string().url(),
  redirectUri: z.string(),
  graphApiVersion: z.string(),
})

export type FacebookConnectResponse = z.infer<typeof connectResponseSchema>

export type UseConnectFacebookOptions = Omit<
  UseMutationOptions<FacebookConnectResponse, Error, void>,
  'mutationFn'
>

export const useConnectFacebook = (options?: UseConnectFacebookOptions) => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/social/facebook/connect')
      return connectResponseSchema.parse(res.data)
    },
    ...options,
  })
}
