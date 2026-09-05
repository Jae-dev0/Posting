import { CircularProgress } from '@mui/material'
import { ReactNode } from 'react'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  useSearchParams,
} from 'react-router'

import { CenterLayout, PublicLayout } from '@/components/layout'
import { PageNotFound } from '@/components/ui/page-not-found'
import { RequirePermission } from '@/components/ui/require-permission'
import { paths } from '@/config/paths'
import { CmsLayout } from '@/features/cms'
import { PlatformLayout } from '@/features/platform'
import { PostingLayout } from '@/features/posting'
import {
  getDepartmentHomePath,
  PERMISSIONS,
  useAuth,
  useCanManageAccounts,
  useHasCmsAccess,
  useHasMarketingAccess,
  useHasPlatformAccess,
  useHomeDepartment,
} from '@/lib/auth'

import {
  CmsDashboardPage,
  CmsMediaPage,
  CmsNavigationPage,
  CmsPagesPage,
  CmsSettingsPage,
  CmsUsersPage,
} from './routes/cms'
import { Login } from './routes/auth'
import { Dashboard } from './routes/dashboard'
import {
  PlatformAuditPage,
  PlatformCompaniesPage,
  PlatformDashboardPage,
  PlatformPermissionGroupsPage,
  PlatformPlaceholderPage,
  PlatformRolesListPage,
  PlatformRolesPage,
  PlatformUsersPage,
} from './routes/platform'
import {
  ConnectedAccountsPage,
  ContentCalendarPage,
  CreatePostPage,
  DraftsPage,
  PostHistoryPage,
  ScheduledPostsPage,
  TeamPermissionsPage,
  UserAccountsPage,
} from './routes/posting'
import { AppRoot } from './routes/root'

const AuthAppRoot = () => <AppRoot />

const LoginRedirect = () => {
  const { pathname } = useLocation()
  return <Navigate to={paths.auth.login.getHref(pathname)} replace />
}

const RoleHomeRedirect = () => {
  const department = useHomeDepartment()
  return <Navigate to={getDepartmentHomePath(department)} replace />
}

const CatchAllRedirect = () => {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const department = useHomeDepartment()
  if (
    redirectTo?.startsWith('/platform') ||
    redirectTo?.startsWith('/cms') ||
    redirectTo?.startsWith('/posting') ||
    redirectTo === '/dashboard'
  ) {
    return <Navigate to={redirectTo} replace />
  }
  return <Navigate to={getDepartmentHomePath(department)} replace />
}

const RequirePlatformAccess = ({ children }: { children: ReactNode }) => {
  const hasPlatform = useHasPlatformAccess()
  const department = useHomeDepartment()
  if (!hasPlatform) {
    return <Navigate to={getDepartmentHomePath(department)} replace />
  }
  return children
}

const RequireCmsAccess = ({ children }: { children: ReactNode }) => {
  const hasCms = useHasCmsAccess()
  const department = useHomeDepartment()
  if (!hasCms) {
    return <Navigate to={getDepartmentHomePath(department)} replace />
  }
  return children
}

const RequireMarketingAccess = ({ children }: { children: ReactNode }) => {
  const hasMarketing = useHasMarketingAccess()
  const department = useHomeDepartment()
  if (!hasMarketing) {
    return <Navigate to={getDepartmentHomePath(department)} replace />
  }
  return children
}

const RequireAccountManagement = ({ children }: { children: ReactNode }) => {
  const canManageAccounts = useCanManageAccounts()

  if (!canManageAccounts) {
    return <Navigate to={paths.posting.create.getHref()} replace />
  }

  return children
}

const guestRoutes = createBrowserRouter([
  {
    path: paths.auth.login.path,
    element: <PublicLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '*',
    element: <LoginRedirect />,
  },
])

const protectedRoutes = createBrowserRouter([
  {
    path: paths.notFound.path,
    element: <AuthAppRoot />,
    children: [{ index: true, element: <PageNotFound /> }],
  },
  {
    path: paths.home.path,
    element: <AuthAppRoot />,
    children: [{ index: true, element: <RoleHomeRedirect /> }],
  },
  {
    path: paths.platform.root.path,
    element: <AuthAppRoot />,
    children: [
      {
        element: (
          <RequirePlatformAccess>
            <PlatformLayout />
          </RequirePlatformAccess>
        ),
        children: [
          {
            index: true,
            element: (
              <Navigate to={paths.platform.dashboard.getHref()} replace />
            ),
          },
          {
            path: 'dashboard',
            element: (
              <RequirePermission permission={PERMISSIONS.PLATFORM_DASHBOARD}>
                <PlatformDashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: 'companies',
            element: (
              <RequirePermission permission={PERMISSIONS.COMPANY_VIEW}>
                <PlatformCompaniesPage />
              </RequirePermission>
            ),
          },
          {
            path: 'websites',
            element: (
              <RequirePermission permission={PERMISSIONS.COMPANY_VIEW}>
                <PlatformPlaceholderPage
                  title="Websites"
                  description="Primary websites are created with each company. Manage page content in Company CMS."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'users',
            element: (
              <RequirePermission permission={PERMISSIONS.USER_VIEW}>
                <PlatformUsersPage />
              </RequirePermission>
            ),
          },
          {
            path: 'roles',
            element: (
              <RequirePermission permission={PERMISSIONS.ROLE_VIEW}>
                <PlatformRolesPage />
              </RequirePermission>
            ),
            children: [
              {
                index: true,
                element: (
                  <Navigate
                    to={paths.platform.roles.roles.getHref()}
                    replace
                  />
                ),
              },
              {
                path: 'roles',
                element: <PlatformRolesListPage />,
              },
              {
                path: 'permission-groups',
                element: <PlatformPermissionGroupsPage />,
              },
            ],
          },
          {
            path: 'media',
            element: (
              <RequirePermission permission={PERMISSIONS.CMS_VIEW}>
                <PlatformPlaceholderPage
                  title="Media"
                  description="Company media is tenant-isolated under Company CMS → Media."
                />
              </RequirePermission>
            ),
          },
          {
            path: 'audit',
            element: (
              <RequirePermission permission={PERMISSIONS.AUDIT_VIEW}>
                <PlatformAuditPage />
              </RequirePermission>
            ),
          },
          {
            path: 'settings',
            element: (
              <RequirePermission permission={PERMISSIONS.SETTINGS_VIEW}>
                <PlatformPlaceholderPage
                  title="System Settings"
                  description="Platform system settings will expand here. RBAC catalog is managed under Roles & Permissions."
                />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
  {
    path: paths.cms.root.path,
    element: <AuthAppRoot />,
    children: [
      {
        element: (
          <RequireCmsAccess>
            <CmsLayout />
          </RequireCmsAccess>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={paths.cms.dashboard.getHref()} replace />,
          },
          {
            path: 'dashboard',
            element: (
              <RequirePermission permission={PERMISSIONS.CMS_VIEW}>
                <CmsDashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: 'pages',
            element: (
              <RequirePermission permission={PERMISSIONS.CMS_VIEW}>
                <CmsPagesPage />
              </RequirePermission>
            ),
          },
          {
            path: 'media',
            element: (
              <RequirePermission permission={PERMISSIONS.CMS_VIEW}>
                <CmsMediaPage />
              </RequirePermission>
            ),
          },
          {
            path: 'navigation',
            element: (
              <RequirePermission permission={PERMISSIONS.CMS_VIEW}>
                <CmsNavigationPage />
              </RequirePermission>
            ),
          },
          {
            path: 'settings',
            element: (
              <RequirePermission permission={PERMISSIONS.SETTINGS_VIEW}>
                <CmsSettingsPage />
              </RequirePermission>
            ),
          },
          {
            path: 'users',
            element: (
              <RequirePermission permission={PERMISSIONS.USER_VIEW}>
                <CmsUsersPage />
              </RequirePermission>
            ),
          },
        ],
      },
    ],
  },
  {
    path: paths.posting.root.path,
    element: <AuthAppRoot />,
    children: [
      {
        element: (
          <RequireMarketingAccess>
            <PostingLayout />
          </RequireMarketingAccess>
        ),
        children: [
          { path: 'create', element: <CreatePostPage /> },
          { path: 'history', element: <PostHistoryPage /> },
          { path: 'scheduled', element: <ScheduledPostsPage /> },
          { path: 'drafts', element: <DraftsPage /> },
          { path: 'calendar', element: <ContentCalendarPage /> },
          {
            path: 'team',
            element: (
              <RequireAccountManagement>
                <TeamPermissionsPage />
              </RequireAccountManagement>
            ),
          },
          {
            path: 'accounts',
            element: (
              <RequireAccountManagement>
                <ConnectedAccountsPage />
              </RequireAccountManagement>
            ),
          },
          {
            path: 'users',
            element: (
              <RequireAccountManagement>
                <UserAccountsPage />
              </RequireAccountManagement>
            ),
          },
          {
            index: true,
            element: <Navigate to={paths.posting.create.getHref()} replace />,
          },
        ],
      },
    ],
  },
  {
    path: paths.dashboard.path,
    element: <AuthAppRoot />,
    children: [
      {
        index: true,
        element: (
          <RequireMarketingAccess>
            <Dashboard />
          </RequireMarketingAccess>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <CatchAllRedirect />,
  },
])

export function AppRouter() {
  const { isPending, isAuthenticated } = useAuth()

  if (isPending) {
    return (
      <CenterLayout>
        <CircularProgress color="primary" />
      </CenterLayout>
    )
  }

  const router = isAuthenticated ? protectedRoutes : guestRoutes
  return <RouterProvider router={router} />
}
