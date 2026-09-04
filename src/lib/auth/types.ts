export type UserRole = 'main_admin' | 'admin'

export type AuthUser = {
  id: number
  email: string
  firstName: string
  lastName: string
  fullname: string
  username: string
  role: UserRole
  companyId: number
  createdAt: string
}

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

export type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  isAuthenticated: boolean
  isPending: boolean
  login: (session: AuthSession) => void
  logout: () => void
}
