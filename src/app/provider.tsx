import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode } from 'react'
import { HelmetProvider } from 'react-helmet-async'

import { PWABadge } from '@/components/ui/pwa-badge'
import { queryConfig } from '@/lib/react-query'

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})

export interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>

      <PWABadge />
    </HelmetProvider>
  )
}
