import {
  Button,
  Dialog as MuiDialog,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  type DialogProps as MuiDialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { MdClose } from 'react-icons/md'

export type DialogProps = MuiDialogProps

export function Dialog(props: DialogProps) {
  return <MuiDialog {...props} />
}

export function DialogContent(
  props: React.ComponentProps<typeof MuiDialogContent>,
) {
  return <MuiDialogContent dividers {...props} />
}

export function DialogActions(
  props: React.ComponentProps<typeof MuiDialogActions>,
) {
  return <MuiDialogActions {...props} />
}

export type FormDialogTitleProps = {
  title: string
  subtitle?: string
  onClose: () => void
}

export function FormDialogTitle({
  title,
  subtitle,
  onClose,
}: FormDialogTitleProps) {
  return (
    <DialogTitle>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={2}
      >
        <Stack spacing={0.25}>
          <Typography variant="h6" component="span">
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        <IconButton aria-label="Close dialog" onClick={onClose} edge="end">
          <MdClose />
        </IconButton>
      </Stack>
    </DialogTitle>
  )
}

export type FormLabelTextProps = {
  children: ReactNode
  required?: boolean
}

export function FormLabelText({ children, required }: FormLabelTextProps) {
  return (
    <Typography
      variant="body2"
      component="label"
      sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}
    >
      {children}
      {required ? (
        <Typography component="span" color="error.main">
          {' '}
          *
        </Typography>
      ) : null}
    </Typography>
  )
}

export type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

export function LoadingButton({
  loading,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? 'Saving…' : children}
    </Button>
  )
}
