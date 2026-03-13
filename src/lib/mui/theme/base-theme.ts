import { ThemeOptions } from '@mui/material/styles'

const theme = {
  shape: {
    borderRadius: 12,
    listItemBorderRadius: 4,
  },
  typography: {
    fontWeightMedium: 500,
    buttonTextTransform: 'capitalize' as const,
  },
}

export const baseTheme: ThemeOptions = {
  components: {
    MuiAppBar: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          border: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
        variant: 'contained',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: theme.typography.buttonTextTransform,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          borderRadius: theme.shape.borderRadius,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: theme.typography.fontWeightMedium,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          marginRight: 0,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.shape.listItemBorderRadius,
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
        },
      },
    },
  },
}
