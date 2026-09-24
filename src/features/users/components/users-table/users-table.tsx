import {
  Alert,
  Button,
  Chip,
  Skeleton,
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
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import { EmptyState } from '@/components/layout'
import type { Status } from '@/types/common'
import { formatDate } from '@/utils'

import type { ManagedUser } from '../../api'
import { USER_ROLE, getUserRoleLabel } from '../../constants'

export type UsersTableProps = {
  data: ManagedUser[]
  status: Status
  errorMessage?: string
  currentUserId?: number
  isSuperAdmin?: boolean
  isDeleting?: boolean
  onEdit: (user: ManagedUser) => void
  onDelete: (user: ManagedUser) => void
}

export function UsersTable({
  data,
  status,
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
}
