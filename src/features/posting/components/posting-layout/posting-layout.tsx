import { Box } from '@mui/material'
import { Outlet } from 'react-router'

export function PostingLayout() {
  return (
    <Box sx={{ minHeight: 'calc(100dvh - 112px)', minWidth: 0 }}>
      <Outlet />
    </Box>
  )
}
