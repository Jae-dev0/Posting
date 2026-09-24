import {
  AppBar,
  Box,
  Button,
<<<<<<< HEAD
=======
  Grid,
>>>>>>> origin/main
  Link,
  Stack,
  styled,
  Toolbar,
  Typography,
} from '@mui/material'
<<<<<<< HEAD
import { ReactNode } from 'react'
import { IconType } from 'react-icons'
=======
import { ReactNode, useEffect } from 'react'
>>>>>>> origin/main
import { LuLogOut, LuSend } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import jacLinerLogo from '@/assets/jac-liner-logo.svg'
import { NotificationMenu, UserMenu, UserMenuData } from '@/components/ui'
<<<<<<< HEAD
=======
import { paths } from '@/config/paths'
import { useDisclosure } from '@/hooks/use-disclosure'

>>>>>>> origin/main
type DashboardLayoutUser = UserMenuData & {
  company: { employeeNumber: string }
}

export const ContentContainer = styled('main')(() => ({
  flexGrow: 1,
  minWidth: 0,
}))

export interface DashboardLayoutProps<U extends DashboardLayoutUser> {
  user: U | null
<<<<<<< HEAD
  children?: ReactNode
  onLogout?: () => void
  navItems?: ReactNode
  brandTitle?: string
  brandHref?: string
  brandIcon?: IconType
  roleLabel?: string
  departmentSwitcher?: ReactNode
=======
  enableDrawer?: boolean
  children?: ReactNode
  onLogout?: () => void
  navItems?: ReactNode
>>>>>>> origin/main
}

export function DashboardLayout<U extends DashboardLayoutUser>({
  user,
  children,
  onLogout,
  navItems,
<<<<<<< HEAD
  brandTitle = 'Social Media Publisher',
  brandHref = '/',
  brandIcon: BrandIcon = LuSend,
  roleLabel = 'User',
  departmentSwitcher,
}: DashboardLayoutProps<U>) {
=======
}: DashboardLayoutProps<U>) {
  const { isOpen: isDrawerOpen } = useDisclosure(
    ['true', null].includes(localStorage.getItem('isDrawerOpen')),
  )

  useEffect(() => {
    localStorage.setItem('isDrawerOpen', isDrawerOpen.toString())
  }, [isDrawerOpen])

>>>>>>> origin/main
  return (
    <>
      <AppBar
        position="fixed"
        sx={(theme) => ({
          border: 'none',
          color: 'text.primary',
<<<<<<< HEAD
          bgcolor: theme.palette.background.paper,
        })}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 60, sm: 68 },
            gap: 2,
            '&.MuiToolbar-gutters': { px: { xs: 1.5, sm: 2 } },
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1, sm: 2 }}
            sx={{ minWidth: 0, flex: '1 1 auto' }}
          >
            <Link underline="none" component={RouterLink} to={brandHref}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    color: 'primary.main',
                    alignItems: 'center',
                  }}
                >
                  <BrandIcon size={18} aria-hidden="true" />
                </Box>
                <Typography
                  component="span"
                  sx={{
                    px: 1,
                    py: 0.4,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0.75,
                    color: '#159f9a',
                    fontSize: { xs: '0.8rem', sm: '1rem' },
                    fontWeight: 700,
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {brandTitle.toUpperCase()}
                </Typography>
              </Stack>
            </Link>
            <Box
              component="img"
              src={jacLinerLogo}
              alt="Jacliner Inc."
              sx={{
                display: { xs: 'none', md: 'block' },
                width: 180,
                height: 24,
                objectFit: 'contain',
              }}
            />
            {departmentSwitcher}
          </Stack>

          <Stack
            spacing={0.75}
            direction="row"
            alignItems="center"
            sx={{ flex: '0 0 auto' }}
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
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body1" fontWeight={600} component={Box}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" component={Box}>
                {roleLabel}
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
        {navItems ? (
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
=======
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
                    to={paths.posting.create.getHref()}
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
                        <LuSend size={14} />
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
                        Social Media Publisher
                      </Typography>
                    </Stack>
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
        {navItems ? (
          <Box sx={{ border: '1px solid', borderColor: 'divider' }}>
>>>>>>> origin/main
            {navItems}
          </Box>
        ) : null}
      </AppBar>

      <Stack direction="row">
        <ContentContainer>
          <Toolbar />
<<<<<<< HEAD
          {navItems ? (
            <Toolbar
              variant="dense"
              sx={{ minHeight: 48, visibility: 'hidden' }}
            />
          ) : null}
=======
>>>>>>> origin/main
          {children}
        </ContentContainer>
      </Stack>
    </>
  )
}
