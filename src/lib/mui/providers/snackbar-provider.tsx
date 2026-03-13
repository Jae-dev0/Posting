import { Alert, Snackbar, Stack, Typography } from '@mui/material'
import { ReactNode, useCallback, useState } from 'react'

import {
  NotificationSeverity,
  NotificationState,
  SnackbarContext,
} from '../snackbar-context'

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  })

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return
    setNotification((prev) => ({ ...prev, open: false }))
  }

  const showNotification = useCallback(
    (message: string, severity: NotificationSeverity, details?: ReactNode) => {
      setNotification({
        open: true,
        message,
        severity,
        details,
      })
    },
    [],
  )

  const showSuccess = useCallback(
    (message: string) => {
      showNotification(message, 'success')
    },
    [showNotification],
  )

  const showError = useCallback(
    (message: string, details?: ReactNode) => {
      showNotification(message, 'error', details)
    },
    [showNotification],
  )

  return (
    <SnackbarContext.Provider
      value={{ showNotification, showSuccess, showError }}
    >
      {children}

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Stack>
            <Typography variant="body1" fontWeight="bold">
              {notification.message}
            </Typography>
            {notification.details}
          </Stack>
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  )
}
