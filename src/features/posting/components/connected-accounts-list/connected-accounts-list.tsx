import {
  Alert,
  Box,
  Card,
  Chip,
<<<<<<< HEAD
  Skeleton,
=======
  CircularProgress,
>>>>>>> origin/main
  Stack,
  Typography,
} from '@mui/material'

<<<<<<< HEAD
import { EmptyState } from '@/components/layout'
=======
>>>>>>> origin/main
import type { Status } from '@/types/common'

import type { ConnectedAccount } from '../../types'
import { getPlatformConfig } from '../platform-utils'

export type ConnectedAccountsListProps = {
  data: ConnectedAccount[]
  status: Status
<<<<<<< HEAD
  errorMessage?: string
=======
>>>>>>> origin/main
}

export function ConnectedAccountsList({
  data,
  status,
<<<<<<< HEAD
  errorMessage,
}: ConnectedAccountsListProps) {
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
        <Alert severity="error">
          {errorMessage ??
            'Unable to load connected accounts. Please try again.'}
        </Alert>
      )
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No other platform accounts yet"
          description="Connect another platform to see it listed here."
        />
      )
    }

    return (
      <Stack spacing={2}>
        {data.map((account) => {
          const { id, platform, accountName, handle, isConnected } = account
          const meta = getPlatformConfig(platform)
          const Icon = meta.icon

          return (
            <Card key={id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ color: meta.color, display: 'flex' }}>
                    <Icon size={24} />
                  </Box>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {meta.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {accountName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {handle}
                    </Typography>
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={isConnected ? 'Connected' : 'Disconnected'}
                    color={isConnected ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
              </Stack>
            </Card>
          )
        })}
      </Stack>
    )
  }

  return renderContent()
=======
}: ConnectedAccountsListProps) {
  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error">
        Unable to load connected accounts. Please try again.
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      {data.map((account) => {
        const { id, platform, accountName, handle, isConnected } = account
        const meta = getPlatformConfig(platform)
        const Icon = meta.icon

        return (
          <Card key={id} variant="outlined" sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ color: meta.color, display: 'flex' }}>
                  <Icon size={24} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {meta.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {accountName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {handle}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={isConnected ? 'Connected' : 'Disconnected'}
                  color={isConnected ? 'success' : 'default'}
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Card>
        )
      })}
    </Stack>
  )
>>>>>>> origin/main
}
