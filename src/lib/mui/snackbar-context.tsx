import { AlertProps } from '@mui/material'
import { createContext, ReactNode } from 'react'

export type NotificationSeverity = AlertProps['severity']

export type NotificationState = {
  open: boolean
  message: string
  severity: NotificationSeverity
  details?: ReactNode
}

export type SnackbarContextType = {
  showNotification: (
    message: string,
    severity: NotificationSeverity,
    details?: ReactNode,
  ) => void
  showSuccess: (message: string) => void
  showError: (message: string, details?: ReactNode) => void
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
)
