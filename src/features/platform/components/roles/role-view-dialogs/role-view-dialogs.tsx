import { Chip, Stack, Typography } from '@mui/material'

import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  FormDialogTitle,
  LoadingButton,
} from '@/components/ui'
import type { PlatformRole } from '@/features/platform/api'

export type RoleViewDialogProps = {
  open: boolean
  onClose: () => void
  data: PlatformRole | null
  dialogProps?: Omit<DialogProps, 'open' | 'onClose'>
}

export function RoleViewDialogs({
  open,
  onClose,
  data,
  dialogProps,
}: RoleViewDialogProps) {
  if (!data) {
    return (
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={onClose}
        {...dialogProps}
      >
        <FormDialogTitle title="Role Details" onClose={onClose} />
        <DialogContent />
        <DialogActions>
          <LoadingButton variant="outlined" onClick={onClose}>
            Close
          </LoadingButton>
        </DialogActions>
      </Dialog>
    )
  }

  const { name, description, scope, assignmentCount, permissions } = data

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...dialogProps}
    >
      <FormDialogTitle title="Role Details" onClose={onClose} />
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography variant="h6" color="primary.main">
              {name}
            </Typography>
            <Chip
              size="small"
              label={scope === 'platform' ? 'Platform' : 'Company'}
              color={scope === 'platform' ? 'primary' : 'default'}
              variant="outlined"
            />
          </Stack>
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body2">{description ?? '—'}</Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            useFlexGap
          >
            <Stack spacing={0.5} flex={1}>
              <Typography variant="caption" color="text.secondary">
                Assignments
              </Typography>
              <Typography variant="body2">{assignmentCount}</Typography>
            </Stack>
            <Stack spacing={0.5} flex={1}>
              <Typography variant="caption" color="text.secondary">
                Permissions
              </Typography>
              <Typography variant="body2">{permissions.length}</Typography>
            </Stack>
          </Stack>
          <Stack spacing={0.75}>
            <Typography variant="caption" color="text.secondary">
              Granted permissions
            </Typography>
            <Stack direction="row" gap={0.5} flexWrap="wrap">
              {permissions.map((permission) => (
                <Chip
                  key={permission.id}
                  size="small"
                  label={permission.name}
                  variant="outlined"
                />
              ))}
              {permissions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No permissions assigned.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton variant="outlined" onClick={onClose}>
          Close
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
