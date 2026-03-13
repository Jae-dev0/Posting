import { CircularProgress } from '@mui/material'
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
import { useKeycloak } from '@/lib/keycloak'

import { Login } from './routes/auth'
import { Dashboard } from './routes/dashboard'
import { AppRoot } from './routes/root'

const AuthAppRoot = () => <AppRoot />

const LoginRedirect = () => {
  const location = useLocation()
  return <Navigate to={paths.auth.login.getHref(location.pathname)} replace />
}

const HomeRedirect = () => {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  return <Navigate to={redirectTo ?? paths.notFound.getHref()} replace />
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
    children: [{ index: true, element: <Dashboard /> }],
  },
  {
    path: paths.dashboard.path,
    element: <AuthAppRoot />,
  },
  {
    path: '*',
    element: <HomeRedirect />,
  },
])

export function AppRouter() {
  const { isPending, isAuthenticated } = useKeycloak()

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
