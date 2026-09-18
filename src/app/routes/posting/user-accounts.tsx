import {
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { LuPlus } from 'react-icons/lu'

import { ContentLayout } from '@/components/layout'
import {
  UserFormDialog,
  UsersTable,
  useDeleteUser,
  useListUsers,
  type ManagedUser,
} from '@/features/users'
import { getApiErrorMessage } from '@/features/users/lib/get-api-error-message'
import { useAuth } from '@/lib/auth'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

export function UserAccountsPage() {
  const { user: currentUser } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const { data, status } = useListUsers()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const filteredUsers = (data ?? []).filter((account) => {
    const query = search.trim().toLowerCase()
    return (
      (!roleFilter || account.role === roleFilter) &&
      (!query ||
        `${account.fullname} ${account.email}`.toLowerCase().includes(query))
    )
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({
    onSuccess: () => {
      showSuccess('Account deleted.')
    },
    onError: (error) => {
      showError(getApiErrorMessage(error, 'Could not delete account.'))
    },
  })

  const handleOpenCreate = () => {
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (user: ManagedUser) => {
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedUser(null)
  }

  const handleDelete = async (user: ManagedUser) => {
    try {
      await confirm({
        title: 'Delete account?',
        description: `Delete ${user.fullname} (${user.email})? This cannot be undone.`,
        confirmationText: 'Delete',
        cancellationText: 'Cancel',
      })
      deleteUser(user.id)
    } catch {
      // User cancelled the confirm dialog.
    }
  }

  return (
    <ContentLayout title="Account Management">
      <Card
        elevation={0}
        sx={{ m: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            sx={{ mb: 3 }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                Account Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage Marketing accounts for this company. Marketing Admins
                manage Sub Admins; Super Admins can also manage Marketing
                Admins.
              </Typography>
            </Stack>
            <Button
              variant="contained"
              startIcon={<LuPlus size={16} />}
              onClick={handleOpenCreate}
            >
              {currentUser?.isSuperAdmin
                ? 'Create Account'
                : 'Create Sub Admin'}
            </Button>
          </Stack>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Search name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              size="small"
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">All roles</MenuItem>
              <MenuItem value="main_admin">Marketing Admin</MenuItem>
              <MenuItem value="admin">Marketing Sub Admin</MenuItem>
            </TextField>
          </Stack>
          <UsersTable
            data={filteredUsers}
            isSuperAdmin={currentUser?.isSuperAdmin}
            isDeleting={isDeleting}
            status={status}
            currentUserId={currentUser?.id}
            onEdit={handleOpenEdit}
            onDelete={(user) => {
              void handleDelete(user)
            }}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        user={selectedUser}
      />
    </ContentLayout>
  )
}
