import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { type ReactNode } from 'react'
import {
<<<<<<< HEAD
  LuCalendarDays,
  LuChartColumn,
  LuCircleHelp,
  LuClock,
  LuFileText,
  LuLink,
  LuPenLine,
  LuPlus,
  LuShield,
=======
  LuCircleHelp,
  LuClock,
  LuLink,
  LuPenLine,
  LuPlus,
>>>>>>> origin/main
  LuUsers,
} from 'react-icons/lu'
import { Link as RouterLink, useLocation } from 'react-router'

import { paths } from '@/config/paths'
import { useCanManageAccounts } from '@/lib/auth/hooks'

const publishingNavItems = [
  {
<<<<<<< HEAD
    label: 'Analytics',
    href: paths.dashboard.getHref(),
    icon: LuChartColumn,
  },
  {
=======
>>>>>>> origin/main
    label: 'Create Post',
    href: paths.posting.create.getHref(),
    icon: LuPlus,
  },
  {
<<<<<<< HEAD
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
=======
    label: 'Post History',
    href: paths.posting.history.getHref(),
    icon: LuPenLine,
  },
  {
    label: 'Scheduled Posts',
    href: paths.posting.scheduled.getHref(),
    icon: LuClock,
  },
>>>>>>> origin/main
] as const

const adminNavItems = [
  {
<<<<<<< HEAD
    label: 'Team & Permissions',
    href: paths.posting.team.getHref(),
    icon: LuShield,
  },
  {
=======
>>>>>>> origin/main
    label: 'Connected Accounts',
    href: paths.posting.accounts.getHref(),
    icon: LuLink,
  },
  {
<<<<<<< HEAD
    label: 'Users',
=======
    label: 'Account Management',
>>>>>>> origin/main
    href: paths.posting.users.getHref(),
    icon: LuUsers,
  },
] as const

type SidebarNavItem = {
  label: string
  href: string
  icon: (typeof publishingNavItems)[number]['icon']
}

function SidebarNavList({ items }: { items: readonly SidebarNavItem[] }) {
  const { pathname } = useLocation()

  return (
    <List disablePadding sx={{ px: 1 }}>
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <ListItemButton
            key={href}
            component={RouterLink}
            to={href}
            selected={isActive}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'light'
                    ? 'rgba(211, 47, 47, 0.08)'
                    : 'rgba(244, 67, 54, 0.16)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon size={18} />
            </ListItemIcon>
            <ListItemText
              primary={label}
              slotProps={{
                primary: {
                  variant: 'body2',
                  fontWeight: isActive ? 600 : 400,
                },
              }}
            />
          </ListItemButton>
        )
      })}
    </List>
  )
}

function SidebarSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Stack spacing={0.5}>
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ px: 2, letterSpacing: 0.6, textTransform: 'uppercase' }}
      >
        {title}
      </Typography>
      {children}
    </Stack>
  )
}

export function PostingSidebar() {
  const canManageAccounts = useCanManageAccounts()

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        borderRight: { md: '1px solid' },
        borderBottom: { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
        bgcolor: 'background.paper',
<<<<<<< HEAD
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        minHeight: { md: 'calc(100vh - 112px)' },
=======
        display: 'flex',
        flexDirection: 'column',
        minHeight: { md: 'calc(100vh - 64px)' },
>>>>>>> origin/main
      }}
    >
      <Stack spacing={2.5} sx={{ py: 2, flexGrow: 1 }}>
        <SidebarSection title="Publishing">
          <SidebarNavList items={publishingNavItems} />
        </SidebarSection>

        {canManageAccounts ? (
          <SidebarSection title="Administration">
            <SidebarNavList items={adminNavItems} />
          </SidebarSection>
        ) : null}
      </Stack>

<<<<<<< HEAD
      <Box sx={{ p: 2, mt: 'auto' }}>
=======
      <Box sx={{ p: 2, mt: 'auto', display: { xs: 'none', md: 'block' } }}>
>>>>>>> origin/main
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            bgcolor: 'background.default',
            borderStyle: 'dashed',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <LuCircleHelp size={16} />
            <Box>
              <Typography variant="caption" fontWeight={600} display="block">
                Need help?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Use Create Post to draft, schedule, and publish across
                platforms.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Paper>
  )
}
