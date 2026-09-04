import { Card, CardContent, Typography } from '@mui/material'

import { ContentLayout } from '@/components/layout'
import {
  ScheduledPostsTable,
  usePosts,
  useUpdatePost,
  type SocialPlatform,
} from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

export function ScheduledPostsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const query = usePosts('scheduled')

  const { mutate: updatePost, isPending } = useUpdatePost({
    onSuccess: (_data, variables) => {
      if (variables.action === 'cancel') {
        showSuccess('Scheduled post cancelled.')
      } else {
        showSuccess('Post rescheduled.')
      }
    },
    onError: () => {
      showError('Could not update scheduled post.')
    },
  })

  const data = (query.data ?? []).map((post) => ({
    id: post.id,
    caption: post.caption,
    mediaUrl: post.mediaUrl,
    platforms: post.platforms.filter(
      (platform): platform is SocialPlatform =>
        platform === 'facebook' ||
        platform === 'instagram' ||
        platform === 'tiktok',
    ),
    scheduledAt: post.scheduledAt ?? post.createdAt ?? new Date().toISOString(),
    status: (post.status === 'failed' ? 'failed' : 'scheduled') as
      | 'scheduled'
      | 'failed',
  }))

  const status =
    query.status === 'pending'
      ? 'pending'
      : query.status === 'error'
        ? 'error'
        : 'success'

  return (
    <ContentLayout title="Scheduled Posts">
      <Card
        elevation={0}
        sx={{ m: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Scheduled Posts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage posts scheduled for future publishing. Due posts are
            published automatically by the API scheduler.
          </Typography>
          <ScheduledPostsTable
            data={data}
            status={status}
            isUpdating={isPending}
            onCancel={(postId) => {
              void confirm({
                title: 'Cancel scheduled post?',
                description: 'This post will not be published.',
                confirmationText: 'Cancel post',
                cancellationText: 'Keep',
              })
                .then(() => {
                  updatePost({ postId, action: 'cancel' })
                })
                .catch(() => undefined)
            }}
            onReschedule={(postId, scheduledAt) => {
              updatePost({ postId, action: 'reschedule', scheduledAt })
            }}
          />
        </CardContent>
      </Card>
    </ContentLayout>
  )
}
