import { useMemo, useState } from 'react'
import {
  Alert,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'

import {
  EmptyState,
  EntityListPage,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  useListAuditLogs,
  useListPlatformUsers,
  type AuditLog,
  type PlatformUser,
} from '@/features/platform'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { formatDate, paginate } from '@/utils'
import type { Status } from '@/types'

export function PlatformUsersPage() {
  const { data: users = [], status, error } = useListPlatformUsers()
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
          platform users.
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
}

function UsersTables({ data, status, errorMessage }: UsersTablesProps) {
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
        {errorMessage ?? 'Could not load users.'}
      </Alert>
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
          <TableCell>Marketing role</TableCell>
          <TableCell>Platform roles</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((user) => {
          const {
            id,
            fullname,
            email,
            company,
            marketingRole,
            platformRoles,
            status: userStatus,
          } = user
          return (
            <TableRow key={id} hover>
              <TableCell>{fullname}</TableCell>
              <TableCell>{email}</TableCell>
              <TableCell>{company.name}</TableCell>
              <TableCell>{marketingRole}</TableCell>
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
