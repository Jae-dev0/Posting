import { useContext } from 'react'

import { KeycloakContext } from './context'
import { tokenParsedSchema } from './schema'

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
    throw new Error(
      'useKeycloakAuth hook must be used inside KeycloakProvider context and authenticated state',
    )
  }

  const tokenParsed = tokenParsedSchema.safeParse(keycloak.tokenParsed)
  if (!tokenParsed.success) {
    throw new Error(
      'useKeycloakAuth hook must be used inside KeycloakProvider context and authenticated state',
    )
  }

  const data = tokenParsed.data

  const user = {
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
