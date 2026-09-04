import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '@/lib/api-client'

import { platformKeys } from './query-keys'

export const companySchema = z.object({
  id: z.number(),
  name: z.string(),
  domain: z.string().nullable().optional(),
  status: z.enum(['active', 'disabled']),
  createdAt: z.string(),
  updatedAt: z.string(),
  userCount: z.number().optional(),
  websiteCount: z.number().optional(),
})

export type Company = z.infer<typeof companySchema>

const companiesSchema = z.array(companySchema)

export type CompanyListFilters = {
  search?: string
  status?: 'active' | 'disabled' | ''
}

const listQueryFn = async (
  filters: CompanyListFilters,
  { signal }: { signal?: AbortSignal } = {},
): Promise<Company[]> => {
  const res = await api.get('/api/companies', {
    signal,
    params: {
      search: filters.search || undefined,
      status: filters.status || undefined,
    },
  })
  return companiesSchema.parse(res.data)
}

export const useListCompanies = (
  filters: CompanyListFilters = {},
  options?: {
    query?: Omit<UseQueryOptions<Company[]>, 'queryKey' | 'queryFn'>
  },
) => {
  return useQuery({
    ...options?.query,
    queryKey: platformKeys.companyList(filters),
    queryFn: ({ signal }) => listQueryFn(filters, { signal }),
  })
}

export type CreateCompanyInput = {
  name: string
  domain?: string | null
  status?: 'active' | 'disabled'
  websiteName?: string
  admin?: {
    firstName: string
    lastName: string
    email: string
    password: string
  }
}

export const useCreateCompany = (
  options?: Omit<UseMutationOptions<Company, Error, CreateCompanyInput>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CreateCompanyInput) => {
      const res = await api.post('/api/companies', data)
      return companySchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.companies() })
      void queryClient.invalidateQueries({ queryKey: platformKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export type UpdateCompanyInput = {
  id: number
  data: {
    name?: string
    domain?: string | null
    status?: 'active' | 'disabled'
  }
}

export const useUpdateCompany = (
  options?: Omit<UseMutationOptions<Company, Error, UpdateCompanyInput>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: UpdateCompanyInput) => {
      const res = await api.patch(`/api/companies/${id}`, data)
      return companySchema.parse(res.data)
    },
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({ queryKey: platformKeys.companies() })
      void queryClient.invalidateQueries({ queryKey: platformKeys.dashboard() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
