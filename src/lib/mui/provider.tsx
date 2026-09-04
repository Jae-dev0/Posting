import { ReactNode } from 'react'

import { ConfirmProvider } from './providers/confirm-provider'
import { SnackbarProvider } from './providers/snackbar-provider'
import { ThemeProvider } from './providers/theme-provider'

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SnackbarProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </SnackbarProvider>
    </ThemeProvider>
  )
}
