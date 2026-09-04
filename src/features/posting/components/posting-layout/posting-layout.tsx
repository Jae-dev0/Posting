import { Box, Stack } from '@mui/material'
import { Outlet } from 'react-router'

import { PostingSidebar } from '../posting-sidebar'

export function PostingLayout() {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ minHeight: 'calc(100vh - 112px)' }}
    >
      <PostingSidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Stack>
  )
}
