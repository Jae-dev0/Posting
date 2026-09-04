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
import { IconType } from 'react-icons'
import { LuLogOut, LuSend } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import jacLinerLogo from '@/assets/jac-liner-logo.svg'
import { NotificationMenu, UserMenu, UserMenuData } from '@/components/ui'
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
  brandTitle?: string
  brandHref?: string
  brandIcon?: IconType
  roleLabel?: string
  departmentSwitcher?: ReactNode
}

export function DashboardLayout<U extends DashboardLayoutUser>({
  user,
  children,
  onLogout,
  navItems,
  brandTitle = 'Social Media Publisher',
  brandHref = '/',
  brandIcon: BrandIcon = LuSend,
  roleLabel = 'User',
  departmentSwitcher,
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
                    to={brandHref}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          color: 'common.white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <BrandIcon size={14} />
                      </Box>
                      <Typography
                        variant="h6"
                        component={Box}
                        fontWeight={600}
                        sx={{
                          padding: '0px 8px',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: 'border.default',
                        }}
                      >
                        {brandTitle}
                      </Typography>
                    </Stack>
                  </Link>
                  <img src={jacLinerLogo} alt="Jacliner" height={20} />
                  {departmentSwitcher}
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
                  role={roleLabel}
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
                    {roleLabel}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Toolbar>
        {navItems ? (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {navItems}
          </Box>
        ) : null}
      </AppBar>

      <Stack direction="row">
        <ContentContainer>
          <Toolbar />
          {navItems ? (
            <Toolbar
              variant="dense"
              sx={{ minHeight: 48, visibility: 'hidden' }}
            />
          ) : null}
          {children}
        </ContentContainer>
      </Stack>
    </>
  )
}
