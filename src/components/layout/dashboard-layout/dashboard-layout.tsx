import {
  AppBar,
  Button,
  Divider,
  Grid,
  Link,
  Stack,
  styled,
  Toolbar,
  Typography,
} from '@mui/material'
import { ReactNode, useEffect } from 'react'
import { LuLogOut } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { UserMenu, UserMenuData } from '@/components/ui'
import { paths } from '@/config/paths'
import { useDisclosure } from '@/hooks/use-disclosure'

type DashboardLayoutUser = UserMenuData & {
  company: { employeeNumber: string }
}

export const ContentContainer = styled('main')(() => ({
  flexGrow: 1,
  minWidth: 0,
}))

export interface DashboardLayoutProps<U extends DashboardLayoutUser> {
  user: U | null
  enableDrawer?: boolean
  children?: ReactNode
  onLogout?: () => void
  navItems?: ReactNode
}

export function DashboardLayout<U extends DashboardLayoutUser>({
  user,
  children,
  onLogout,
  navItems,
}: DashboardLayoutProps<U>) {
  const { isOpen: isDrawerOpen } = useDisclosure(
    ['true', null].includes(localStorage.getItem('isDrawerOpen')),
  )

  useEffect(() => {
    localStorage.setItem('isDrawerOpen', isDrawerOpen.toString())
  }, [isDrawerOpen])

  return (
    <>
      <AppBar
        position="fixed"
        sx={(theme) => ({
          border: 'none',
          color: 'text.primary',
          // zIndex: theme.zIndex.drawer + 1,
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Toolbar sx={{ '&.MuiToolbar-gutters': { px: 2 } }}>
          <Grid container width="100%">
            <Grid
              direction="row"
              component={Stack}
              alignItems="start"
              justifyContent="center"
              size={{ xs: 4, md: 4, lg: 4 }}
            >
              <Stack direction="row" spacing={2}>
                <Stack
                  spacing={2.5}
                  direction="row"
                  alignItems="center"
                  divider={
                    <Divider orientation="vertical" sx={{ height: 16 }} />
                  }
                >
                  <Link
                    underline="none"
                    component={RouterLink}
                    to={paths.home.getHref()}
                  >
                    <Typography variant="h5" fontWeight={600}>
                      TEMPLATE
                    </Typography>
                  </Link>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              direction="row"
              component={Stack}
              alignItems="center"
              justifyContent="center"
              size={{ xs: 4, md: 4, lg: 4 }}
            >
              {/* <EmployeeSearchMenu /> */}
            </Grid>
            <Grid size={{ xs: 4, md: 4, lg: 4 }}>
              <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                alignContent="center"
                justifyContent="flex-end"
              >
                <UserMenu
                  user={user}
                  employeeNumber={user?.company.employeeNumber}
                  role="Super Admin"
                  footer={
                    <Button
                      onClick={onLogout}
                      startIcon={<LuLogOut />}
                      color="error"
                      variant="text"
                      fullWidth
                      sx={{ justifyContent: 'left' }}
                    >
                      Logout
                    </Button>
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
        {navItems}
      </AppBar>

      <Stack direction="row">
        <ContentContainer>
          <Toolbar sx={{ mb: 9 }} />
          {children}
        </ContentContainer>
      </Stack>
    </>
  )
}
