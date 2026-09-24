import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'

import { ContentLayout, EmptyState } from '@/components/layout'
import { usePosts } from '@/features/posting'
import { formatDate } from '@/utils'

export function ContentCalendarPage() {
  const { data: posts = [], status, error } = usePosts('calendar')
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  const postsByDay = useMemo(() => {
    const map = new Map<string, typeof posts>()
    for (const post of posts) {
      const { scheduledAt, publishedAt, createdAt } = post
      const dateValue = scheduledAt ?? publishedAt ?? createdAt
      if (!dateValue) continue
      const key = dayjs(dateValue).format('YYYY-MM-DD')
      const existing = map.get(key) ?? []
      existing.push(post)
      map.set(key, existing)
    }
    return map
  }, [posts])

  const selectedKey = selectedDate.format('YYYY-MM-DD')
  const selectedPosts = postsByDay.get(selectedKey) ?? []

  const handleSelectDate = (value: Dayjs | null) => {
    if (value) setSelectedDate(value)
  }

  const renderCalendar = () => {
    if (status === 'pending') {
      return (
        <Stack spacing={1}>
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      )
    }

    return <DateCalendar value={selectedDate} onChange={handleSelectDate} />
  }

  const renderSelectedPosts = () => {
    if (status === 'pending') {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={72} />
          ))}
        </Stack>
      )
    }

    if (status === 'error') {
      return (
        <Alert severity="error">
          {error instanceof Error
            ? error.message
            : 'Unable to load calendar posts.'}
        </Alert>
      )
    }

    if (selectedPosts.length === 0) {
      return (
        <EmptyState
          title="No posts on this day"
          description="Scheduled and published posts for the selected day appear here."
        />
      )
    }

    return (
      <Stack spacing={1.5}>
        {selectedPosts.map((post) => {
          const {
            id,
            caption,
            platforms,
            status: postStatus,
            scheduledAt,
            publishedAt,
            createdAt,
          } = post
          return (
            <Box
              key={id}
              sx={{
                p: 1.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={2}
                alignItems="flex-start"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {caption}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(scheduledAt ?? publishedAt ?? createdAt ?? '')}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={postStatus.replace('_', ' ')}
                  color={
                    postStatus === 'published'
                      ? 'success'
                      : postStatus === 'scheduled'
                        ? 'info'
                        : 'warning'
                  }
                  variant="outlined"
                />
              </Stack>
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ mt: 1 }}
                useFlexGap
                flexWrap="wrap"
              >
                {platforms.map((platform) => (
                  <Chip
                    key={platform}
                    size="small"
                    label={platform}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )
        })}
      </Stack>
    )
  }

  return (
    <ContentLayout title="Content Calendar">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Calendar
            </Typography>
            {renderCalendar()}
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {selectedDate.format('MMMM D, YYYY')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Scheduled and published posts for this day.
            </Typography>

            {renderSelectedPosts()}
          </CardContent>
        </Card>
      </Stack>
    </ContentLayout>
  )
}
