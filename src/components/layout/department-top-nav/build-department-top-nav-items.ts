import type { IconType } from 'react-icons'
import { LuBuilding2, LuGlobe, LuMegaphone } from 'react-icons/lu'

import { paths } from '@/config/paths'
import type { AppDepartment } from '@/lib/auth'

export type DepartmentTopNavItem = {
  department: AppDepartment
  label: string
  href: string
  icon: IconType
}

export function buildDepartmentTopNavItems(access: {
  canAccessPlatform: boolean
  canAccessCms: boolean
  canAccessMarketing: boolean
}): DepartmentTopNavItem[] {
  return [
    ...(access.canAccessPlatform
      ? [
          {
            department: 'platform' as const,
            label: 'Platform',
            href: paths.platform.dashboard.getHref(),
            icon: LuBuilding2,
          },
        ]
      : []),
    ...(access.canAccessCms
      ? [
          {
            department: 'cms' as const,
            label: 'CMS',
            href: paths.cms.dashboard.getHref(),
            icon: LuGlobe,
          },
        ]
      : []),
    ...(access.canAccessMarketing
      ? [
          {
            department: 'marketing' as const,
            label: 'Marketing',
            href: paths.dashboard.getHref(),
            icon: LuMegaphone,
          },
        ]
      : []),
  ]
}
