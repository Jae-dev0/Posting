import { ThemeOptions } from '@mui/material/styles'

const theme = {
  shape: {
    borderRadius: 12,
    listItemBorderRadius: 4,
  },
}

export const baseTheme: ThemeOptions = {
  typography: {
    fontFamily:
      '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
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
          textTransform: 'capitalize',
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
          fontWeight: 500,
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
