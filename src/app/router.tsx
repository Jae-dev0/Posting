import { createBrowserRouter, RouterProvider } from 'react-router'

import { LandingRoute } from './routes/landing'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingRoute />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
