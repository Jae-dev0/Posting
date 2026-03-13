import {
  Avatar,
  AvatarProps,
  Box,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuProps,
  Stack,
  StackProps,
  styled,
  Typography,
} from '@mui/material'
import { blue } from '@mui/material/colors'
import { ReactNode, useState } from 'react'

const StyledBox = styled(Box)(({ theme }) => {
  return {
    width: 280,
    maxWidth: '100%',
    padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  }
})

const StyledChip = styled(Chip)(({ theme }) => {
  return {
    padding: `0 ${theme.spacing(1)}`,
    borderRadius: 1,
    backgroundColor: '#e3f2fd',
    border: 'none',
  }
})

export type UserMenuData = {
  username: string
  firstName: string
  lastName: string
  fullname: string
  email: string
}

export type UserMenuProps<U extends UserMenuData> = {
  user: U | null
  employeeNumber: ReactNode | null
  role?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  avatarProps?: AvatarProps
  menuProps?: MenuProps
  stackProps?: StackProps
}

export function UserMenu<U extends UserMenuData>({
  user,
  employeeNumber,
  role,
  action,
  footer,
  avatarProps,
  menuProps,
  stackProps,
}: UserMenuProps<U>) {
  const [anchorElUser, setAnchorElUser] = useState<HTMLElement | null>(null)
  const isMenuOpen = Boolean(anchorElUser)

  return (
    <>
      <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
        <Avatar
          color="primary"
          {...avatarProps}
          sx={{ bgcolor: blue[600], ...avatarProps?.sx }}
        >
          {user ? user.firstName.trimStart().charAt(0) : undefined}
        </Avatar>
      </IconButton>

      <Menu
        id="menu-appbar"
        open={isMenuOpen}
        anchorEl={anchorElUser}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        onClose={() => setAnchorElUser(null)}
        elevation={1}
        {...menuProps}
      >
        <Stack
          spacing={1}
          direction="column"
          divider={<Divider />}
          component={StyledBox}
          {...stackProps}
        >
          <RoleDisplay role={role} />

          {user && (
            <Stack direction="column" alignItems="start" spacing={0.5}>
              <UserContent user={user} />
              {employeeNumber && (
                <StyledChip
                  label={employeeNumber}
                  variant="outlined"
                  color="primary"
                  size="small"
                />
              )}
            </Stack>
          )}

          {action}

          {footer}
        </Stack>
      </Menu>
    </>
  )
}

const RoleDisplay = ({ role }: { role: ReactNode }) => {
  if (typeof role === 'string') {
    return (
      <Typography variant="body2" color="textSecondary">
        {role}
      </Typography>
    )
  }

  return role
}

const UserContent = ({ user }: { user: UserMenuData }) => {
  return (
    <>
      <Typography variant="body1" color="textPrimary" fontWeight={500}>
        {user.fullname}
        <Typography variant="caption" color="textSecondary" marginLeft={1}>
          {user.username}
        </Typography>
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {user.email}
      </Typography>
    </>
  )
}
