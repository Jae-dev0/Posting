import {
  AppBar,
  Box,
  Button,
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

import jacLinerLogo from '@/assets/jac-liner-logo.svg'
import { NotificationMenu, UserMenu, UserMenuData } from '@/components/ui'
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
        <Toolbar sx={{ '&.MuiToolbar-gutters': { px: 3 } }}>
          <Grid container width="100%">
            <Grid
              direction="row"
              component={Stack}
              alignItems="start"
              justifyContent="center"
              size={{ xs: 6, md: 6, lg: 6 }}
            >
              <Stack direction="row" spacing={2}>
                <Stack spacing={2.5} direction="row" alignItems="center">
                  <Link
                    underline="none"
                    component={RouterLink}
                    to={paths.home.getHref()}
                  >
                    <Typography
                      variant="h6"
                      component={Box}
                      fontWeight={600}
                      sx={{
                        padding: '0px 8px',
                        borderRadius: '8px',
                        textTransform: 'uppercase',
                        border: '1px solid #CDD7E1',
                      }}
                    >
                      Template Management System
                    </Typography>
                  </Link>
                  <img src={jacLinerLogo} alt="FMS" height={20} />
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 6, md: 6, lg: 6 }}>
              <Stack
                spacing={1}
                direction="row"
                alignItems="center"
                alignContent="center"
                justifyContent="flex-end"
              >
                <NotificationMenu />
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
                <Box>
                  <Typography variant="body1" fontWeight={600} component={Box}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body2" component={Box}>
                    Position
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
        <Box sx={{ border: '1px solid', borderColor: 'divider' }}>
          {navItems}
        </Box>
      </AppBar>

      <Stack direction="row">
        <ContentContainer>
          <Toolbar sx={{ mb: 5 }} />
          {children}
        </ContentContainer>
      </Stack>
    </>
  )
}
