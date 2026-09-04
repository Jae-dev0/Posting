import { useContext } from 'react'

import { ThemeContext, ThemeContextProps } from './theme-context'

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within MuiProvider')
  }
  return context
}
