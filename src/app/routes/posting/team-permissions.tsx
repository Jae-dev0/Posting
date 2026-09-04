import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'

import { ContentLayout } from '@/components/layout'
import {
  useTeamOverview,
  useUpdatePost,
  useUpsertPermission,
} from '@/features/posting'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

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

  if (overviewQuery.status === 'pending') {
    return (
      <ContentLayout title="Team & Permissions">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </ContentLayout>
    )
  }

  if (overviewQuery.status === 'error' || !overview) {
    return (
      <ContentLayout title="Team & Permissions">
        <Alert severity="error" sx={{ m: 3 }}>
          Unable to load team data. Main admin access is required.
        </Alert>
      </ContentLayout>
    )
  }

  return (
    <ContentLayout title="Team & Permissions">
      <Stack spacing={3} sx={{ m: 3 }}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Team & Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Control who can publish to each connected account, review pending
              approvals, and audit activity.
            </Typography>

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
                  {overview.users.map((user) => (
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
                  {overview.accounts.map((account) => (
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

            {overview.accounts.length === 0 ? (
              <Alert severity="info">
                Connect Facebook or Instagram accounts first to assign
                permissions.
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Pending approvals
            </Typography>
            {overview.pendingApprovals.length === 0 ? (
              <Alert severity="info">No posts waiting for approval.</Alert>
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
                    {overview.pendingApprovals.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography variant="body2" noWrap>
                            {post.caption}
                          </Typography>
                        </TableCell>
                        <TableCell>{post.createdBy?.name ?? '—'}</TableCell>
                        <TableCell>
                          {dayjs(post.updatedAt).format('MMM D, h:mm A')}
                        </TableCell>
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
                                  postId: post.id,
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
                                  postId: post.id,
                                  action: 'reject_to_draft',
                                })
                              }
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Audit log
            </Typography>
            {overview.auditLog.length === 0 ? (
              <Alert severity="info">No activity recorded yet.</Alert>
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
                    {overview.auditLog.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {dayjs(entry.createdAt).format('MMM D, h:mm A')}
                        </TableCell>
                        <TableCell>{entry.user?.name ?? 'System'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={entry.action} />
                        </TableCell>
                        <TableCell>{entry.summary}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </ContentLayout>
  )
}
