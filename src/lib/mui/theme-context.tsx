import { Theme } from '@mui/material'
import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark'

export type ThemeContextProps = {
  theme: Theme
  setTheme: (mode: ThemeMode) => void
  mode: ThemeMode
  isLightMode: boolean
  isDarkMode: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(
  undefined,
)
