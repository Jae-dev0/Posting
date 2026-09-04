import { useContext } from 'react'

import { SnackbarContext, SnackbarContextType } from './snackbar-context'

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within MuiProvider')
  }
  return context
}
