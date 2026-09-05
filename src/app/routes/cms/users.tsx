import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  useCreateCmsSubAdmin,
  useDeleteCmsSubAdmin,
  useListCmsUsers,
  useUpdateCmsSubAdmin,
  type CmsUser,
} from '@/features/cms'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PERMISSIONS, useAuth, useCan } from '@/lib/auth'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui'
import { getErrorMessage, getSuccessMessage, paginate } from '@/utils'
import type { Status } from '@/types'

export function CmsUsersPage() {
  const { user: currentUser } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const canCreate = useCan(PERMISSIONS.USER_CREATE)
  const canEdit = useCan(PERMISSIONS.USER_EDIT)
  const canDelete = useCan(PERMISSIONS.USER_DELETE)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selected, setSelected] = useState<CmsUser | null>(null)

  const { data: users = [], status, error } = useListCmsUsers()

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    )
  }, [users, debouncedSearch])

  const { data, total, currentPage } = paginate(
    filtered,
    pagination.page,
    pagination.perPage,
  )

  const createUser = useCreateCmsSubAdmin({
    onSuccess: (user) => {
      showSuccess(getSuccessMessage(user.fullname, 'created', 'CMS Sub Admin'))
      setIsDialogOpen(false)
      setSelected(null)
    },
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not create CMS Sub Admin.')),
  })

  const updateUser = useUpdateCmsSubAdmin({
    onSuccess: (user) => {
      showSuccess(getSuccessMessage(user.fullname, 'updated', 'CMS Sub Admin'))
      setIsDialogOpen(false)
      setSelected(null)
    },
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not update CMS Sub Admin.')),
  })

  const deleteUser = useDeleteCmsSubAdmin({
    onSuccess: () => showSuccess('CMS Sub Admin deleted.'),
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not delete CMS Sub Admin.')),
  })

  const handleDelete = async (user: CmsUser) => {
    try {
      await confirm({
        title: 'Delete CMS Sub Admin?',
        description: `Delete ${user.fullname} (${user.email})? This cannot be undone.`,
        confirmationText: 'Delete',
        cancellationText: 'Cancel',
      })
      deleteUser.mutate(user.id)
    } catch {
      // cancelled
    }
  }

  return (
    <EntityListPage
      layoutTitle="CMS Users"
      toolbarTitle="CMS Users"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          CMS admins and sub-admins.
        </ListPageShowingCount>
      }
      toolbarPrimaryAction={
        canCreate
          ? {
              label: 'Create CMS Sub Admin',
              onClick: () => {
                setSelected(null)
                setIsDialogOpen(true)
              },
              startIcon: <ListPagePrimaryAddIcon />,
            }
          : undefined
      }
      pagedTable={
        <PagedTableCard
          count={status === 'success' ? total : 0}
          page={currentPage - 1}
          rowsPerPage={pagination.perPage}
          onPageChange={(_, page) =>
            setPagination((prev) => ({ ...prev, page: page + 1 }))
          }
          onRowsPerPageChange={(e) => {
            setPagination({
              page: 1,
              perPage: parseInt(e.target.value, 10),
            })
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              sx={{ minWidth: 220 }}
            />
          </Stack>
          <CmsUsersTable
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            currentUserId={currentUser?.id}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={(user) => {
              setSelected(user)
              setIsDialogOpen(true)
            }}
            onDelete={(user) => {
              void handleDelete(user)
            }}
          />
        </PagedTableCard>
      }
      footer={
        <CmsSubAdminDialog
          open={isDialogOpen}
          user={selected}
          isSaving={createUser.isPending || updateUser.isPending}
          onClose={() => {
            setIsDialogOpen(false)
            setSelected(null)
          }}
          onCreate={(values) => createUser.mutate(values)}
          onUpdate={(id, values) => updateUser.mutate({ id, data: values })}
        />
      }
    />
  )
}

type CmsUsersTableProps = {
  data: CmsUser[]
  status: Status
  errorMessage?: string
  currentUserId?: number
  canEdit: boolean
  canDelete: boolean
  onEdit: (user: CmsUser) => void
  onDelete: (user: CmsUser) => void
}

function CmsUsersTable({
  data,
  status,
  errorMessage,
  currentUserId,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: CmsUsersTableProps) {
  if (status === 'pending') {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={36} />
        ))}
      </Stack>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error">
        {errorMessage ?? 'Could not load CMS users.'}
      </Alert>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No CMS users yet"
        description="Create a CMS Sub Admin to share Website CMS access."
      />
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((user) => {
          const { id, fullname, email, cmsRole, status: userStatus } = user
          const isSelf = currentUserId === id
          const isSubAdmin = cmsRole === 'cms_sub_admin'
          return (
            <TableRow key={id} hover>
              <TableCell>{fullname}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={
                    cmsRole === 'cms_admin' ? 'CMS Admin' : 'CMS Sub Admin'
                  }
                  color={cmsRole === 'cms_admin' ? 'primary' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  label={userStatus}
                  color={userStatus === 'active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {canEdit && isSubAdmin ? (
                    <Button size="small" onClick={() => onEdit(user)}>
                      Edit
                    </Button>
                  ) : null}
                  {canDelete && isSubAdmin && !isSelf ? (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

type CmsSubAdminDialogProps = {
  open: boolean
  user: CmsUser | null
  isSaving: boolean
  onClose: () => void
  onCreate: (values: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) => void
  onUpdate: (
    id: number,
    values: {
      firstName?: string
      lastName?: string
      email?: string
      password?: string
    },
  ) => void
}

function CmsSubAdminDialog({
  open,
  user,
  isSaving,
  onClose,
  onCreate,
  onUpdate,
}: CmsSubAdminDialogProps) {
  const isEdit = Boolean(user)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setEmail(user.email)
    } else {
      setFirstName('')
      setLastName('')
      setEmail('')
    }
    setPassword('')
    setFormError(null)
  }, [open, user])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError('Name and email are required')
      return
    }
    if (!isEdit && password.length < 8) {
      setFormError('Password must be at least 8 characters')
      return
    }
    if (isEdit && user) {
      onUpdate(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        ...(password ? { password } : {}),
      })
      return
    }
    onCreate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? 'Edit CMS Sub Admin' : 'Create CMS Sub Admin'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}
            <Typography variant="body2" color="text.secondary">
              CMS Sub Admins can manage Website CMS content only. They cannot
              create other admins.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
                required
                size="small"
              />
              <TextField
                label="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
                required
                size="small"
              />
            </Stack>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              size="small"
            />
            <TextField
              label={isEdit ? 'New password (optional)' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required={!isEdit}
              size="small"
              helperText="Minimum 8 characters"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSaving}>
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
