import { Box, Card, Chip, Stack, Switch, Typography } from '@mui/material'

import type { ConnectedAccount } from '../../types'
import { getPlatformConfig } from '../platform-utils'

export type PlatformAccountCardProps = {
  account: ConnectedAccount
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function PlatformAccountCard({
  account,
  enabled,
  onToggle,
}: PlatformAccountCardProps) {
  const { platform, accountName, handle, isConnected } = account
  const config = getPlatformConfig(platform)
  const Icon = config.icon

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 160,
        p: 1.5,
        borderColor: enabled ? 'primary.main' : 'divider',
      }}
    >
      <Stack spacing={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: config.color, display: 'flex' }}>
              <Icon size={18} />
            </Box>
            <Typography variant="caption" fontWeight={600}>
              {config.label}
            </Typography>
          </Stack>
          <Switch
            size="small"
            checked={enabled}
            color="primary"
            onChange={(event) => onToggle(event.target.checked)}
          />
        </Stack>
        <Typography variant="body2" fontWeight={600} noWrap>
          {accountName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {handle}
        </Typography>
        {isConnected ? (
          <Chip
            label="Connected"
            size="small"
            color="success"
            variant="outlined"
          />
        ) : null}
      </Stack>
    </Card>
  )
}
