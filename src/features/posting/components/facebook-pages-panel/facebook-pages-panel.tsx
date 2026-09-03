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
import { LuFacebook, LuUnplug } from 'react-icons/lu'

import type { Status } from '@/types/common'

import type { FacebookPage } from '../../api'

export type FacebookPagesPanelProps = {
  pages: FacebookPage[]
  status: Status
  isConnecting?: boolean
  onConnect: () => void
  onDisconnect: (page: FacebookPage) => void
}

export function FacebookPagesPanel({
  pages,
  status,
  isConnecting = false,
  onConnect,
  onDisconnect,
}: FacebookPagesPanelProps) {
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
        Unable to load Facebook Pages. Please try again.
      </Alert>
    )
  }

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
            Facebook Pages
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect with Meta Login. Page access tokens are stored encrypted on
            the server — never in the browser.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<LuFacebook size={16} />}
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Redirecting…' : 'Connect Facebook'}
        </Button>
      </Stack>

      {pages.length === 0 ? (
        <Alert severity="info">
          No Facebook Pages connected yet. Click Connect Facebook to authorize
          Pages you manage.
        </Alert>
      ) : (
        pages.map((page) => {
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
      )}
    </Stack>
  )
}
