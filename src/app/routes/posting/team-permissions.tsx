import {
  Alert,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

import { ContentLayout, EmptyState } from '@/components/layout'
import {
  useTeamOverview,
  useUpdatePost,
  useUpsertPermission,
} from '@/features/posting'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'
import { formatDate } from '@/utils'

export function TeamPermissionsPage() {
  const { showSuccess, showError } = useSnackbar()
  const overviewQuery = useTeamOverview()
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [selectedAccountId, setSelectedAccountId] = useState<number | ''>('')

  const { mutate: upsertPermission, isPending: isSavingPermission } =
    useUpsertPermission({
      onSuccess: () => showSuccess('Permission saved.'),
      onError: () => showError('Could not save permission.'),
    })

  const { mutate: updatePost, isPending: isUpdatingPost } = useUpdatePost({
    onSuccess: (_data, variables) => {
      showSuccess(
        variables.action === 'approve'
          ? 'Post approved for scheduling.'
          : 'Post returned to drafts.',
      )
    },
    onError: () => showError('Could not update approval.'),
  })

  const overview = overviewQuery.data
  const { status, error } = overviewQuery

  const selectedPermission = useMemo(() => {
    if (!overview || selectedUserId === '' || selectedAccountId === '') {
      return null
    }
    return (
      overview.permissions.find(
        (permission) =>
          permission.userId === selectedUserId &&
          permission.connectedAccountId === selectedAccountId,
      ) ?? null
    )
  }, [overview, selectedAccountId, selectedUserId])

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

    if (status === 'error' || !overview) {
      return (
        <Alert severity="error">
          {error instanceof Error
            ? error.message
            : 'Unable to load team data. Main admin access is required.'}
        </Alert>
      )
    }

    return null
  }

  const renderFilters = () => {
    if (status !== 'success' || !overview) return null

    const { users, accounts } = overview

    return (
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ mb: 2 }}
      >
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="team-user-label">User</InputLabel>
          <Select
            labelId="team-user-label"
            label="User"
            value={selectedUserId}
            onChange={(event) =>
              setSelectedUserId(event.target.value as number | '')
            }
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.role})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="team-account-label">Account</InputLabel>
          <Select
            labelId="team-account-label"
            label="Account"
            value={selectedAccountId}
            onChange={(event) =>
              setSelectedAccountId(event.target.value as number | '')
            }
          >
            {accounts.map((account) => (
              <MenuItem key={account.id} value={account.id}>
                {account.platform} · {account.accountName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2">Can publish</Typography>
          <Switch
            checked={selectedPermission?.canPublish ?? true}
            disabled={
              selectedUserId === '' ||
              selectedAccountId === '' ||
              isSavingPermission
            }
            onChange={(_event, checked) => {
              if (selectedUserId === '' || selectedAccountId === '') return
              upsertPermission({
                userId: selectedUserId,
                connectedAccountId: selectedAccountId,
                canPublish: checked,
                canApprove: selectedPermission?.canApprove ?? false,
              })
            }}
          />
        </Stack>
      </Stack>
    )
  }

  const renderPendingApprovals = () => {
    if (status !== 'success' || !overview) return null

    const { pendingApprovals } = overview

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Pending approvals
        </Typography>
        {pendingApprovals.length === 0 ? (
          <EmptyState
            title="No posts waiting for approval"
            description="Posts that need review will appear here."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Caption</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {overview.pendingApprovals.map((post) => {
                  const { id, caption, createdBy, updatedAt } = post
                  return (
                    <TableRow key={id}>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" noWrap>
                          {caption}
                        </Typography>
                      </TableCell>
                      <TableCell>{createdBy?.name ?? '—'}</TableCell>
                      <TableCell>{formatDate(updatedAt)}</TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            disabled={isUpdatingPost}
                            onClick={() =>
                              updatePost({
                                postId: id,
                                action: 'approve',
                              })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="warning"
                            disabled={isUpdatingPost}
                            onClick={() =>
                              updatePost({
                                postId: id,
                                action: 'reject_to_draft',
                              })
                            }
                          >
                            Reject
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    )
  }

  const renderAuditLog = () => {
    if (status !== 'success' || !overview) return null

    const { auditLog } = overview

    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Audit log
        </Typography>
        {auditLog.length === 0 ? (
          <EmptyState
            title="No activity recorded yet"
            description="Team actions will appear here as they happen."
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>When</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Summary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLog.map((entry) => {
                  const { id, createdAt, user, action, summary } = entry
                  return (
                    <TableRow key={id}>
                      <TableCell>{formatDate(createdAt)}</TableCell>
                      <TableCell>{user?.name ?? 'System'}</TableCell>
                      <TableCell>
                        <Chip size="small" label={action} />
                      </TableCell>
                      <TableCell>{summary}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    )
  }

  return (
    <ContentLayout title="Team & Permissions">
      <Stack spacing={2}>
        {renderContent()}
        {renderFilters()}
        {renderPendingApprovals()}
        {renderAuditLog()}
      </Stack>
    </ContentLayout>
  )
}
