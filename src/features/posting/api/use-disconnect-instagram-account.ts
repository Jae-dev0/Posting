import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { instagramKeys } from './query-keys'

export type UseDisconnectInstagramAccountOptions = Omit<
  UseMutationOptions<void, Error, number>,
  'mutationFn'
>

export const useDisconnectInstagramAccount = (
  options?: UseDisconnectInstagramAccountOptions,
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (accountId: number) => {
      await api.delete(`/api/social/instagram/accounts/${accountId}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: instagramKeys.accounts() })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
