import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router'

import { CmsSidebar } from '../cms-sidebar'

export function CmsLayout() {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ minHeight: 'calc(100vh - 64px)' }}
    >
      <CmsSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Stack>
  )
}
