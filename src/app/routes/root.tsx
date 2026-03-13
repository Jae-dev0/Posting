import { Outlet } from 'react-router'

import { DashboardLayout } from '@/components/layout'
import { useKeycloakAuth } from '@/lib/keycloak'

export function AppRoot() {
  const [user, { keycloak }] = useKeycloakAuth()

  return (
    <DashboardLayout
      user={user}
      enableDrawer={true}
      onLogout={() => {
        void keycloak.logout({
          redirectUri: `${window.location.origin}/auth/login`,
        })
      }}
      // navItems={<DashboardNavLinks />}
    >
      <Outlet />
    </DashboardLayout>
  )
}
