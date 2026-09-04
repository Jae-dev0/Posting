import { useContext } from 'react'

import { KeycloakContext } from './context'
import { tokenParsedSchema } from './schema'

export type KeycloakAuthUser = {
  id: string
  username: string
  fullname: string
  firstName: string
  lastName: string
  email: string
  company: {
    employeeNumber: string
    companyPrimaryId: number
    companyActiveId: number
  }
}

export function useKeycloak() {
  const context = useContext(KeycloakContext)

  if (!context) {
    throw new Error(
      'useKeycloak hook must be used inside KeycloakProvider context',
    )
  }

  return context
}

export function useKeycloakAuth() {
  const { keycloak, isAuthenticated, token } = useKeycloak()

  if (!isAuthenticated || !token?.isValid) {
    return [null, { keycloak }] as const
  }

  const tokenParsed = tokenParsedSchema.safeParse(keycloak.tokenParsed)
  if (!tokenParsed.success) {
    return [null, { keycloak }] as const
  }

  const data = tokenParsed.data

  const user: KeycloakAuthUser = {
    id: data.sub,
    username: data.preferred_username,
    fullname: data.name,
    firstName: data.given_name,
    lastName: data.family_name,
    email: data.email,
    company: {
      employeeNumber: data.employee_number,
      companyPrimaryId: data.company_id,
      companyActiveId: data.company_active_id,
    },
  } as const

  return [user, { keycloak }] as const
}
