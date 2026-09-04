import { api } from '@/lib/api-client'

import { authSessionSchema } from './schemas'

export async function loginRequest(email: string, password: string) {
  const response = await api.post('/api/auth/login', { email, password })
  return authSessionSchema.parse(response.data)
}

export async function fetchCurrentUser(accessToken: string) {
  const response = await api.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const { user } = authSessionSchema.pick({ user: true }).parse(response.data)
  return user
}
