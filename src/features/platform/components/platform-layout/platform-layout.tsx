import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router'

import { PlatformSidebar } from '../platform-sidebar'

export function PlatformLayout() {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <PlatformSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Stack>
  )
}
