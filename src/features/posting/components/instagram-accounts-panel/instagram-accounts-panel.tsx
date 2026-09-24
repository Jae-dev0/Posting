import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
<<<<<<< HEAD
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { LuInstagram, LuRefreshCw, LuUnplug } from 'react-icons/lu'

import { EmptyState } from '@/components/layout'
=======
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material'
import { LuInstagram, LuUnplug } from 'react-icons/lu'

>>>>>>> origin/main
import type { Status } from '@/types/common'

import type { InstagramAccount } from '../../api'

export type InstagramAccountsPanelProps = {
  accounts: InstagramAccount[]
  status: Status
<<<<<<< HEAD
  errorMessage?: string
=======
>>>>>>> origin/main
  isConnecting?: boolean
  onConnect: () => void
  onDisconnect: (account: InstagramAccount) => void
}

export function InstagramAccountsPanel({
  accounts,
  status,
<<<<<<< HEAD
  errorMessage,
=======
>>>>>>> origin/main
  isConnecting = false,
  onConnect,
  onDisconnect,
}: InstagramAccountsPanelProps) {
<<<<<<< HEAD
  const CONNECT_LABEL_CONNECTING = 'Redirecting…'

  const renderContent = () => {
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage ??
            'Unable to load Instagram accounts. Please try again.'}
        </Alert>
      )
    }

    return null
  }

  const hasConnectedAccounts = accounts.length > 0
  const connectLabel = isConnecting
    ? CONNECT_LABEL_CONNECTING
    : hasConnectedAccounts
      ? 'Switch account'
      : 'Connect Instagram'

  const renderAccounts = () => {
    if (accounts.length === 0) {
      return (
        <EmptyState
          title="No Instagram accounts connected yet"
          description="Link an Instagram Professional account to a Facebook Page, then connect it here."
        />
      )
    }

    return accounts.map((account) => {
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
=======
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
>>>>>>> origin/main
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
<<<<<<< HEAD
        <Stack spacing={0.5}>
=======
        <Box>
>>>>>>> origin/main
          <Typography variant="subtitle1" fontWeight={700}>
            Instagram Business
          </Typography>
          <Typography variant="body2" color="text.secondary">
<<<<<<< HEAD
            {hasConnectedAccounts
              ? 'Accounts below are connected. Use Switch account to authorize a different Meta user or link more Instagram profiles.'
              : 'Connect Instagram Professional accounts linked to your Facebook Pages via Facebook Login.'}
          </Typography>
        </Stack>
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

      {renderContent()}
      {status === 'success' ? renderAccounts() : null}
=======
            Connect Instagram Professional accounts linked to your Facebook
            Pages via Facebook Login. Requires instagram_basic and
            instagram_content_publish (API setup with Facebook login).
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<LuInstagram size={16} />}
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Redirecting…' : 'Connect Instagram'}
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
>>>>>>> origin/main
    </Stack>
  )
}
