import { zodResolver } from '@hookform/resolvers/zod'
import { MenuItem, Stack, TextField } from '@mui/material'
import { useMemo, useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'

import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  FormDialogTitle,
  FormLabelText,
  LoadingButton,
} from '@/components/ui'
import type { PlatformRole } from '@/features/platform/api'
import { useCreateRole, useUpdateRole } from '@/features/platform'
import { useSnackbar } from '@/lib/mui'
import { getErrorMessage, getSuccessMessage } from '@/utils'

import { rolesFormSchemas, type RoleFormValues } from './schemas'

const emptyFormValues: RoleFormValues = {
  name: '',
  description: '',
  scope: 'company',
}

const SYSTEM_ROLES = new Set([
  'super_admin',
  'company_admin',
  'cms_sub_admin',
  'marketing_admin',
])

export type RoleFormDialogProps = {
  open: boolean
  onClose: () => void
  data?: PlatformRole | null
  dialogProps?: Omit<DialogProps, 'open' | 'onClose'>
}

export function RoleFormDialogs({
  open,
  onClose,
  dialogProps,
  data,
}: RoleFormDialogProps) {
  const { showSuccess, showError } = useSnackbar()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const isEditMode = Boolean(data)
  const isSystemRole = Boolean(data && SYSTEM_ROLES.has(data.name))

  const formValues = useMemo((): RoleFormValues => {
    if (!open) return emptyFormValues
    if (data) {
      return {
        name: data.name ?? '',
        description: data.description ?? '',
        scope: data.scope,
      }
    }
    return emptyFormValues
  }, [open, data])

  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<RoleFormValues>({
    mode: 'onChange',
    defaultValues: emptyFormValues,
    values: formValues,
    resolver: zodResolver(rolesFormSchemas),
  })

  const { mutate: createRole, isPending: isCreatePending } = useCreateRole({
    onSuccess: (role) => {
      onClose()
      showSuccess(getSuccessMessage(role.name, 'created', 'Role'))
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Could not create role. Try again.'),
      )
    },
  })

  const { mutate: updateRole, isPending: isUpdatePending } = useUpdateRole({
    onSuccess: (role) => {
      onClose()
      showSuccess(getSuccessMessage(role.name, 'updated', 'Role'))
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Could not update role. Try again.'),
      )
    },
  })

  const isSubmitting = isCreatePending || isUpdatePending

  const onCreateSubmit = (formData: RoleFormValues) => {
    createRole(formData)
  }

  const onUpdateSubmit = (formData: RoleFormValues) => {
    if (!data) return
    updateRole({
      id: data.id,
      data: {
        description: formData.description,
        ...(isSystemRole
          ? {}
          : { name: formData.name, scope: formData.scope }),
      },
    })
  }

  const handleFormSubmit = handleSubmit((formData) => {
    if (isEditMode) onUpdateSubmit(formData)
    else onCreateSubmit(formData)
  })

  const title = isEditMode ? 'Edit Role' : 'Create New Role'
  const subtitle = isEditMode
    ? 'Update the existing role details.'
    : 'Fill in the details to create a new role.'
  const submitLabel = isEditMode ? 'Update Role' : 'Create New Role'

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      {...dialogProps}
      slotProps={{
        paper: {
          component: 'form',
          onSubmit: (e: React.FormEvent<HTMLDivElement>) => {
            e.preventDefault()
            void handleFormSubmit()
          },
        },
        transition: {
          onEntered: () => nameInputRef.current?.focus(),
          onExited: () => reset(emptyFormValues),
        },
      }}
    >
      <FormDialogTitle title={title} subtitle={subtitle} onClose={onClose} />
      <DialogContent>
        <Stack spacing={2} pt={1}>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <FormLabelText required>Name</FormLabelText>
                <TextField
                  {...field}
                  inputRef={nameInputRef}
                  fullWidth
                  size="small"
                  placeholder="e.g. content_editor"
                  disabled={isSystemRole}
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ||
                    (isSystemRole
                      ? 'System role names cannot be changed.'
                      : 'Lowercase with underscores.')
                  }
                />
              </div>
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <FormLabelText required>Description</FormLabelText>
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  multiline
                  minRows={3}
                  placeholder="Enter description here..."
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              </div>
            )}
          />
          <Controller
            name="scope"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <FormLabelText required>Scope</FormLabelText>
                <TextField
                  {...field}
                  select
                  fullWidth
                  size="small"
                  disabled={isSystemRole}
                  error={Boolean(fieldState.error)}
                  helperText={
                    fieldState.error?.message ||
                    'Platform roles apply globally; company roles are tenant-scoped.'
                  }
                >
                  <MenuItem value="platform">Platform</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                </TextField>
              </div>
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="outlined"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </LoadingButton>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          disabled={isEditMode && !isDirty}
        >
          {submitLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
