import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import dayjs from 'dayjs'

import { useInstagramPostEngagement } from '../../api'

export type InstagramEngagementDialogProps = {
  open: boolean
  postId: number | null
  onClose: () => void
}

function getEngagementErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string' &&
      data.message.trim()
    ) {
      return data.message
    }
    if (error.response?.status === 502) {
      return 'Meta could not load Instagram engagement for this media. Reconnect Instagram if the token expired, or try again shortly.'
    }
  }
  if (error instanceof Error && error.message) return error.message
  return 'Unable to load engagement from Meta Graph API.'
}

export function InstagramEngagementDialog({
  open,
  postId,
  onClose,
}: InstagramEngagementDialogProps) {
  const { data, status, error, refetch, isFetching } =
    useInstagramPostEngagement(open ? postId : null)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Instagram Engagement</DialogTitle>
      <DialogContent dividers>
        {status === 'pending' || isFetching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : null}

        {status === 'error' ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            }
          >
            {getEngagementErrorMessage(error)}
          </Alert>
        ) : null}

        {status === 'success' && data ? (
          <Stack spacing={2}>
            {data.timestamp ? (
              <Typography variant="caption" color="text.secondary">
                {dayjs(data.timestamp).format('MMM D, YYYY h:mm A')}
              </Typography>
            ) : null}

            {data.mediaUrl ? (
              <Box
                component="img"
                src={data.mediaUrl}
                alt="Published Instagram media"
                sx={{
                  width: '100%',
                  maxHeight: 360,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: '#000',
                }}
              />
            ) : null}

            <Typography variant="body2" whiteSpace="pre-wrap">
              {data.caption}
            </Typography>

            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {data.likeCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Likes
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {data.commentsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Comments
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>
              Recent comments
            </Typography>
            {data.comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No comments returned for this media.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {data.comments.map((comment) => (
                  <Box key={comment.id}>
                    <Typography variant="body2" fontWeight={600}>
                      {comment.username ?? 'User'}
                    </Typography>
                    <Typography variant="body2">{comment.text}</Typography>
                    {comment.timestamp ? (
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(comment.timestamp).format('MMM D, YYYY h:mm A')}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            )}

            {data.permalink ? (
              <Button
                href={data.permalink}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
              >
                Open on Instagram
              </Button>
            ) : null}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
