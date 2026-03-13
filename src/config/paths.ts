/**
 * Defines the single source of truth for all application paths.
 * Each entry includes a raw path for react-router and a `getHref` function
 * for typesafe link generation.
 */
export const paths = {
  notFound: {
    path: '/page-not-found',
    getHref: () => '/page-not-found',
  },
  home: {
    path: '/',
    getHref: () => '/',
  },
  dashboard: {
    path: '/dashboard',
    getHref: () => '/dashboard',
  },
  auth: {
    login: {
      path: '/auth/login',
      getHref: (redirectTo?: string | null) =>
        `/auth/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`,
    },
  },
} as const
