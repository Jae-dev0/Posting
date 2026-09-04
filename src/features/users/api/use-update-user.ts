import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { userKeys } from './query-keys'
import { managedUserSchema, type ManagedUser } from './use-list-users'

export const updateUserInputSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['main_admin', 'admin']).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>

export type UpdateUserVariables = {
  userId: number
  data: UpdateUserInput
}

export type UseUpdateUserOptions = Omit<
  UseMutationOptions<ManagedUser, Error, UpdateUserVariables>,
  'mutationFn'
>

export const useUpdateUser = (options?: UseUpdateUserOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, data }: UpdateUserVariables) => {
      const res = await api.patch(`/api/users/${userId}`, data)
      return managedUserSchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient
        .invalidateQueries({ queryKey: userKeys.lists() })
        .catch(console.error)
      queryClient
        .invalidateQueries({ queryKey: userKeys.detail(variables.userId) })
        .catch(console.error)
      options?.onSuccess?.(data, variables, context)
    },
  })
}
