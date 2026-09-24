import {
  Alert,
<<<<<<< HEAD
  Button,
  Chip,
  Skeleton,
=======
  Box,
  Chip,
  CircularProgress,
  IconButton,
>>>>>>> origin/main
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
<<<<<<< HEAD
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import { EmptyState } from '@/components/layout'
import type { Status } from '@/types/common'
import { formatDate } from '@/utils'
=======
import dayjs from 'dayjs'
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import type { Status } from '@/types/common'
>>>>>>> origin/main

import type { ManagedUser } from '../../api'
import { USER_ROLE, getUserRoleLabel } from '../../constants'

export type UsersTableProps = {
  data: ManagedUser[]
  status: Status
<<<<<<< HEAD
  errorMessage?: string
  currentUserId?: number
  isSuperAdmin?: boolean
  isDeleting?: boolean
=======
  currentUserId?: number
>>>>>>> origin/main
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
}

export function UsersTable({
  data,
  status,
<<<<<<< HEAD
  errorMessage,
  currentUserId,
  isSuperAdmin = false,
  isDeleting = false,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const renderContent = () => {
    if (status === 'pending') {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={36} />
          ))}
        </Stack>
      )
    }

    if (status === 'error') {
      return (
        <Alert severity="error">
          {errorMessage ?? 'Unable to load accounts. Please try again.'}
        </Alert>
      )
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No accounts found"
          description="Adjust your filters or create an account."
        />
      )
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => {
              const { id, fullname, email, role, createdAt } = user
              const isCurrentUser = currentUserId === id
              const isMainAdmin = role === USER_ROLE.MAIN_ADMIN
              const isProtected = isMainAdmin && !isSuperAdmin

              return (
                <TableRow key={id} hover>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="body2" fontWeight={600}>
                        {fullname}
                      </Typography>
                      {isCurrentUser ? (
                        <Typography variant="caption" color="text.secondary">
                          You
                        </Typography>
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getUserRoleLabel(role)}
                      color={isMainAdmin ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                    >
                      <Tooltip
                        title={
                          isProtected
                            ? 'Only Super Admin can edit Marketing Admins'
                            : 'Edit account'
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            aria-label={`Edit ${fullname}`}
                            disabled={isProtected || isDeleting}
                            onClick={() => onEdit(user)}
                            startIcon={<LuPencil size={16} />}
                          >
                            Edit
                          </Button>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          isCurrentUser
                            ? 'You cannot delete your own account'
                            : isProtected
                              ? 'Only Super Admin can delete Marketing Admins'
                              : 'Delete account'
                        }
                      >
                        <span>
                          <Button
                            size="small"
                            color="error"
                            aria-label={`Delete ${fullname}`}
                            disabled={
                              isCurrentUser || isProtected || isDeleting
                            }
                            onClick={() => onDelete(user)}
                            startIcon={<LuTrash2 size={16} />}
                          >
                            Delete
                          </Button>
                        </span>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return renderContent()
=======
  currentUserId,
  onEdit,
  onDelete,
}: UsersTableProps) {
  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error">Unable to load accounts. Please try again.</Alert>
    )
  }

  if (data.length === 0) {
    return (
      <Alert severity="info">
        No accounts yet. Create an admin account to get started.
      </Alert>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user) => {
            const { id, fullname, email, role, createdAt } = user
            const isCurrentUser = currentUserId === id
            const isMainAdmin = role === USER_ROLE.MAIN_ADMIN

            return (
              <TableRow key={id} hover>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {fullname}
                    </Typography>
                    {isCurrentUser ? (
                      <Typography variant="caption" color="text.secondary">
                        You
                      </Typography>
                    ) : null}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{email}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getUserRoleLabel(role)}
                    color={isMainAdmin ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {dayjs(createdAt).format('MMM D, YYYY')}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    justifyContent="flex-end"
                  >
                    <Tooltip title="Edit account">
                      <IconButton
                        size="small"
                        aria-label={`Edit ${fullname}`}
                        onClick={() => onEdit(user)}
                      >
                        <LuPencil size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title={
                        isCurrentUser
                          ? 'You cannot delete your own account'
                          : 'Delete account'
                      }
                    >
                      <span>
                        <IconButton
                          size="small"
                          aria-label={`Delete ${fullname}`}
                          disabled={isCurrentUser}
                          onClick={() => onDelete(user)}
                        >
                          <LuTrash2 size={16} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
>>>>>>> origin/main
}
