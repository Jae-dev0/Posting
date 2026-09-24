<<<<<<< HEAD
import { Box, Paper, type PaperProps, Stack, Typography } from '@mui/material'
import React from 'react'
import { LuSend } from 'react-icons/lu'

const LOGO_BOX_SIZE_PX = 40
const LOGO_ICON_SIZE_PX = 22
const CARD_PADDING_SPACING = 4
const CARD_BORDER_RADIUS_PX = 20
const SPACING_HEADER_BOTTOM = 2.5
const SPACING_TITLE_BOTTOM = 3
const CURRENT_YEAR = new Date().getFullYear()

export type AuthCardProps = Omit<PaperProps, 'ref'> & {
  ref?: React.Ref<React.ComponentRef<typeof Paper>>
  title?: string
  subtitle?: string
  children: React.ReactNode
  hideLogo?: boolean
  hideFooter?: boolean
}

export function AuthCard({
  ref,
  title,
  subtitle,
  children,
  hideLogo = true,
  hideFooter = true,
  sx,
  ...paperProps
}: AuthCardProps) {
  const hasHeader = !hideLogo || Boolean(title || subtitle)
=======
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
>>>>>>> origin/main

  return (
    <>
      <Paper
<<<<<<< HEAD
        ref={ref}
        variant="outlined"
        sx={{
          width: '100%',
          p: CARD_PADDING_SPACING,
          mb: hideFooter ? 0 : 3,
          borderRadius: `${CARD_BORDER_RADIUS_PX}px`,
          borderColor: 'divider',
          boxShadow: '0px 10px 30px rgba(15, 23, 42, 0.05)',
          backgroundColor: '#ffffff',
          ...sx,
        }}
        {...paperProps}
      >
        {!hideLogo ? (
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ mb: SPACING_HEADER_BOTTOM }}
          >
            <Box
              sx={{
                width: LOGO_BOX_SIZE_PX,
                height: LOGO_BOX_SIZE_PX,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)',
              }}
            >
              <LuSend size={LOGO_ICON_SIZE_PX} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Social Media Publisher
            </Typography>
          </Stack>
        ) : null}

        {title || subtitle ? (
          <Stack
            spacing={0.5}
            alignItems="center"
            sx={{
              mb: hasHeader ? SPACING_TITLE_BOTTOM : 0,
              textAlign: 'center',
            }}
          >
            {title ? (
              <Typography variant="h5" fontWeight={700} color="text.primary">
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                variant="body2"
                fontWeight={500}
                color="text.secondary"
              >
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
        ) : null}
=======
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
>>>>>>> origin/main

        {children}
      </Paper>

<<<<<<< HEAD
      {!hideFooter ? (
        <Stack direction="row" justifyContent="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {`© Social Media Publisher ${CURRENT_YEAR}. All rights reserved.`}
          </Typography>
        </Stack>
      ) : null}
=======
      <Stack direction="row" justifyContent="center">
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {`© Social Media Publisher ${yearNow}. All rights reserved.`}
        </Typography>
      </Stack>
>>>>>>> origin/main
    </>
  )
}
