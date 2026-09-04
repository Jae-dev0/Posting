import type Keycloak from 'keycloak-js'

import { paths } from '@/config/paths'

export async function logoutToLogin(client: Keycloak) {
  const redirectUri = `${window.location.origin}${paths.auth.login.getHref()}`
  await client.logout({ redirectUri })
}
