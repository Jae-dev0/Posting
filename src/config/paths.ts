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
<<<<<<< HEAD
  platform: {
    root: {
      path: '/platform',
      getHref: () => '/platform',
    },
    dashboard: {
      path: '/platform/dashboard',
      getHref: () => '/platform/dashboard',
    },
    companies: {
      path: '/platform/companies',
      getHref: () => '/platform/companies',
    },
    company: {
      path: '/platform/companies/:id',
      getHref: (id: number | string) => `/platform/companies/${id}`,
    },
    websites: {
      path: '/platform/websites',
      getHref: () => '/platform/websites',
    },
    users: {
      path: '/platform/users',
      getHref: () => '/platform/users',
    },
    roles: {
      path: '/platform/roles',
      getHref: () => '/platform/roles',
      roles: {
        path: '/platform/roles/roles',
        segment: 'roles',
        getHref: () => '/platform/roles/roles',
      },
      permissionGroups: {
        path: '/platform/roles/permission-groups',
        segment: 'permission-groups',
        getHref: () => '/platform/roles/permission-groups',
      },
    },
    media: {
      path: '/platform/media',
      getHref: () => '/platform/media',
    },
    audit: {
      path: '/platform/audit',
      getHref: () => '/platform/audit',
    },
    settings: {
      path: '/platform/settings',
      getHref: () => '/platform/settings',
    },
  },
  cms: {
    root: {
      path: '/cms',
      getHref: () => '/cms',
    },
    dashboard: {
      path: '/cms/dashboard',
      getHref: () => '/cms/dashboard',
    },
    pages: {
      path: '/cms/pages',
      getHref: () => '/cms/pages',
    },
    media: {
      path: '/cms/media',
      getHref: () => '/cms/media',
    },
    navigation: {
      path: '/cms/navigation',
      getHref: () => '/cms/navigation',
    },
    settings: {
      path: '/cms/settings',
      getHref: () => '/cms/settings',
    },
    users: {
      path: '/cms/users',
      getHref: () => '/cms/users',
    },
  },
=======
>>>>>>> origin/main
  posting: {
    root: {
      path: '/posting',
      getHref: () => '/posting',
    },
    create: {
      path: '/posting/create',
<<<<<<< HEAD
      getHref: (postId?: number | string) =>
        postId === undefined
          ? '/posting/create'
          : `/posting/create?postId=${postId}`,
=======
      getHref: () => '/posting/create',
>>>>>>> origin/main
    },
    history: {
      path: '/posting/history',
      getHref: () => '/posting/history',
    },
    scheduled: {
      path: '/posting/scheduled',
      getHref: () => '/posting/scheduled',
    },
<<<<<<< HEAD
    drafts: {
      path: '/posting/drafts',
      getHref: () => '/posting/drafts',
    },
    calendar: {
      path: '/posting/calendar',
      getHref: () => '/posting/calendar',
    },
    team: {
      path: '/posting/team',
      getHref: () => '/posting/team',
    },
=======
>>>>>>> origin/main
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
