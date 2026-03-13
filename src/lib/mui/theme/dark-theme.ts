import { blue } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

import { baseTheme } from './base-theme'

const theme = {
  primary: {
    main: blue[900],
    dark: blue[900],
    // ligh:
    // contrastText:
  },
  secondary: {
    main: blue[500],
    light: blue[600],
    dark: blue[900],
    contrastText: '#fff',
  },
  text: {
    primary: '#E1E8ED',
    secondary: '#a1a1a1',
  },
  background: {
    default: '#1f2024',
    paper: '#2f3036',
    tableHeader: '#131418',
  },
  border: {
    default: '#494a50',
  },
  divider: '#494a50',
}

export const darkTheme = createTheme(baseTheme, {
  palette: {
    mode: 'dark',
    primary: theme.primary,
    secondary: theme.secondary,
    text: theme.text,
    background: theme.background,
    border: theme.border,
    divider: theme.divider,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: theme.text.primary,
          borderBottom: '1px solid #494a50',
          backgroundColor: theme.background.default,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: theme.background.tableHeader,
        },
      },
    },
  },
})
