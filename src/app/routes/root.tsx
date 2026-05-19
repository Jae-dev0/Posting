import { Outlet } from 'react-router'

import { DashboardLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { useKeycloakAuth } from '@/lib/keycloak'

import { DashboardNavLinks } from './nav-links'

export function AppRoot() {
  const [user, { keycloak }] = useKeycloakAuth()
  return (
    <DashboardLayout
      user={user}
      enableDrawer={true}
      onLogout={() => {
        void keycloak.logout({
          redirectUri: `${window.location.origin}${paths.auth.login.getHref()}`,
        })
      }}
      navItems={<DashboardNavLinks />}
    >
      <Outlet />
    </DashboardLayout>
  )
}
