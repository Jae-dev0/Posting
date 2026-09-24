import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { accountKeys } from './use-connected-accounts'
import { tiktokKeys } from './query-keys'

type Options = Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>

export const useDisconnectTikTokAccount = (options?: Options) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/social/tiktok/accounts/${id}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: tiktokKeys.accounts() })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
