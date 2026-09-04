import type { UseMutationOptions } from '@tanstack/react-query'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { userKeys } from './query-keys'
import { managedUserSchema, type ManagedUser } from './use-list-users'

export const createUserInputSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(['main_admin', 'admin']),
})

export type CreateUserInput = z.infer<typeof createUserInputSchema>

export type UseCreateUserOptions = Omit<
  UseMutationOptions<ManagedUser, Error, CreateUserInput>,
  'mutationFn'
>

export const useCreateUser = (options?: UseCreateUserOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await api.post('/api/users', data)
      return managedUserSchema.parse(res.data)
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
