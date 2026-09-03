import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { facebookKeys } from './query-keys'

export type UseDisconnectFacebookPageOptions = Omit<
  UseMutationOptions<void, Error, number>,
  'mutationFn'
>

export const useDisconnectFacebookPage = (
  options?: UseDisconnectFacebookPageOptions,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (socialAccountId: number) => {
      await api.delete(`/api/social/facebook/pages/${socialAccountId}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: facebookKeys.pages() })
        .catch(console.error)
      queryClient
        .invalidateQueries({ queryKey: ['accounts'] })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
