import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/lib/api-client'

import { userKeys } from './query-keys'

export type UseDeleteUserOptions = Omit<
  UseMutationOptions<void, Error, number>,
  'mutationFn'
>

export const useDeleteUser = (options?: UseDeleteUserOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/api/users/${userId}`)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: userKeys.lists() })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
