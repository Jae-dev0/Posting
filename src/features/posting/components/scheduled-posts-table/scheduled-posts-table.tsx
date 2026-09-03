import {
  Alert,
  Box,
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

import type { Status } from '@/types/common'

import type { ScheduledPost } from '../../types'
import { getPlatformIcon, getPlatformLabel } from '../platform-utils'

export type ScheduledPostsTableProps = {
  data: ScheduledPost[]
  status: Status
}

export function ScheduledPostsTable({
  data,
  status,
}: ScheduledPostsTableProps) {
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
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Caption</TableCell>
            <TableCell>Platforms</TableCell>
            <TableCell>Scheduled for</TableCell>
            <TableCell>Status</TableCell>
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
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
