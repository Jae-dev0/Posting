import { blue, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

import { baseTheme } from './base-theme'

const theme = {
  primary: {
    main: red[700],
    dark: blue[900],
    // ligh:
    // contrastText:
  },
  secondary: {
    main: blue[800],
  },
  text: {
    primary: '#1f2024',
    secondary: '#71727a',
  },
  background: {
    default: '#fafafa',
    button: '#fafafa',
    chip: '#e0e0e0',
    cardMedia: '#f5f5f5',
    paper: '#ffffff',
    tableHeader: '#f6f6f6',
  },
  border: {
    default: '#d4d6dd',
  },
  divider: '#d4d6dd',
}

export const lightTheme = createTheme(baseTheme, {
  palette: {
    mode: 'light',
    primary: theme.primary,
    secondary: theme.secondary,
    text: theme.text,
    background: theme.background,
    border: theme.border,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: theme.text.primary,
          borderBottom: `1px solid ${theme.border.default}`,
          backgroundColor: theme.background.paper,
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
