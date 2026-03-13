import Keycloak from 'keycloak-js'
import { createContext } from 'react'

export type TokenState = {
  isValid: boolean
  missingFields: string[]
}

export type KeycloakContextProps = {
  keycloak: Keycloak
  isAuthenticated: boolean
  isPending: boolean
  isError: boolean
  error: unknown
  token: TokenState | null
}

export const KeycloakContext = createContext<KeycloakContextProps | null>(null)
