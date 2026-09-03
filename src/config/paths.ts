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
  posting: {
    root: {
      path: '/posting',
      getHref: () => '/posting',
    },
    create: {
      path: '/posting/create',
      getHref: () => '/posting/create',
    },
    history: {
      path: '/posting/history',
      getHref: () => '/posting/history',
    },
    scheduled: {
      path: '/posting/scheduled',
      getHref: () => '/posting/scheduled',
    },
    accounts: {
      path: '/posting/accounts',
      getHref: () => '/posting/accounts',
    },
    users: {
      path: '/posting/users',
      getHref: () => '/posting/users',
    },
  },
} as const
