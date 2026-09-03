import { Box, Paper, Stack, Typography } from '@mui/material'
import { ReactNode } from 'react'
import { LuSend } from 'react-icons/lu'

export type AuthCardProps = {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const yearNow = new Date().getFullYear()

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          p: 5,
          mb: 3,
          borderRadius: 5,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LuSend size={16} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Social Media Publisher
          </Typography>
        </Stack>

        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="caption" fontWeight={500} color="text.secondary">
            {subtitle}
          </Typography>
        </Stack>

        {children}
      </Paper>

      <Stack direction="row" justifyContent="center">
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {`© Social Media Publisher ${yearNow}. All rights reserved.`}
        </Typography>
      </Stack>
    </>
  )
}
