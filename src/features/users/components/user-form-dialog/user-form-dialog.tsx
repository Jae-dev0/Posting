import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
  type DialogProps,
} from '@mui/material'
import { FormEvent, useEffect, useState } from 'react'

import { useSnackbar } from '@/lib/mui/snackbar-hooks'

import { useCreateUser, useUpdateUser, type ManagedUser } from '../../api'
import { USER_ROLE, USER_ROLE_OPTIONS } from '../../constants'
import { getApiErrorMessage } from '../../lib/get-api-error-message'

import {
  createUserFormSchema,
  userFormSchema,
  type UserFormValues,
} from './schemas'

export type UserFormDialogProps = {
  open: boolean
  onClose: () => void
  user?: ManagedUser | null
  dialogProps?: Omit<DialogProps, 'open' | 'onClose'>
}

const emptyFormValues: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: USER_ROLE.ADMIN,
  password: '',
  confirmPassword: '',
}

export function UserFormDialog({
  open,
  onClose,
  user,
  dialogProps,
}: UserFormDialogProps) {
  const { showSuccess, showError } = useSnackbar()
  const isEditMode = Boolean(user)
  const [values, setValues] = useState<UserFormValues>(emptyFormValues)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    if (user) {
      setValues({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        password: '',
        confirmPassword: '',
      })
    } else {
      setValues(emptyFormValues)
    }
    setError(null)
  }, [open, user])

  const { mutate: createUser, isPending: isCreatePending } = useCreateUser({
    onSuccess: (data) => {
      onClose()
      showSuccess(`Created account for ${data.fullname}.`)
    },
    onError: (mutationError) => {
      showError(getApiErrorMessage(mutationError, 'Could not create account.'))
    },
  })

  const { mutate: updateUser, isPending: isUpdatePending } = useUpdateUser({
    onSuccess: (data) => {
      onClose()
      showSuccess(`Updated account for ${data.fullname}.`)
    },
    onError: (mutationError) => {
      showError(getApiErrorMessage(mutationError, 'Could not update account.'))
    },
  })

  const isSubmitting = isCreatePending || isUpdatePending
  const title = isEditMode ? 'Edit Account' : 'Create Account'
  const subtitle = isEditMode
    ? 'Update this admin account details and access level.'
    : 'Add a new admin account that can sign in to the publisher.'
  const submitLabel = isEditMode ? 'Update Account' : 'Create Account'

  const updateField = <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const schema = isEditMode ? userFormSchema : createUserFormSchema
    const parsed = schema.safeParse(values)

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form input')
      return
    }

    const { firstName, lastName, email, role, password } = parsed.data

    if (isEditMode && user) {
      updateUser({
        userId: user.id,
        data: {
          firstName,
          lastName,
          email,
          role,
          ...(password ? { password } : {}),
        },
      })
      return
    }

    createUser({
      firstName,
      lastName,
      email,
      role,
      password,
    })
  }

  return (
    <Dialog
      key={isEditMode ? `edit-${user?.id ?? 'new'}` : 'create'}
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...dialogProps}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: handleSubmit,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="First name"
              value={values.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label="Last name"
              value={values.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Email"
            type="email"
            autoComplete="off"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Role"
            value={values.role}
            onChange={(event) => {
              const nextRole = event.target.value
              if (
                nextRole === USER_ROLE.MAIN_ADMIN ||
                nextRole === USER_ROLE.ADMIN
              ) {
                updateField('role', nextRole)
              }
            }}
            fullWidth
          >
            {USER_ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={isEditMode ? 'New password (optional)' : 'Password'}
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField('password', event.target.value)}
            fullWidth
            helperText={
              isEditMode
                ? 'Leave blank to keep the current password.'
                : 'At least 8 characters.'
            }
          />

          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) =>
              updateField('confirmPassword', event.target.value)
            }
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
