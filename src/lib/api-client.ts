import { default as Axios, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { getStoredAccessToken } from '@/lib/auth/token-storage'
<<<<<<< HEAD
import { getActiveCompanyId } from '@/lib/tenant-context'
=======
>>>>>>> origin/main

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json'
  }

  const token = getStoredAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

<<<<<<< HEAD
  const companyId = getActiveCompanyId()
  if (companyId && config.headers) {
    config.headers['X-Company-Id'] = String(companyId)
  }

=======
>>>>>>> origin/main
  return config
}

export const api = Axios.create({
  baseURL: env.API_URL,
})

api.interceptors.request.use(authRequestInterceptor)
