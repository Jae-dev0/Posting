import Keycloak, { KeycloakOnLoad } from 'keycloak-js'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { KeycloakContext, type TokenState } from './context'
import { validateTokenParsed } from './schema'

export type KeycloakProviderProps = {
  client: Keycloak
  onLoad?: KeycloakOnLoad
  silentCheckSsoRedirectUri?: string
  checkLoginIframe?: boolean
  scope?: string
  children?: ReactNode
}

export function KeycloakProvider({
  client,
  onLoad,
  scope,
  silentCheckSsoRedirectUri,
  checkLoginIframe,
  children,
}: KeycloakProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPending, setIsPending] = useState(true)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<unknown>()
  const [token, setToken] = useState<TokenState | null>(null)

  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    client
      .init({ onLoad, scope, silentCheckSsoRedirectUri, checkLoginIframe })
      .then((authenticated) => {
        setIsAuthenticated(authenticated)
        if (authenticated) {
          const tokenState = validateTokenParsed(client.tokenParsed)
          setToken(tokenState)
        }
      })
      .catch((err: unknown) => {
        setError(err)
        setIsError(true)
      })
      .finally(() => {
        setIsPending(false)
      })
  }, [checkLoginIframe, client, onLoad, scope, silentCheckSsoRedirectUri])

  const value = useMemo(
    () => ({
      keycloak: client,
      isAuthenticated,
      isPending,
      isError,
      error,
      token,
    }),
    [client, isAuthenticated, isPending, isError, error, token],
  )

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  )
}
