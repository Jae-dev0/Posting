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
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import { paths } from '@/config/paths'
import { useDeletePost, usePosts, type CmsPost } from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'
import type { Status } from '@/types'
import { formatDate, paginate } from '@/utils'

export function DraftsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { data: drafts = [], status, error, refetch } = usePosts('draft')
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })

  const { mutate: deletePost, isPending: isDeleting } = useDeletePost({
    onSuccess: () => showSuccess('Draft deleted.'),
    onError: () => showError('Could not delete draft.'),
  })

  const { data, total, currentPage } = useMemo(
    () => paginate(drafts, pagination.page, pagination.perPage),
    [drafts, pagination.page, pagination.perPage],
  )

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
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Unable to load drafts.'}
        </Alert>
      )
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No drafts yet"
          description="Save a draft from Create Post to continue editing it here."
        />
      )
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Caption</TableCell>
              <TableCell>Platforms</TableCell>
              <TableCell>Updated</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((draft) => {
              const { id, caption, platforms, updatedAt } = draft
              return (
                <TableRow key={id} hover>
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Typography variant="body2" noWrap>
                      {caption}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      {platforms.length === 0 ? (
                        <Chip size="small" label="None" variant="outlined" />
                      ) : (
                        platforms.map((platform) => (
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
                    {updatedAt ? formatDate(updatedAt) : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        onClick={() =>
                          void navigate(paths.posting.create.getHref(id))
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={isDeleting}
                        onClick={() => {
                          void confirm({
                            title: 'Delete draft?',
                            description: 'This cannot be undone.',
                            confirmationText: 'Delete',
                            cancellationText: 'Keep',
                          })
                            .then(() => deletePost(id))
                            .catch(() => undefined)
                        }}
                      >
                        Delete
                      </Button>
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

  return (
    <EntityListPage
      layoutTitle="Drafts"
      toolbarTitle="Drafts"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          saved drafts.
        </ListPageShowingCount>
      }
      toolbarPrimaryAction={{
        label: 'New draft',
        onClick: () => void navigate(paths.posting.create.getHref()),
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
          {renderContent()}
        </PagedTableCard>
      }
    />
  )
}

export type DraftTablesProps = {
  data: CmsPost[]
  status: Status
  errorMessage?: string
  isDeleting: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => void
}
