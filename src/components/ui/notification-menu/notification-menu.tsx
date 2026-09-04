import {
  Badge,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { ReactNode, useState } from 'react'
import { LuBell, LuCheck, LuTrash2, LuX } from 'react-icons/lu'

export type NotificationMenuProps = {
  unreadCount?: number
  children?: ReactNode
  onMarkAllRead?: () => void
  onClearAll?: () => void
  onHelp?: () => void
}

type TabValue = 'all' | 'unread' | 'read'

export function NotificationMenu({
  unreadCount = 0,
  children,
  onMarkAllRead,
  onClearAll,
}: NotificationMenuProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TabValue>('all')

  const totalCount = 0
  const readCount = 0

  const handleClose = () => setOpen(false)

  return (
    <>
      <Badge
        color="error"
        badgeContent={unreadCount}
        invisible={unreadCount === 0}
      >
        <IconButton
          aria-label="Open notifications"
          onClick={() => setOpen(true)}
        >
          <LuBell />
        </IconButton>
      </Badge>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', sm: 400 },
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                borderRadius: '50%',
                alignItems: 'center',
                color: 'primary.main',
                bgcolor: '#FAE6E6',
                justifyContent: 'center',
              }}
            >
              <LuBell size={20} />
            </Box>
            <Stack>
              <Typography variant="h6" fontWeight={600}>
                Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </Typography>
            </Stack>
          </Stack>
          <IconButton
            aria-label="Close notifications"
            onClick={handleClose}
            size="small"
          >
            <LuX size={20} />
          </IconButton>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, value: TabValue) => setTab(value)}
          variant="fullWidth"
          sx={{
            flexShrink: 0,
            borderBottom: 1,
            borderColor: 'divider',
            px: 1,
          }}
        >
          <Tab label={`All (${totalCount})`} value="all" />
          <Tab label={`Unread (${unreadCount})`} value="unread" />
          <Tab label={`Read (${readCount})`} value="read" />
        </Tabs>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex' }}>
          {children ?? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{ py: 6, px: 3, width: '100%', textAlign: 'center' }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LuBell size={32} color="inherit" style={{ opacity: 0.6 }} />
              </Box>
              <Typography variant="h6" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                When you have notifications, they will appear here.
              </Typography>
            </Stack>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={1} width="100%">
            <Button
              fullWidth
              size="small"
              color="inherit"
              variant="outlined"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0}
              sx={{ color: 'text.secondary' }}
              startIcon={<LuCheck size={18} />}
            >
              Mark All Read
            </Button>
            <Button
              fullWidth
              size="small"
              color="inherit"
              variant="outlined"
              onClick={onClearAll}
              disabled={totalCount === 0}
              sx={{ color: 'text.secondary' }}
              startIcon={<LuTrash2 size={18} />}
            >
              Clear All
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  )
}
