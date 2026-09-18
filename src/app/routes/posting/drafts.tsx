import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { Link as RouterLink } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { useDeletePost, usePosts } from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

export function DraftsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const query = usePosts('draft')

  const { mutate: deletePost, isPending } = useDeletePost({
    onSuccess: () => showSuccess('Draft deleted.'),
    onError: () => showError('Could not delete draft.'),
  })

  if (query.status === 'pending') {
    return (
      <ContentLayout title="Drafts">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </ContentLayout>
    )
  }

  if (query.status === 'error') {
    return (
      <ContentLayout title="Drafts">
        <Alert severity="error" sx={{ m: 3 }}>
          Unable to load drafts.
        </Alert>
      </ContentLayout>
    )
  }

  const drafts = query.data ?? []

  return (
    <ContentLayout title="Drafts">
      <Card
        elevation={0}
        sx={{ m: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Drafts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Edit the media, caption, or accounts for saved drafts.
              </Typography>
            </Box>
            <Button
              variant="contained"
              component={RouterLink}
              to={paths.posting.create.getHref()}
            >
              New draft
            </Button>
          </Stack>

          {drafts.length === 0 ? (
            <Alert severity="info">No drafts yet. Save one from Create Post.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Caption</TableCell>
                    <TableCell>Platforms</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id} hover>
                      <TableCell sx={{ maxWidth: 360 }}>
                        <Typography variant="body2" noWrap>
                          {draft.caption}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {draft.platforms.length === 0 ? (
                            <Chip size="small" label="None" variant="outlined" />
                          ) : (
                            draft.platforms.map((platform) => (
                              <Chip
                                key={platform}
                                size="small"
                                label={platform}
                                variant="outlined"
                              />
                            ))
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {draft.updatedAt
                          ? dayjs(draft.updatedAt).format('MMM D, YYYY h:mm A')
                          : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`${paths.posting.create.getHref()}?postId=${draft.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={isPending}
                            onClick={() => {
                              void confirm({
                                title: 'Delete draft?',
                                description: 'This cannot be undone.',
                                confirmationText: 'Delete',
                                cancellationText: 'Keep',
                              })
                                .then(() => deletePost(draft.id))
                                .catch(() => undefined)
                            }}
                          >
                            Delete
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
    </ContentLayout>
  )
}
