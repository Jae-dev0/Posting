import { alpha, Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { LuClock, LuFileText, LuShieldCheck } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { paths } from '@/config/paths'

export type PipelineItem = {
  key: string
  label: string
  value: number
  color: string
  href: string
  icon: typeof LuClock
}

export type AnalyticsPipelineCardProps = {
  scheduledCount: number
  draftCount: number
  pendingApprovalCount: number
}

export function AnalyticsPipelineCard({
  scheduledCount,
  draftCount,
  pendingApprovalCount,
}: AnalyticsPipelineCardProps) {
  const items: PipelineItem[] = [
    {
      key: 'scheduled',
      label: 'Scheduled',
      value: scheduledCount,
      color: '#1565C0',
      href: paths.posting.scheduled.getHref(),
      icon: LuClock,
    },
    {
      key: 'drafts',
      label: 'Drafts',
      value: draftCount,
      color: '#6A1B9A',
      href: paths.posting.drafts.getHref(),
      icon: LuFileText,
    },
    {
      key: 'pending',
      label: 'Pending approval',
      value: pendingApprovalCount,
      color: '#E65100',
      href: paths.posting.team.getHref(),
      icon: LuShieldCheck,
    },
  ]

  const total = items.reduce((sum, item) => sum + item.value, 0)

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
          Content pipeline
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Posts waiting to go live or awaiting review
        </Typography>

        {total === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Pipeline is clear — no scheduled, draft, or pending posts.
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                height: 12,
                borderRadius: 999,
                overflow: 'hidden',
                mb: 2.5,
              }}
            >
              {items.map((item) =>
                item.value > 0 ? (
                  <Box
                    key={item.key}
                    sx={{
                      width: `${(item.value / total) * 100}%`,
                      bgcolor: item.color,
                      minWidth: item.value > 0 ? 8 : 0,
                    }}
                  />
                ) : null,
              )}
            </Box>

            <Stack spacing={1.5}>
              {items.map((item) => {
                const Icon = item.icon
                const share =
                  total > 0 ? Math.round((item.value / total) * 100) : 0

                return (
                  <Box
                    key={item.key}
                    component={RouterLink}
                    to={item.href}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'border-color 0.2s, background-color 0.2s',
                      '&:hover': {
                        borderColor: alpha(item.color, 0.45),
                        bgcolor: alpha(item.color, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        bgcolor: alpha(item.color, 0.12),
                        color: item.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {share}% of pipeline
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={700}>
                      {item.value}
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  )
}
