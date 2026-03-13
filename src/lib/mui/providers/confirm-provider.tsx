import { ConfirmProvider as MuiConfirmProvider } from 'material-ui-confirm'
import { ReactNode } from 'react'

const defaultOptions = {
  dialogProps: {
    fullWidth: true,
    maxWidth: 'sm' as const,
    slotProps: {
      paper: { sx: { borderRadius: 2 } },
    },
  },
  titleProps: { sx: { p: 3, pb: 2 } },
  contentProps: { sx: { px: 3, pb: 1 } },
  dialogActionsProps: { sx: { p: 3, pt: 1 } },
  cancellationButtonProps: {
    variant: 'outlined' as const,
    sx: { color: 'text.primary', borderColor: 'border.default' },
  },
  confirmationButtonProps: {
    variant: 'contained' as const,
  },
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  return (
    <MuiConfirmProvider defaultOptions={defaultOptions}>
      {children}
    </MuiConfirmProvider>
  )
}
