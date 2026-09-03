import { Outlet, useNavigate } from 'react-router'

import { DashboardLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { useAuthUser } from '@/lib/auth'

export function AppRoot() {
  const [user, { logout }] = useAuthUser()
  const navigate = useNavigate()

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
      enableDrawer={true}
      onLogout={() => {
        logout()
        void navigate(paths.auth.login.getHref(), { replace: true })
      }}
    >
      <Outlet />
    </DashboardLayout>
  )
}
