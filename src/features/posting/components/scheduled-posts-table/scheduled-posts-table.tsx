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
import { DateTimePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'

import { EmptyState } from '@/components/layout'
import {
  Dialog,
  DialogActions,
  DialogContent,
  FormDialogTitle,
} from '@/components/ui/form-dialog'
import type { Status } from '@/types/common'

import type { ScheduledPost } from '../../types'
import { getPlatformIcon, getPlatformLabel } from '../platform-utils'

export type ScheduledPostsTableProps = {
  data: ScheduledPost[]
  status: Status
  errorMessage?: string
  onCancel?: (postId: number) => void
  onReschedule?: (postId: number, scheduledAt: string) => void
  onEdit?: (postId: number) => void
  isUpdating?: boolean
}

export function ScheduledPostsTable({
  data,
  status,
  errorMessage,
  onCancel,
  onReschedule,
  onEdit,
  isUpdating = false,
}: ScheduledPostsTableProps) {
  const [reschedulePostId, setReschedulePostId] = useState<number | null>(null)
  const [rescheduleAt, setRescheduleAt] = useState<Dayjs | null>(
    dayjs().add(1, 'hour'),
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
        <Alert severity="error">
          {errorMessage ?? 'Unable to load scheduled posts. Please try again.'}
        </Alert>
      )
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No scheduled posts yet"
          description="Schedule a post and it will appear here until it is published."
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
              <TableCell>Scheduled for</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((post) => {
              const {
                id,
                caption,
                platforms,
                scheduledAt,
                status: postStatus,
              } = post

              return (
                <TableRow key={id} hover>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography variant="body2" noWrap>
                      {caption}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {platforms.map((platform) => {
                        const Icon = getPlatformIcon(platform)
                        return (
                          <Chip
                            key={platform}
                            size="small"
                            icon={<Icon size={12} />}
                            label={getPlatformLabel(platform)}
                            variant="outlined"
                          />
                        )
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dayjs(scheduledAt).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        postStatus === 'scheduled' ? 'Scheduled' : 'Failed'
                      }
                      color={postStatus === 'scheduled' ? 'info' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        disabled={isUpdating || postStatus !== 'scheduled'}
                        onClick={() => onEdit?.(id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        disabled={isUpdating || postStatus !== 'scheduled'}
                        onClick={() => {
                          setReschedulePostId(id)
                          setRescheduleAt(dayjs(scheduledAt))
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={isUpdating || postStatus !== 'scheduled'}
                        onClick={() => onCancel?.(id)}
                      >
                        Cancel
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

  const closeRescheduleDialog = () => setReschedulePostId(null)

  const handleConfirmReschedule = () => {
    if (reschedulePostId !== null && rescheduleAt) {
      onReschedule?.(reschedulePostId, rescheduleAt.toISOString())
      closeRescheduleDialog()
    }
  }

  return (
    <>
      {renderContent()}

      <Dialog
        open={reschedulePostId !== null}
        onClose={closeRescheduleDialog}
        fullWidth
        maxWidth="xs"
      >
        <FormDialogTitle
          title="Reschedule post"
          subtitle="Choose a new publish time."
          onClose={closeRescheduleDialog}
        />
        <DialogContent>
          <DateTimePicker
            label="New schedule time"
            value={rescheduleAt}
            onChange={setRescheduleAt}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={closeRescheduleDialog}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!rescheduleAt || isUpdating}
            onClick={handleConfirmReschedule}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
