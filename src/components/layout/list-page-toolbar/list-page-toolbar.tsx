import { Box, Button, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export type ListPageToolbarProps = {
  title: string
  description?: ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    startIcon?: ReactNode
    disabled?: boolean
  }
  secondaryAction?: ReactNode
}

export function ListPageToolbar({
  title,
  description,
  primaryAction,
  secondaryAction,
}: ListPageToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      spacing={2}
    >
      <Stack spacing={0.5}>
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {description}
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {secondaryAction}
        {primaryAction ? (
          <Button
            variant="contained"
            onClick={primaryAction.onClick}
            startIcon={primaryAction.startIcon}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  )
}

export type ListPageShowingCountProps = {
  count: number
  children?: ReactNode
}

export function ListPageShowingCount({
  count,
  children,
}: ListPageShowingCountProps) {
  return (
    <Typography component="span" variant="body2" color="text.secondary">
      Showing <Box component="strong">{count}</Box> {children}
    </Typography>
  )
}

export function ListPagePrimaryAddIcon() {
  return (
    <Box
      component="span"
      aria-hidden
      sx={{ fontSize: '1.1rem', lineHeight: 1 }}
    >
      +
    </Box>
  )
}

export type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Stack spacing={0.5} py={6} alignItems="center">
      <Typography variant="subtitle1">{title}</Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      ) : null}
    </Stack>
  )
}
