import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import type { Status } from '@/types/common'

import type { ScheduledPost } from '../../types'
import { getPlatformIcon, getPlatformLabel } from '../platform-utils'

export type ScheduledPostsTableProps = {
  data: ScheduledPost[]
  status: Status
  onCancel?: (postId: number) => void
  onReschedule?: (postId: number, scheduledAt: string) => void
  onEdit?: (postId: number) => void
  isUpdating?: boolean
}

export function ScheduledPostsTable({
  data,
  status,
  onCancel,
  onReschedule,
  onEdit,
  isUpdating = false,
}: ScheduledPostsTableProps) {
  const [reschedulePostId, setReschedulePostId] = useState<number | null>(null)
  const [rescheduleAt, setRescheduleAt] = useState<Dayjs | null>(
    dayjs().add(1, 'hour'),
  )

  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error">
        Unable to load scheduled posts. Please try again.
      </Alert>
    )
  }

  if (data.length === 0) {
    return <Alert severity="info">No scheduled posts yet.</Alert>
  }

  return (
    <>
      <TableContainer>
        <Table>
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
                      label={postStatus === 'scheduled' ? 'Scheduled' : 'Failed'}
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

      <Dialog
        open={reschedulePostId !== null}
        onClose={() => setReschedulePostId(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reschedule post</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <DateTimePicker
              label="New schedule time"
              value={rescheduleAt}
              onChange={setRescheduleAt}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReschedulePostId(null)}>Close</Button>
          <Button
            variant="contained"
            disabled={!rescheduleAt || isUpdating}
            onClick={() => {
              if (reschedulePostId !== null && rescheduleAt) {
                onReschedule?.(reschedulePostId, rescheduleAt.toISOString())
                setReschedulePostId(null)
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
