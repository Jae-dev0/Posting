import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'

import { MainErrorFallback } from '@/components/errors'
import { PWABadge } from '@/components/ui'
import { env } from '@/config/env'
import {
  DevKeycloakProvider,
  keycloak as keycloakClient,
  KeycloakProvider,
} from '@/lib/keycloak'
import { MuiProvider } from '@/lib/mui'
import { queryConfig } from '@/lib/react-query'

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

export interface AppProviderProps {
  children: ReactNode
}
function AuthProvider({ children }: { children: ReactNode }) {
  if (env.AUTH_BYPASS) {
    return <DevKeycloakProvider>{children}</DevKeycloakProvider>
  }

  return (
    <KeycloakProvider
      client={keycloakClient}
      onLoad="check-sso"
      scope="openid profile email company"
      silentCheckSsoRedirectUri={`${location.origin}/silent-check-sso.html`}
      checkLoginIframe={false}
    >
      {children}
    </KeycloakProvider>
  )
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <MuiProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <PWABadge />
          </QueryClientProvider>
        </MuiProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
