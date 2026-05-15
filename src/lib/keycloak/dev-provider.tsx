import { ReactNode, useMemo } from 'react'

import { KeycloakContext } from './context'

/**
 * A mock Keycloak user used during development when auth bypass is enabled.
 * Edit these values if your UI logic depends on specific user/company data.
 */
const MOCK_TOKEN_PARSED = {
  sub: 'dev-bypass-user-id',
  name: 'Dev User',
  given_name: 'Dev',
  family_name: 'User',
  email: 'dev@localhost',
  email_verified: true,
  preferred_username: 'dev.user',
  employee_number: 'DEV-001',
  company_id: 1,
  company_active_id: 1,
  azp: 'crew-app',
  scope: 'openid profile email company',
} as const

/**
 * A stub that satisfies the Keycloak instance shape used throughout the app.
 * All auth operations (login, logout, updateToken) are no-ops.
 */
const mockKeycloak = {
  authenticated: true,
  token: 'dev-bypass-token',
  tokenParsed: MOCK_TOKEN_PARSED,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  updateToken: () => Promise.resolve(false),
  // These may be accessed but are safe as undefined/no-ops
  init: () => Promise.resolve(true),
  register: () => Promise.resolve(),
  accountManagement: () => Promise.resolve(),
  hasRealmRole: () => true,
  hasResourceRole: () => true,
  loadUserProfile: () => Promise.resolve({}),
  loadUserInfo: () => Promise.resolve({}),
  isTokenExpired: () => false,
  clearToken: () => {},
  onTokenExpired: undefined,
  onAuthSuccess: undefined,
  onAuthError: undefined,
  onAuthRefreshSuccess: undefined,
  onAuthRefreshError: undefined,
  onAuthLogout: undefined,
  onReady: undefined,
  subject: MOCK_TOKEN_PARSED.sub,
  realmAccess: { roles: ['user'] },
  resourceAccess: {},
  refreshToken: 'dev-bypass-refresh-token',
  refreshTokenParsed: {},
  idToken: 'dev-bypass-id-token',
  idTokenParsed: MOCK_TOKEN_PARSED,
  timeSkew: 0,
  loginRequired: false,
  authServerUrl: 'http://localhost',
  realm: 'dev',
  clientId: 'crew-app',
  responseMode: 'fragment' as const,
  flow: 'standard' as const,
  responseType: 'code' as const,
} as unknown as import('keycloak-js').default

export type DevKeycloakProviderProps = {
  children?: ReactNode
}

/**
 * Development-only provider that replaces KeycloakProvider when
 * VITE_APP_AUTH_BYPASS is enabled. Skips all real Keycloak initialization
 * and provides a mock authenticated context so FE developers can work
 * on the UI without a running Keycloak instance.
 *
 * ⚠️  This provider should NEVER be used in production — it is gated
 *     behind `import.meta.env.DEV` in the app provider.
 */
export function DevKeycloakProvider({ children }: DevKeycloakProviderProps) {
  const value = useMemo(
    () => ({
      keycloak: mockKeycloak,
      isAuthenticated: true,
      isPending: false,
      isError: false,
      error: undefined,
      token: { isValid: true, missingFields: [] },
    }),
    [],
  )

  if (import.meta.env.DEV) {
    console.warn(
      '[Auth Bypass] Running with mock authentication. Keycloak is NOT initialized.',
    )
  }

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  )
}
