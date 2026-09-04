import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  LuCircleCheck,
  LuCircleX,
  LuClock,
  LuPenLine,
  LuShield,
  LuUserPlus,
} from 'react-icons/lu'

import type { AnalyticsSummary } from '../../api'

dayjs.extend(relativeTime)

export type AnalyticsActivityFeedProps = {
  recentActivity: AnalyticsSummary['recentActivity']
}

function getActivityIcon(action: string) {
  if (action.includes('publish') || action.includes('approved')) {
    return LuCircleCheck
  }
  if (action.includes('fail') || action.includes('reject')) {
    return LuCircleX
  }
  if (action.includes('schedule')) {
    return LuClock
  }
  if (action.includes('permission') || action.includes('team')) {
    return LuShield
  }
  if (action.includes('connect') || action.includes('account')) {
    return LuUserPlus
  }
  return LuPenLine
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function AnalyticsActivityFeed({
  recentActivity,
}: AnalyticsActivityFeedProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 2px rgba(31, 32, 36, 0.04)',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Recent activity
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Latest actions across your workspace
        </Typography>

        {recentActivity.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No recent activity yet. Actions like publishing, scheduling, and
            approvals will appear here.
          </Alert>
        ) : (
          <Stack spacing={0}>
            {recentActivity.map((entry, index) => {
              const Icon = getActivityIcon(entry.action)
              const actorName = entry.user?.name ?? 'System'
              const isLast = index === recentActivity.length - 1

              return (
                <Box
                  key={entry.id}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    pb: isLast ? 0 : 2,
                    position: 'relative',
                  }}
                >
                  {!isLast ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 19,
                        top: 40,
                        bottom: 0,
                        width: 2,
                        bgcolor: 'divider',
                      }}
                    />
                  ) : null}

                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: entry.user ? 'primary.main' : 'grey.500',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {entry.user ? getInitials(actorName) : <Icon size={18} />}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {entry.summary}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.25 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {actorName}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        ·
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(entry.createdAt).fromNow()}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        ·
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(entry.createdAt).format('MMM D, h:mm A')}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              )
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
