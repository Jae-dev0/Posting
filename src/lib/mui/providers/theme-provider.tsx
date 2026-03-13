import {
  CssBaseline,
  GlobalStyles,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { ReactNode, useCallback, useMemo, useState } from 'react'

import { darkTheme } from '../theme/dark-theme'
import { lightTheme } from '../theme/light-theme'
import { ThemeContext, ThemeMode } from '../theme-context'

const inputGlobalStyles = (
  <GlobalStyles
    styles={() => ({
      body: {},
    })}
  />
)

const getInitialTheme = (): ThemeMode => {
  if (typeof document !== 'undefined') {
    const initialTheme =
      document.documentElement.getAttribute('data-initial-theme')
    if (initialTheme === 'light' || initialTheme === 'dark') {
      return initialTheme
    }
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme())
  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode],
  )

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme-mode', newMode)
      return newMode
    })
  }, [])

  const setTheme = useCallback((newMode: ThemeMode) => {
    localStorage.setItem('theme-mode', newMode)
    setMode(newMode)
  }, [])

  const isLightMode = mode === 'light'
  const isDarkMode = mode === 'dark'

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        mode,
        isLightMode,
        isDarkMode,
        toggleTheme,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline enableColorScheme />
          {inputGlobalStyles}
          {children}
        </LocalizationProvider>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
