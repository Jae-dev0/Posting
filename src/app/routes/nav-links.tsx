import { Divider, Link as MuiLink, Stack } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router'

type NavItem = {
  label: string
  path: string
  /** When true, shows a vertical divider after this item. Omit or true for all but last. */
  dividerAfter?: boolean
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', path: '', dividerAfter: true },
]

export function DashboardNavLinks() {
  const { pathname } = useLocation()

  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="stretch"
      sx={{
        px: 3,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {mainNavItems.map((item) => {
        const isActive =
          pathname === item.path || pathname.startsWith(item.path + '/')
        const showDivider = item.dividerAfter !== false

        return [
          <MuiLink
            key={item.label}
            component={RouterLink}
            to={item.path}
            underline="none"
            sx={{
              py: 1,
              px: 3,
              fontSize: '0.8rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'primary.main' : 'text.secondary',
              borderBottom: isActive ? '2px solid' : '2px solid transparent',
              borderBottomColor: isActive ? 'error.main' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {item.label.toUpperCase()}
          </MuiLink>,
          ...(showDivider
            ? [
                <Divider
                  key={`${item.label}-divider`}
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: 'divider', m: 1 }}
                />,
              ]
            : []),
        ]
      })}
    </Stack>
  )
}
