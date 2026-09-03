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
import dayjs from 'dayjs'

import {
  useFacebookPostEngagement,
  type FacebookReactionBreakdown,
} from '../../api'

export type FacebookEngagementDialogProps = {
  open: boolean
  postId: number | null
  onClose: () => void
}

const REACTION_META: Array<{
  key: keyof FacebookReactionBreakdown
  label: string
  emoji: string
}> = [
  { key: 'like', label: 'Like', emoji: '👍' },
  { key: 'love', label: 'Love', emoji: '❤️' },
  { key: 'care', label: 'Care', emoji: '🤗' },
  { key: 'haha', label: 'Haha', emoji: '😆' },
  { key: 'wow', label: 'Wow', emoji: '😮' },
  { key: 'sad', label: 'Sad', emoji: '😢' },
  { key: 'angry', label: 'Angry', emoji: '😡' },
]

export function FacebookEngagementDialog({
  open,
  postId,
  onClose,
}: FacebookEngagementDialogProps) {
  const { data, status, error, refetch, isFetching } =
    useFacebookPostEngagement(open ? postId : null)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Facebook Engagement</DialogTitle>
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
            {error instanceof Error
              ? error.message
              : 'Unable to load engagement from Meta Graph API.'}
          </Alert>
        ) : null}

        {status === 'success' && data ? (
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                {data.pageName}
              </Typography>
              {data.createdTime ? (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(data.createdTime).format('MMM D, YYYY h:mm A')}
                </Typography>
              ) : null}
            </Box>

            {data.fullPicture ? (
              <Box
                component="img"
                src={data.fullPicture}
                alt="Published Facebook media"
                sx={{
                  width: '100%',
                  maxHeight: 320,
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              />
            ) : null}

            <Typography variant="body2" whiteSpace="pre-wrap">
              {data.message}
            </Typography>

            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {data.reactionCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reactions
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {data.commentCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Comments
                </Typography>
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {data.shareCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Shares
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Reaction breakdown
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {REACTION_META.map(({ key, label, emoji }) => (
                  <Box
                    key={key}
                    sx={{
                      px: 1.25,
                      py: 0.75,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      minWidth: 72,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="body2" component="span">
                      {emoji} {data.reactions[key]}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Divider />

            <Typography variant="subtitle2" fontWeight={700}>
              Recent comments
            </Typography>
            {data.comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No comments returned for this post.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {data.comments.map((comment) => (
                  <Box key={comment.id}>
                    <Typography variant="body2" fontWeight={600}>
                      {comment.fromName}
                    </Typography>
                    <Typography variant="body2">{comment.message}</Typography>
                    {comment.createdTime ? (
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(comment.createdTime).format(
                          'MMM D, YYYY h:mm A',
                        )}
                      </Typography>
                    ) : null}
                  </Box>
                ))}
              </Stack>
            )}

            {data.permalinkUrl ? (
              <Button
                href={data.permalinkUrl}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
              >
                Open on Facebook
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
