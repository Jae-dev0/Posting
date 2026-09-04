import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'

import type { AnalyticsSummary } from '../../api'

export type AnalyticsPublishingTrendProps = {
  trend: AnalyticsSummary['publishingTrend']
  weekTotal: number
  monthTotal: number
}

const panelSx = {
  border: '1px solid',
  borderColor: 'divider',
  height: '100%',
  bgcolor: 'background.paper',
  boxShadow: '0 1px 2px rgba(31, 32, 36, 0.04)',
} as const

export function AnalyticsPublishingTrend({
  trend,
  weekTotal,
  monthTotal,
}: AnalyticsPublishingTrendProps) {
  const points =
    trend.length > 0
      ? trend
      : Array.from({ length: 7 }, (_, index) => ({
          date: dayjs()
            .subtract(6 - index, 'day')
            .startOf('day')
            .toISOString(),
          count: 0,
        }))

  const maxCount = Math.max(...points.map((point) => point.count), 1)
  const peak = Math.max(...points.map((point) => point.count), 0)
  const dailyAverage = weekTotal > 0 ? (weekTotal / 7).toFixed(1) : '0'

  return (
    <Card elevation={0} sx={panelSx}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Publishing volume
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posts published over the last 7 days
            </Typography>
          </Box>
          <Stack direction="row" spacing={3} flexShrink={0}>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                {weekTotal}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                This week
              </Typography>
            </Box>
            <Box textAlign={{ xs: 'left', sm: 'right' }}>
              <Typography variant="h6" fontWeight={700}>
                {monthTotal}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last 30 days
              </Typography>
            </Box>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: { xs: 0.75, sm: 1.25 },
            height: 160,
            px: 0.5,
            py: 1,
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          {points.map((point) => {
            const barHeight =
              point.count > 0 ? (point.count / maxCount) * 100 : 6
            const isToday = dayjs(point.date).isSame(dayjs(), 'day')

            return (
              <Box
                key={point.date}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 0.75,
                  minWidth: 0,
                  height: '100%',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={point.count > 0 ? 700 : 500}
                  color={point.count > 0 ? 'text.primary' : 'text.disabled'}
                  sx={{ fontSize: '0.7rem' }}
                >
                  {point.count}
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 44,
                    height: `${barHeight}%`,
                    minHeight: point.count > 0 ? 10 : 6,
                    borderRadius: 1.5,
                    bgcolor: isToday ? 'primary.main' : 'primary.light',
                    opacity: point.count > 0 ? (isToday ? 1 : 0.7) : 0.25,
                    transition: 'height 0.3s ease',
                  }}
                />
                <Typography
                  variant="caption"
                  color={isToday ? 'primary.main' : 'text.secondary'}
                  fontWeight={isToday ? 700 : 500}
                  sx={{ fontSize: '0.7rem' }}
                >
                  {dayjs(point.date).format('ddd')}
                </Typography>
              </Box>
            )
          })}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block' }}
        >
          Daily average: {dailyAverage} posts · Peak day: {peak} posts
        </Typography>
      </CardContent>
    </Card>
  )
}
