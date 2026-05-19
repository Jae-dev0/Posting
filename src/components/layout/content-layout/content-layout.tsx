import { Box, Stack } from '@mui/material'
import { ReactNode } from 'react'

import { Head } from '@/components/seo'

export type ContentLayoutProps = {
  children?: ReactNode
  title: string
}

export function ContentLayout({ children, title = '' }: ContentLayoutProps) {
  return (
    <>
      <Head title={title} />
      <Box sx={{ p: 3 }}>
        <Stack spacing={2}>{children}</Stack>
      </Box>
    </>
  )
}
