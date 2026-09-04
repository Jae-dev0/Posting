import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import {
  LuFileText,
  LuHouse,
  LuImage,
  LuMenu,
  LuSettings,
} from 'react-icons/lu'
import { Link as RouterLink, useLocation } from 'react-router'

import { paths } from '@/config/paths'
import {
  PERMISSIONS,
  usePermissionSession,
  type PermissionLike,
} from '@/lib/auth'

type NavItem = {
  label: string
  href: string
  icon: typeof LuHouse
  permission?: PermissionLike | PermissionLike[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: paths.cms.dashboard.getHref(),
    icon: LuHouse,
    permission: PERMISSIONS.CMS_VIEW,
  },
  {
    label: 'Pages',
    href: paths.cms.pages.getHref(),
    icon: LuFileText,
    permission: PERMISSIONS.CMS_VIEW,
  },
  {
    label: 'Media',
    href: paths.cms.media.getHref(),
    icon: LuImage,
    permission: PERMISSIONS.CMS_VIEW,
  },
  {
    label: 'Navigation',
    href: paths.cms.navigation.getHref(),
    icon: LuMenu,
    permission: PERMISSIONS.CMS_EDIT,
  },
  {
    label: 'Website Settings',
    href: paths.cms.settings.getHref(),
    icon: LuSettings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function CmsSidebar() {
  const { pathname } = useLocation()
  const session = usePermissionSession()

  const visibleItems = navItems.filter(
    (item) =>
      !item.permission ||
      session.canAny(
        Array.isArray(item.permission) ? item.permission : [item.permission],
      ),
  )

  return (
    <Paper
      variant="outlined"
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        borderRadius: 0,
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        minHeight: { md: 'calc(100vh - 64px)' },
      }}
    >
      <Stack spacing={1} sx={{ p: 2 }}>
        <Typography variant="overline" color="text.secondary">
          Company CMS
        </Typography>
        <List disablePadding>
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <ListItemButton
                key={href}
                component={RouterLink}
                to={href}
                selected={active}
                sx={{ mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{
                    primary: {
                      variant: 'body2',
                      fontWeight: active ? 600 : 500,
                    },
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Stack>
    </Paper>
  )
}
