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
  LuBuilding2,
  LuChartColumn,
  LuClipboardList,
  LuGlobe,
  LuImage,
  LuSettings,
  LuShield,
  LuUsers,
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
  icon: typeof LuChartColumn
  permission?: PermissionLike | PermissionLike[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: paths.platform.dashboard.getHref(),
    icon: LuChartColumn,
    permission: PERMISSIONS.PLATFORM_DASHBOARD,
  },
  {
    label: 'Companies',
    href: paths.platform.companies.getHref(),
    icon: LuBuilding2,
    permission: PERMISSIONS.COMPANY_VIEW,
  },
  {
    label: 'Websites',
    href: paths.platform.websites.getHref(),
    icon: LuGlobe,
    permission: PERMISSIONS.COMPANY_VIEW,
  },
  {
    label: 'Users',
    href: paths.platform.users.getHref(),
    icon: LuUsers,
    permission: PERMISSIONS.USER_VIEW,
  },
  {
    label: 'Roles & Permissions',
    href: paths.platform.roles.getHref(),
    icon: LuShield,
    permission: PERMISSIONS.ROLE_VIEW,
  },
  {
    label: 'Media',
    href: paths.platform.media.getHref(),
    icon: LuImage,
    permission: PERMISSIONS.CMS_VIEW,
  },
  {
    label: 'Audit Logs',
    href: paths.platform.audit.getHref(),
    icon: LuClipboardList,
    permission: PERMISSIONS.AUDIT_VIEW,
  },
  {
    label: 'System Settings',
    href: paths.platform.settings.getHref(),
    icon: LuSettings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PlatformSidebar() {
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
        width: { xs: '100%', md: 260 },
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
          Platform Admin
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
