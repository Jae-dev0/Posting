import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { LuInstagram, LuRefreshCw, LuUnplug } from 'react-icons/lu'

import type { Status } from '@/types/common'

import type { InstagramAccount } from '../../api'

export type InstagramAccountsPanelProps = {
  accounts: InstagramAccount[]
  status: Status
  isConnecting?: boolean
  onConnect: () => void
  onDisconnect: (account: InstagramAccount) => void
}

export function InstagramAccountsPanel({
  accounts,
  status,
  isConnecting = false,
  onConnect,
  onDisconnect,
}: InstagramAccountsPanelProps) {
  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Unable to load Instagram accounts. Please try again.
      </Alert>
    )
  }

  const hasConnectedAccounts = accounts.length > 0
  const connectLabel = isConnecting
    ? 'Redirecting…'
    : hasConnectedAccounts
      ? 'Switch account'
      : 'Connect Instagram'

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Instagram Business
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasConnectedAccounts
              ? 'Accounts below are connected. Use Switch account to authorize a different Meta user or link more Instagram profiles.'
              : 'Connect Instagram Professional accounts linked to your Facebook Pages via Facebook Login.'}
          </Typography>
        </Box>
        <Button
          variant={hasConnectedAccounts ? 'outlined' : 'contained'}
          color="secondary"
          startIcon={
            hasConnectedAccounts ? (
              <LuRefreshCw size={16} />
            ) : (
              <LuInstagram size={16} />
            )
          }
          onClick={onConnect}
          disabled={isConnecting}
        >
          {connectLabel}
        </Button>
      </Stack>

      {accounts.length === 0 ? (
        <Alert severity="info">
          No Instagram accounts connected yet. Link an Instagram Professional
          account to a Facebook Page in Meta Business Suite, then Connect
          Instagram.
        </Alert>
      ) : (
        accounts.map((account) => {
          const { id, pageName, pageId, isConnected } = account

          return (
            <Card key={id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: '#E1306C', display: 'flex' }}>
                    <LuInstagram size={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Instagram
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {pageName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      IG User ID: {pageId}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={isConnected ? 'Connected' : 'Needs reconnect'}
                    color={isConnected ? 'success' : 'warning'}
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<LuUnplug size={14} />}
                    onClick={() => onDisconnect(account)}
                  >
                    Disconnect
                  </Button>
                </Stack>
              </Stack>
            </Card>
          )
        })
      )}
    </Stack>
  )
}
