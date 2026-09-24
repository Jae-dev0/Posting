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
<<<<<<< HEAD
  status?: 'active' | 'disabled'
  isSuperAdmin?: boolean
  permissions?: string[]
  roleAssignments?: Array<{
    roleId: number
    roleName: string
    scope: 'platform' | 'company'
    companyId: number | null
  }>
=======
>>>>>>> origin/main
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
