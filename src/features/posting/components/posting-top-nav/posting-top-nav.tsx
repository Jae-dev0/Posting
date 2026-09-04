import { Box, Button, Stack, Toolbar } from '@mui/material'
import {
  LuCalendarDays,
  LuChartColumn,
  LuClock,
  LuFileText,
  LuLink,
  LuPenLine,
  LuPlus,
  LuShield,
  LuUsers,
} from 'react-icons/lu'
import { Link as RouterLink, useLocation } from 'react-router'

import { paths } from '@/config/paths'
import { useCanManageAccounts } from '@/lib/auth/hooks'

const publishingNavItems = [
  {
    label: 'Analytics',
    href: paths.dashboard.getHref(),
    icon: LuChartColumn,
  },
  {
    label: 'Create Post',
    href: paths.posting.create.getHref(),
    icon: LuPlus,
  },
  {
    label: 'Scheduled',
    href: paths.posting.scheduled.getHref(),
    icon: LuClock,
  },
  {
    label: 'Drafts',
    href: paths.posting.drafts.getHref(),
    icon: LuFileText,
  },
  {
    label: 'Calendar',
    href: paths.posting.calendar.getHref(),
    icon: LuCalendarDays,
  },
  {
    label: 'History',
    href: paths.posting.history.getHref(),
    icon: LuPenLine,
  },
] as const

const adminNavItems = [
  {
    label: 'Team & Permissions',
    href: paths.posting.team.getHref(),
    icon: LuShield,
  },
  {
    label: 'Accounts',
    href: paths.posting.accounts.getHref(),
    icon: LuLink,
  },
  {
    label: 'Users',
    href: paths.posting.users.getHref(),
    icon: LuUsers,
  },
] as const

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PostingTopNav() {
  const { pathname } = useLocation()
  const canManageAccounts = useCanManageAccounts()
  const items = canManageAccounts
    ? [...publishingNavItems, ...adminNavItems]
    : [...publishingNavItems]

  return (
    <Toolbar
      variant="dense"
      sx={{
        minHeight: 48,
        px: { xs: 1, md: 3 },
        gap: 0.5,
        overflowX: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.5 }}>
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = isNavActive(pathname, href)

          return (
            <Button
              key={href}
              component={RouterLink}
              to={href}
              size="small"
              color={isActive ? 'primary' : 'inherit'}
              variant={isActive ? 'contained' : 'text'}
              startIcon={<Icon size={14} />}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: isActive ? 600 : 500,
                px: 1.5,
                whiteSpace: 'nowrap',
                ...(isActive
                  ? {}
                  : {
                      color: 'text.secondary',
                      '&:hover': { color: 'text.primary' },
                    }),
              }}
            >
              {label}
            </Button>
          )
        })}
      </Stack>
      <Box sx={{ flexGrow: 1 }} />
    </Toolbar>
  )
}
