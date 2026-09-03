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
  )
}
