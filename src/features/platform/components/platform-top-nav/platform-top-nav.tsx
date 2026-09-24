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

import { SectionTopNav, type SectionTopNavItem } from '@/components/layout'
import { paths } from '@/config/paths'
import {
  PERMISSIONS,
  usePermissionSession,
  type PermissionLike,
} from '@/lib/auth'

type PlatformNavItem = SectionTopNavItem & { permission: PermissionLike }

const navItems: PlatformNavItem[] = [
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

export function PlatformTopNav() {
  const session = usePermissionSession()
  const visibleItems = navItems.filter(({ permission }) =>
    session.can(permission),
  )

  return <SectionTopNav items={visibleItems} />
}
