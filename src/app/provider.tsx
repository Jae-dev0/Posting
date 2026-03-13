import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'

import { MainErrorFallback } from '@/components/errors'
import { PWABadge } from '@/components/ui'
import { keycloak as keycloakClient, KeycloakProvider } from '@/lib/keycloak'
import { MuiProvider } from '@/lib/mui'
import { queryConfig } from '@/lib/react-query'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

export interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <MuiProvider>
          <QueryClientProvider client={queryClient}>
            <KeycloakProvider
              client={keycloakClient}
              onLoad="check-sso"
              scope="openid profile email company fis-api"
              silentCheckSsoRedirectUri={`${location.origin}/silent-check-sso.html`}
              checkLoginIframe={false}
            >
              {children}
            </KeycloakProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <PWABadge />
          </QueryClientProvider>
        </MuiProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
