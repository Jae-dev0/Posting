import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { LuMusic2, LuRefreshCw, LuUnplug } from 'react-icons/lu'

import { EmptyState } from '@/components/layout'
import type { Status } from '@/types/common'

import type { TikTokAccount } from '../../api'

export type TikTokAccountsPanelProps = {
  accounts: TikTokAccount[]
  status: Status
  errorMessage?: string
  isConnecting?: boolean
  onConnect: () => void
  onDisconnect: (account: TikTokAccount) => void
}

export function TikTokAccountsPanel({
  accounts,
  status,
  errorMessage,
  isConnecting = false,
  onConnect,
  onDisconnect,
}: TikTokAccountsPanelProps) {
  const hasAccounts = accounts.length > 0

  const renderContent = () => {
    if (status === 'pending') {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} height={72} />
          ))}
        </Stack>
      )
    }
    if (status === 'error') {
      return (
        <Alert severity="error">
          {errorMessage ?? 'Unable to load TikTok accounts.'}
        </Alert>
      )
    }
    if (!hasAccounts) {
      return (
        <EmptyState
          title="No TikTok account connected yet"
          description="Connect TikTok to authorize private Direct Post video publishing."
        />
      )
    }
    return accounts.map((account) => (
      <Card key={account.id} variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ color: 'text.primary', display: 'flex' }}>
              <LuMusic2 size={24} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                TikTok account
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {account.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Direct Posts are private until TikTok approves the app.
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={account.isConnected ? 'Connected' : 'Needs reconnect'}
              color={account.isConnected ? 'success' : 'warning'}
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
    ))
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            TikTok
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect through TikTok Login Kit. Access and refresh tokens stay
            encrypted on the server.
          </Typography>
        </Stack>
        <Button
          variant={hasAccounts ? 'outlined' : 'contained'}
          startIcon={
            hasAccounts ? <LuRefreshCw size={16} /> : <LuMusic2 size={16} />
          }
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting
            ? 'Redirecting…'
            : hasAccounts
              ? 'Switch account'
              : 'Connect TikTok'}
        </Button>
      </Stack>
      {renderContent()}
    </Stack>
  )
}
