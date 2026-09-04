import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { LuLink } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { paths } from '@/config/paths'

import type { AnalyticsSummary } from '../../api'
import { tryGetPlatformConfig } from '../platform-utils'

export type AnalyticsAccountHealthProps = {
  accountHealth: AnalyticsSummary['accountHealth']
}

const HEALTH_META = {
  healthy: { label: 'Healthy', color: 'success' as const },
  expiring_soon: { label: 'Expiring soon', color: 'warning' as const },
  expired: { label: 'Expired', color: 'error' as const },
  disconnected: { label: 'Disconnected', color: 'error' as const },
}

export function AnalyticsAccountHealth({
  accountHealth,
}: AnalyticsAccountHealthProps) {
  const summary = accountHealth.reduce(
    (acc, account) => {
      acc[account.health] += 1
      return acc
    },
    { healthy: 0, expiring_soon: 0, expired: 0, disconnected: 0 },
  )

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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Account health
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Token status for connected social accounts
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to={paths.posting.accounts.getHref()}
            size="small"
            variant="outlined"
            startIcon={<LuLink size={14} />}
            sx={{ flexShrink: 0, textTransform: 'none' }}
          >
            Manage
          </Button>
        </Stack>

        {accountHealth.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No social accounts connected. Connect Facebook or Instagram to start
            publishing.
          </Alert>
        ) : (
          <>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 2.5 }}
            >
              {(
                Object.entries(summary) as Array<[keyof typeof summary, number]>
              ).map(([health, count]) =>
                count > 0 ? (
                  <Chip
                    key={health}
                    size="small"
                    label={`${HEALTH_META[health].label}: ${count}`}
                    color={HEALTH_META[health].color}
                    variant="outlined"
                  />
                ) : null,
              )}
            </Stack>

            <Stack spacing={1.25}>
              {accountHealth.map((account) => {
                const platformMeta = tryGetPlatformConfig(account.platform)
                const PlatformIcon = platformMeta?.icon
                const healthMeta = HEALTH_META[account.health]

                return (
                  <Box
                    key={account.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: platformMeta?.color ?? 'grey.400',
                        fontSize: '0.875rem',
                      }}
                    >
                      {PlatformIcon ? (
                        <PlatformIcon size={20} color="#fff" />
                      ) : (
                        account.pageName.charAt(0).toUpperCase()
                      )}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {account.pageName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {platformMeta?.label ?? account.platform}
                        {account.tokenExpiresAt
                          ? ` · expires ${dayjs(account.tokenExpiresAt).format('MMM D, YYYY')}`
                          : ''}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={healthMeta.label}
                      color={healthMeta.color}
                      variant="filled"
                      sx={{ flexShrink: 0 }}
                    />
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
