import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'

import { ContentLayout } from '@/components/layout'
import { usePosts } from '@/features/posting'

export function ContentCalendarPage() {
  const query = usePosts('calendar')
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())

  const postsByDay = useMemo(() => {
    const map = new Map<string, typeof query.data>()
    for (const post of query.data ?? []) {
      const dateValue = post.scheduledAt ?? post.publishedAt ?? post.createdAt
      if (!dateValue) continue
      const key = dayjs(dateValue).format('YYYY-MM-DD')
      const existing = map.get(key) ?? []
      existing.push(post)
      map.set(key, existing)
    }
    return map
  }, [query.data])

  const selectedKey = selectedDate.format('YYYY-MM-DD')
  const selectedPosts = postsByDay.get(selectedKey) ?? []

  return (
    <ContentLayout title="Content Calendar">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ m: 3 }}
      >
        <Card
          elevation={0}
          sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Calendar
            </Typography>
            {query.status === 'pending' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <DateCalendar
                value={selectedDate}
                onChange={(value) => {
                  if (value) setSelectedDate(value)
                }}
                slots={{
                  day: undefined,
                }}
              />
            )}
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

            {query.status === 'error' ? (
              <Alert severity="error">Unable to load calendar posts.</Alert>
            ) : selectedPosts.length === 0 ? (
              <Alert severity="info">No posts on this day.</Alert>
            ) : (
              <Stack spacing={1.5}>
                {selectedPosts.map((post) => (
                  <Box
                    key={post.id}
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
                          {post.caption}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(
                            post.scheduledAt ?? post.publishedAt ?? post.createdAt,
                          ).format('h:mm A')}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={post.status.replace('_', ' ')}
                        color={
                          post.status === 'published'
                            ? 'success'
                            : post.status === 'scheduled'
                              ? 'info'
                              : 'warning'
                        }
                        variant="outlined"
                      />
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} useFlexGap flexWrap="wrap">
                      {post.platforms.map((platform) => (
                        <Chip
                          key={platform}
                          size="small"
                          label={platform}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </ContentLayout>
  )
}
