import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

const responseSchema = z.object({
  authUrl: z.string().url(),
  redirectUri: z.string().url(),
  scopes: z.array(z.string()),
})

type Response = z.infer<typeof responseSchema>
type Options = Omit<UseMutationOptions<Response, Error, void>, 'mutationFn'>

export const useConnectTikTok = (options?: Options) =>
  useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/social/tiktok/connect')
      return responseSchema.parse(res.data)
    },
    ...options,
  })
