import {
  Alert,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { LuTrash2 } from 'react-icons/lu'

import {
  EmptyState,
  EntityListPage,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  useListAuditLogs,
  useListPlatformUsers,
  useDeletePlatformUser,
  useUpdatePlatformUserStatus,
  type AuditLog,
  type PlatformUser,
} from '@/features/platform'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useSnackbar } from '@/lib/mui'
import type { Status } from '@/types'
import { formatDate, paginate } from '@/utils'

export function PlatformUsersPage() {
  const { showSuccess, showError } = useSnackbar()
  const { data: users = [], status, error } = useListPlatformUsers()
  const updateStatus = useUpdatePlatformUserStatus({
    onSuccess: (user) => showSuccess(`${user.fullname} is now ${user.status}.`),
    onError: (mutationError) => showError(mutationError.message),
  })
  const deleteUser = useDeletePlatformUser({
    onSuccess: () => showSuccess('User deleted.'),
    onError: (mutationError) => showError(mutationError.message),
  })
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (user) =>
        user.fullname.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.company.name.toLowerCase().includes(q),
    )
  }, [users, debouncedSearch])

  const { data, total, currentPage } = paginate(
    filtered,
    pagination.page,
    pagination.perPage,
  )

  return (
    <EntityListPage
      layoutTitle="Users"
      toolbarTitle="Users"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          accounts across all companies.
        </ListPageShowingCount>
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
          <UsersTables
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            onToggleStatus={(user) =>
              updateStatus.mutate({
                id: user.id,
                status: user.status === 'active' ? 'disabled' : 'active',
              })
            }
            onDelete={(user) => deleteUser.mutate(user.id)}
            isMutating={updateStatus.isPending || deleteUser.isPending}
          />
        </PagedTableCard>
      }
    />
  )
}

type UsersTablesProps = {
  data: PlatformUser[]
  status: Status
  errorMessage?: string
  onToggleStatus: (user: PlatformUser) => void
  onDelete: (user: PlatformUser) => void
  isMutating: boolean
}

function getAccountDepartment(user: PlatformUser): string {
  const roleNames = user.platformRoles.map((r) => r.roleName)
  if (roleNames.includes('super_admin')) return 'Main Admin'
  if (roleNames.includes('company_admin')) return 'CMS Admin'
  if (
    roleNames.includes('marketing_admin') ||
    user.marketingRole === 'main_admin'
  ) {
    return 'Marketing Admin'
  }
  return 'Employee'
}

function UsersTables({
  data,
  status,
  errorMessage,
  onToggleStatus,
  onDelete,
  isMutating,
}: UsersTablesProps) {
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
      <Alert severity="error">{errorMessage ?? 'Could not load users.'}</Alert>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No users found"
        description="Users will appear here once accounts are created."
      />
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Company</TableCell>
          <TableCell>Department</TableCell>
          <TableCell>Roles</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Management</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((user) => {
          const {
            id,
            fullname,
            email,
            company,
            platformRoles,
            status: userStatus,
          } = user
          return (
            <TableRow key={id} hover>
              <TableCell>{fullname}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  variant="outlined"
                  color="primary"
                  label={getAccountDepartment(user)}
                />
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isMutating}
                  onClick={() => onToggleStatus(user)}
                >
                  {userStatus === 'active' ? 'Disable' : 'Activate'}
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isMutating}
                  aria-label={`Delete ${fullname}`}
                  onClick={() => onDelete(user)}
                >
                  <LuTrash2 />
                </IconButton>
              </TableCell>
              <TableCell>
                {platformRoles.map((r) => r.roleName).join(', ') || '—'}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={userStatus}
                  color={userStatus === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function PlatformAuditPage() {
  const { data: logs = [], status, error } = useListAuditLogs()
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return logs
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.summary.toLowerCase().includes(q) ||
        (log.company?.name ?? '').toLowerCase().includes(q) ||
        (log.user?.name ?? '').toLowerCase().includes(q),
    )
  }, [logs, debouncedSearch])

  const { data, total, currentPage } = paginate(
    filtered,
    pagination.page,
    pagination.perPage,
  )

  return (
    <EntityListPage
      layoutTitle="Audit Logs"
      toolbarTitle="Audit Logs"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          audit events.
        </ListPageShowingCount>
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
          <AuditTables
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
          />
        </PagedTableCard>
      }
    />
  )
}

type AuditTablesProps = {
  data: AuditLog[]
  status: Status
  errorMessage?: string
}

function AuditTables({ data, status, errorMessage }: AuditTablesProps) {
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
        {errorMessage ?? 'Could not load audit logs.'}
      </Alert>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No audit events yet"
        description="Platform actions will appear here as they happen."
      />
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>When</TableCell>
          <TableCell>Company</TableCell>
          <TableCell>User</TableCell>
          <TableCell>Action</TableCell>
          <TableCell>Summary</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((log) => {
          const { id, createdAt, company, user, action, summary } = log
          return (
            <TableRow key={id} hover>
              <TableCell>{formatDate(createdAt)}</TableCell>
              <TableCell>{company?.name ?? '—'}</TableCell>
              <TableCell>{user?.name ?? '—'}</TableCell>
              <TableCell>{action}</TableCell>
              <TableCell>{summary}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function PlatformPlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <EntityListPage
      layoutTitle={title}
      toolbarTitle={title}
      toolbarDescription={description}
      pagedTable={
        <PagedTableCard
          count={0}
          page={0}
          rowsPerPage={10}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        >
          <EmptyState title="Coming soon" description={description} />
        </PagedTableCard>
      }
    />
  )
}
