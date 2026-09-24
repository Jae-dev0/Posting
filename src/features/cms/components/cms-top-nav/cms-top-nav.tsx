import {
  LuFileText,
  LuHouse,
  LuImage,
  LuMenu,
  LuSettings,
  LuUsers,
} from 'react-icons/lu'

import { SectionTopNav, type SectionTopNavItem } from '@/components/layout'
import { paths } from '@/config/paths'
import {
  PERMISSIONS,
  usePermissionSession,
  type PermissionLike,
} from '@/lib/auth'

type CmsNavItem = SectionTopNavItem & { permission: PermissionLike }

const navItems: CmsNavItem[] = [
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
    label: 'Users',
    href: paths.cms.users.getHref(),
    icon: LuUsers,
    permission: PERMISSIONS.USER_VIEW,
  },
  {
    label: 'Website Settings',
    href: paths.cms.settings.getHref(),
    icon: LuSettings,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
]

export function CmsTopNav() {
  const session = usePermissionSession()
  const visibleItems = navItems.filter(({ permission }) =>
    session.can(permission),
  )

  return <SectionTopNav items={visibleItems} />
}
