import { ReactNode } from 'react'

import { PWABadge } from '@/components/ui/pwa-badge'

export interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <>
      {children}
      <PWABadge />
    </>
  )
}
