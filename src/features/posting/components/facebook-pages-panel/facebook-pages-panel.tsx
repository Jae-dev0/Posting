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
import { LuFacebook, LuRefreshCw, LuUnplug } from 'react-icons/lu'

import { EmptyState } from '@/components/layout'
import type { Status } from '@/types/common'

import type { FacebookPage } from '../../api'

export type FacebookPagesPanelProps = {
  pages: FacebookPage[]
  status: Status
  errorMessage?: string
  isConnecting?: boolean
  onConnect: () => void
  onDisconnect: (page: FacebookPage) => void
}

export function FacebookPagesPanel({
  pages,
  status,
  errorMessage,
  isConnecting = false,
  onConnect,
  onDisconnect,
}: FacebookPagesPanelProps) {
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
          {errorMessage ?? 'Unable to load Facebook Pages. Please try again.'}
        </Alert>
      )
    }

    return null
  }

  const hasConnectedPages = pages.length > 0
  const connectLabel = isConnecting
    ? CONNECT_LABEL_CONNECTING
    : hasConnectedPages
      ? 'Switch account'
      : 'Connect Facebook'

  const renderPages = () => {
    if (pages.length === 0) {
      return (
        <EmptyState
          title="No Facebook Pages connected yet"
          description="Connect Facebook to authorize Pages you manage."
        />
      )
    }

    return pages.map((page) => {
      const { id, pageName, pageId, isConnected } = page

      return (
        <Card key={id} variant="outlined" sx={{ p: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ color: '#1877F2', display: 'flex' }}>
                <LuFacebook size={24} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Facebook Page
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {pageName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Page ID: {pageId}
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
                onClick={() => onDisconnect(page)}
              >
                Disconnect
              </Button>
            </Stack>
          </Stack>
        </Card>
      )
    })
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
            Facebook Pages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasConnectedPages
              ? 'Pages below are connected. Use Switch account to authorize a different Meta user or add more Pages.'
              : 'Connect with Meta Login. Page access tokens are stored encrypted on the server — never in the browser.'}
          </Typography>
        </Stack>
        <Button
          variant={hasConnectedPages ? 'outlined' : 'contained'}
          startIcon={
            hasConnectedPages ? (
              <LuRefreshCw size={16} />
            ) : (
              <LuFacebook size={16} />
            )
          }
          onClick={onConnect}
          disabled={isConnecting}
        >
          {connectLabel}
        </Button>
      </Stack>

      {renderContent()}
      {status === 'success' ? renderPages() : null}
    </Stack>
  )
}
