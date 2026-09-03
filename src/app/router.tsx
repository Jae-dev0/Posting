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
import { paths } from '@/config/paths'
import { PostingLayout } from '@/features/posting'
import { useAuth, useCanManageAccounts } from '@/lib/auth'

import { Login } from './routes/auth'
import { Dashboard } from './routes/dashboard'
import {
  ConnectedAccountsPage,
  CreatePostPage,
  PostHistoryPage,
  ScheduledPostsPage,
  UserAccountsPage,
} from './routes/posting'
import { AppRoot } from './routes/root'

const AuthAppRoot = () => <AppRoot />

const LoginRedirect = () => {
  const { pathname } = useLocation()
  return <Navigate to={paths.auth.login.getHref(pathname)} replace />
}

const HomeRedirect = () => {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  return <Navigate to={redirectTo ?? paths.notFound.getHref()} replace />
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
    children: [
      {
        index: true,
        element: <Navigate to={paths.posting.create.getHref()} replace />,
      },
    ],
  },
  {
    path: paths.posting.root.path,
    element: <AuthAppRoot />,
    children: [
      {
        element: <PostingLayout />,
        children: [
          {
            path: 'create',
            element: <CreatePostPage />,
          },
          {
            path: 'history',
            element: <PostHistoryPage />,
          },
          {
            path: 'scheduled',
            element: <ScheduledPostsPage />,
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
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: '*',
    element: <HomeRedirect />,
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
