import { MenuItem, TextField } from '@mui/material'
import { useMemo, useState } from 'react'

import {
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
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
import { paginate } from '@/utils'

export function UserAccountsPage() {
  const { user: currentUser } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const { data: users = [], status, error } = useListUsers()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users.filter((account) => {
      const { role, fullname, email } = account
      return (
        (!roleFilter || role === roleFilter) &&
        (!query || `${fullname} ${email}`.toLowerCase().includes(query))
      )
    })
  }, [users, search, roleFilter])

  const { data, total, currentPage } = useMemo(
    () => paginate(filteredUsers, pagination.page, pagination.perPage),
    [filteredUsers, pagination.page, pagination.perPage],
  )

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

  const handleDeleteUser = (user: ManagedUser) => {
    void handleDelete(user)
  }

  const handleFilterChange = (next: { search?: string; role?: string }) => {
    if (next.search !== undefined) setSearch(next.search)
    if (next.role !== undefined) setRoleFilter(next.role)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleCreateAction = () => {
    handleOpenCreate()
  }

  return (
    <EntityListPage
      layoutTitle="Account Management"
      toolbarTitle="Account Management"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          Marketing accounts for this company.
        </ListPageShowingCount>
      }
      toolbarPrimaryAction={{
        label: currentUser?.isSuperAdmin
          ? 'Create Account'
          : 'Create Sub Admin',
        onClick: handleCreateAction,
        startIcon: <ListPagePrimaryAddIcon />,
      }}
      pagedTable={
        <PagedTableCard
          count={status === 'success' ? total : 0}
          page={currentPage - 1}
          rowsPerPage={pagination.perPage}
          onPageChange={(_, page) =>
            setPagination((prev) => ({ ...prev, page: page + 1 }))
          }
          onRowsPerPageChange={(event) => {
            setPagination({
              page: 1,
              perPage: parseInt(event.target.value, 10),
            })
          }}
        >
          <UserAccountFilters
            filters={{ search, role: roleFilter }}
            onFilterChange={handleFilterChange}
          />
          <UsersTable
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            isSuperAdmin={currentUser?.isSuperAdmin}
            isDeleting={isDeleting}
            currentUserId={currentUser?.id}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteUser}
          />
        </PagedTableCard>
      }
      footer={
        <UserFormDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          user={selectedUser}
        />
      }
    />
  )
}

export type UserAccountFiltersProps = {
  filters: { search: string; role: string }
  onFilterChange: (next: { search?: string; role?: string }) => void
}

export function UserAccountFilters({
  filters,
  onFilterChange,
}: UserAccountFiltersProps) {
  const { search, role } = filters

  return (
    <>
      <TextField
        label="Search name or email"
        value={search}
        onChange={(event) => onFilterChange({ search: event.target.value })}
        size="small"
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        select
        label="Role"
        value={role}
        onChange={(event) => onFilterChange({ role: event.target.value })}
        size="small"
        sx={{ minWidth: 220, mb: 2 }}
      >
        <MenuItem value="">All roles</MenuItem>
        <MenuItem value="main_admin">Marketing Admin</MenuItem>
        <MenuItem value="admin">Marketing Sub Admin</MenuItem>
      </TextField>
    </>
  )
}
