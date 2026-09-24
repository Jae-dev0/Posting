<<<<<<< HEAD
import { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  EntityListPage,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import { paths } from '@/config/paths'
import {
  ScheduledPostsTable,
  usePosts,
  useUpdatePost,
  type ScheduledPost,
  type SocialPlatform,
} from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'
import { paginate } from '@/utils'

export function ScheduledPostsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { data: posts = [], status, error } = usePosts('scheduled')
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })

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

  const allRows: ScheduledPost[] = posts.map((post) => {
    const { id, caption, mediaUrl, platforms, status: postStatus } = post
    return {
      id,
      caption,
      mediaUrl,
      platforms: platforms.filter(
        (platform): platform is SocialPlatform =>
          platform === 'facebook' ||
          platform === 'instagram' ||
          platform === 'tiktok',
      ),
      scheduledAt:
        post.scheduledAt ?? post.createdAt ?? new Date().toISOString(),
      status: postStatus === 'failed' ? 'failed' : 'scheduled',
    }
  })

  const { data, total, currentPage } = paginate(
    allRows,
    pagination.page,
    pagination.perPage,
  )

  const handleEdit = (postId: number) => {
    void navigate(paths.posting.create.getHref(postId))
  }

  const handleCancel = (postId: number) => {
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
  }

  const handleReschedule = (postId: number, scheduledAt: string) => {
    updatePost({ postId, action: 'reschedule', scheduledAt })
  }

  return (
    <EntityListPage
      layoutTitle="Scheduled Posts"
      toolbarTitle="Scheduled Posts"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          posts scheduled for future publishing.
        </ListPageShowingCount>
      }
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
          <ScheduledPostsTable
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            isUpdating={isPending}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onReschedule={handleReschedule}
          />
        </PagedTableCard>
      }
    />
=======
import { Card, CardContent, Typography } from '@mui/material'

import { ContentLayout } from '@/components/layout'
import { mockScheduledPosts, ScheduledPostsTable } from '@/features/posting'

export function ScheduledPostsPage() {
  const data = mockScheduledPosts
  const status = 'success' as const

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
            Manage posts scheduled for future publishing.
          </Typography>
          <ScheduledPostsTable data={data} status={status} />
        </CardContent>
      </Card>
    </ContentLayout>
>>>>>>> origin/main
  )
}
