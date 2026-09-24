<<<<<<< HEAD
import { LuBuilding2, LuGlobe, LuMegaphone } from 'react-icons/lu'
import { Outlet, useLocation, useNavigate } from 'react-router'

import {
  DashboardLayout,
  DepartmentTopNav,
  buildDepartmentTopNavItems,
} from '@/components/layout'
import { paths } from '@/config/paths'
import { CmsTopNav } from '@/features/cms'
import { PlatformTopNav } from '@/features/platform'
import { PostingTopNav } from '@/features/posting'
import {
  getDepartmentFromPath,
  useAuthUser,
  usePermissionSession,
  useRoleLabel,
} from '@/lib/auth'
=======
import { Outlet, useNavigate } from 'react-router'

import { DashboardLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { useAuthUser } from '@/lib/auth'
>>>>>>> origin/main

export function AppRoot() {
  const [user, { logout }] = useAuthUser()
  const navigate = useNavigate()
<<<<<<< HEAD
  const { pathname } = useLocation()
  const session = usePermissionSession()
  const roleLabel = useRoleLabel()
  const department = getDepartmentFromPath(pathname)

  const brand =
    department === 'platform'
      ? {
          title: 'Platform Admin',
          href: paths.platform.dashboard.getHref(),
          icon: LuBuilding2,
        }
      : department === 'cms'
        ? {
            title: 'Website CMS',
            href: paths.cms.dashboard.getHref(),
            icon: LuGlobe,
          }
        : {
            title: 'Marketing',
            href: paths.posting.create.getHref(),
            icon: LuMegaphone,
          }

  const departmentNavItems = buildDepartmentTopNavItems({
    canAccessPlatform: session.canAccessPlatform,
    canAccessCms: session.canAccessCms,
    canAccessMarketing: session.canAccessMarketing,
  })

  const showDepartmentSwitcher = departmentNavItems.length > 1
  const topNav =
    department === 'platform' && session.canAccessPlatform ? (
      <PlatformTopNav />
    ) : department === 'cms' && session.canAccessCms ? (
      <CmsTopNav />
    ) : department === 'marketing' && session.canAccessMarketing ? (
      <PostingTopNav />
    ) : undefined
=======
>>>>>>> origin/main

  return (
    <DashboardLayout
      user={
        user
          ? {
              ...user,
              company: {
                employeeNumber: `USR-${user.id.toString().padStart(4, '0')}`,
              },
            }
          : null
      }
<<<<<<< HEAD
      brandTitle={brand.title}
      brandHref={brand.href}
      brandIcon={brand.icon}
      roleLabel={roleLabel}
      departmentSwitcher={
        showDepartmentSwitcher ? (
          <DepartmentTopNav
            items={departmentNavItems}
            activeDepartment={department}
          />
        ) : undefined
      }
      navItems={topNav}
=======
      enableDrawer={true}
>>>>>>> origin/main
      onLogout={() => {
        logout()
        void navigate(paths.auth.login.getHref(), { replace: true })
      }}
    >
      <Outlet />
    </DashboardLayout>
  )
}
