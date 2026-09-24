import { Box, Button, Stack } from '@mui/material'
import type { IconType } from 'react-icons'
import { Link as RouterLink, useLocation } from 'react-router'

const NAV_SEPARATOR_HEIGHT = 20

export type SectionTopNavItem = {
  label: string
  href: string
  icon?: IconType
}

export type SectionTopNavProps = {
  items: readonly SectionTopNavItem[]
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SectionTopNav({ items }: SectionTopNavProps) {
  const { pathname } = useLocation()

  return (
    <Box
      component="nav"
      aria-label="Primary navigation"
      sx={{
        minWidth: 0,
        overflowX: 'auto',
        overscrollBehaviorInline: 'contain',
        scrollbarWidth: 'thin',
      }}
    >
      <Stack
        direction="row"
        alignItems="stretch"
        sx={{ minWidth: 'max-content', px: { xs: 1, sm: 2 } }}
      >
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = isNavActive(pathname, href)

          return (
            <Button
              key={href}
              component={RouterLink}
              to={href}
              aria-current={isActive ? 'page' : undefined}
              color="inherit"
              variant="text"
              startIcon={
                Icon ? <Icon size={15} aria-hidden="true" /> : undefined
              }
              sx={{
                minHeight: 42,
                px: { xs: 1.5, sm: 2.5 },
                borderRadius: 0,
                borderBottom: '2px solid',
                borderColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                lineHeight: 1.2,
                position: 'relative',
                whiteSpace: 'nowrap',
                '&:not(:last-of-type)::after': {
                  content: '""',
                  position: 'absolute',
                  insetBlock: '50% auto',
                  insetInlineEnd: 0,
                  width: '1px',
                  height: NAV_SEPARATOR_HEIGHT,
                  bgcolor: 'divider',
                  transform: 'translateY(-50%)',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: isActive ? 'primary.main' : 'text.primary',
                },
              }}
            >
              {label}
            </Button>
          )
        })}
      </Stack>
    </Box>
  )
}
