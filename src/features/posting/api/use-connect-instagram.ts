import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

const connectInstagramResponseSchema = z.object({
  authUrl: z.string().url(),
  redirectUri: z.string().url(),
  graphApiVersion: z.string(),
})

export type ConnectInstagramResponse = z.infer<
  typeof connectInstagramResponseSchema
>

export type UseConnectInstagramOptions = Omit<
  UseMutationOptions<ConnectInstagramResponse, Error, void>,
  'mutationFn'
>

export const useConnectInstagram = (options?: UseConnectInstagramOptions) => {
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/social/instagram/connect')
      return connectInstagramResponseSchema.parse(res.data)
    },
    ...options,
  })
}
