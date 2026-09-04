import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'

import { MainErrorFallback } from '@/components/errors'
import { PWABadge } from '@/components/ui'
import { env } from '@/config/env'
import { AuthProvider, DevAuthProvider } from '@/lib/auth'
import { MuiProvider } from '@/lib/mui'
import { queryConfig } from '@/lib/react-query'

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

export interface AppProviderProps {
  children: ReactNode
}

function AppAuthProvider({ children }: { children: ReactNode }) {
  if (env.AUTH_BYPASS) {
    return <DevAuthProvider>{children}</DevAuthProvider>
  }

  return <AuthProvider>{children}</AuthProvider>
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <MuiProvider>
          <QueryClientProvider client={queryClient}>
            <AppAuthProvider>{children}</AppAuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <PWABadge />
          </QueryClientProvider>
        </MuiProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
