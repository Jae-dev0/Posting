import { ReactNode } from 'react'

export interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return <>{children}</>
}
