import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  type CmsAccount,
  type CmsAccountCatalog,
  type CmsAccountInput,
  useCmsAccountCatalog,
  useCreateCmsAccount,
  useListCmsAccounts,
  useSuspendCmsAccount,
  useUpdateCmsAccount,
} from '@/features/cms'
import { useAuth, PERMISSIONS, useCan } from '@/lib/auth'
import { useConfirm, useSnackbar } from '@/lib/mui'
import { getErrorMessage, getSuccessMessage } from '@/utils'

const accountFormSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().email('Enter a valid email'),
    password: z.string(),
    roleIds: z.array(z.number()).min(1, 'Assign at least one role'),
    websiteAccessMode: z.enum(['all_websites', 'selected_websites']),
    websiteIds: z.array(z.number()),
    status: z.enum(['active', 'disabled']),
  })
  .superRefine((value, context) => {
    if (
      value.websiteAccessMode === 'selected_websites' &&
      !value.websiteIds.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['websiteIds'],
        message: 'Select at least one website',
      })
    }
  })
type AccountFormValues = z.infer<typeof accountFormSchema>

const EMPTY_FORM: AccountFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  roleIds: [],
  websiteAccessMode: 'all_websites',
  websiteIds: [],
  status: 'active',
}

export function CmsUsersPage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const canCreate = useCan(PERMISSIONS.USER_CREATE)
  const canEdit = useCan(PERMISSIONS.USER_EDIT)
  const { data: accounts = [], status, error } = useListCmsAccounts()
  const catalogQuery = useCmsAccountCatalog()
  const [selectedAccount, setSelectedAccount] = useState<CmsAccount | null>(
    null,
  )
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const createAccount = useCreateCmsAccount({
    onSuccess: (account) => {
      showSuccess(getSuccessMessage(account.fullname, 'created', 'Account'))
      setIsDialogOpen(false)
    },
    onError: (requestError) =>
      showError(getErrorMessage(requestError, 'Could not create account.')),
  })
  const updateAccount = useUpdateCmsAccount({
    onSuccess: (account) => {
      showSuccess(getSuccessMessage(account.fullname, 'updated', 'Account'))
      setIsDialogOpen(false)
    },
    onError: (requestError) =>
      showError(getErrorMessage(requestError, 'Could not update account.')),
  })
  const suspendAccount = useSuspendCmsAccount({
    onSuccess: () => showSuccess('Account suspended.'),
    onError: (requestError) =>
      showError(getErrorMessage(requestError, 'Could not suspend account.')),
  })

  const handleSuspend = async (account: CmsAccount) => {
    try {
      await confirm({
        title: 'Suspend account?',
        description: `${account.fullname} will no longer be able to sign in. Historical activity will be kept.`,
        confirmationText: 'Suspend',
        cancellationText: 'Cancel',
      })
      suspendAccount.mutate(account.id)
    } catch {
      /* cancellation intentionally has no side effect */
    }
  }

  const openCreate = () => {
    setSelectedAccount(null)
    setIsDialogOpen(true)
  }
  const openEdit = (account: CmsAccount) => {
    setSelectedAccount(account)
    setIsDialogOpen(true)
  }
  const closeDialog = () => {
    setIsDialogOpen(false)
    setSelectedAccount(null)
  }
  const catalog = catalogQuery.status === 'success' ? catalogQuery.data : null

  return (
    <EntityListPage
      layoutTitle="CMS Accounts"
      toolbarTitle="CMS Accounts"
      toolbarDescription={
        <ListPageShowingCount
          count={status === 'success' ? accounts.length : 0}
        >
          CMS accounts in this company.
        </ListPageShowingCount>
      }
      toolbarPrimaryAction={
        canCreate
          ? {
              label: 'Create account',
              onClick: openCreate,
              startIcon: <ListPagePrimaryAddIcon />,
            }
          : undefined
      }
      pagedTable={
        <PagedTableCard
          count={status === 'success' ? accounts.length : 0}
          page={0}
          rowsPerPage={10}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        >
          <AccountsTable
            accounts={accounts}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            currentUserId={user?.id}
            canEdit={canEdit}
            onEdit={openEdit}
            onSuspend={handleSuspend}
          />
        </PagedTableCard>
      }
      footer={
        <AccountDialog
          open={isDialogOpen}
          account={selectedAccount}
          catalog={catalog}
          catalogError={
            catalogQuery.status === 'error'
              ? catalogQuery.error.message
              : undefined
          }
          isSaving={createAccount.isPending || updateAccount.isPending}
          onClose={closeDialog}
          onCreate={(data) => createAccount.mutate(data)}
          onUpdate={(id, data) => updateAccount.mutate({ id, data })}
        />
      }
    />
  )
}

function AccountsTable({
  accounts,
  status,
  errorMessage,
  currentUserId,
  canEdit,
  onEdit,
  onSuspend,
}: {
  accounts: CmsAccount[]
  status: string
  errorMessage?: string
  currentUserId?: number
  canEdit: boolean
  onEdit: (account: CmsAccount) => void
  onSuspend: (account: CmsAccount) => void
}) {
  if (status === 'pending')
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} height={36} />
        ))}
      </Stack>
    )
  if (status === 'error')
    return (
      <Alert severity="error">
        {errorMessage ?? 'Could not load accounts.'}
      </Alert>
    )
  if (!accounts.length)
    return (
      <EmptyState
        title="No accounts yet"
        description="Create an account and assign roles and website access."
      />
    )
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Roles</TableCell>
          <TableCell>Website access</TableCell>
          <TableCell>Status</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {accounts.map((account) => (
          <TableRow key={account.id} hover>
            <TableCell>
              {account.fullname}
              <br />
              <small>{account.email}</small>
            </TableCell>
            <TableCell>
              {account.roles.map((role) => role.name).join(', ')}
            </TableCell>
            <TableCell>
              {account.websiteAccessMode === 'all_websites'
                ? 'All websites'
                : `${account.websiteIds.length} selected`}
            </TableCell>
            <TableCell>
              <Chip
                size="small"
                label={account.status}
                color={account.status === 'active' ? 'success' : 'default'}
              />
            </TableCell>
            <TableCell align="right">
              {canEdit ? (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => onEdit(account)}>
                    Edit
                  </Button>
                  {account.status === 'active' &&
                  account.id !== currentUserId ? (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onSuspend(account)}
                    >
                      Suspend
                    </Button>
                  ) : null}
                </Stack>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function AccountDialog({
  open,
  account,
  catalog,
  catalogError,
  isSaving,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean
  account: CmsAccount | null
  catalog: CmsAccountCatalog | null
  catalogError?: string
  isSaving: boolean
  onClose: () => void
  onCreate: (data: Required<CmsAccountInput>) => void
  onUpdate: (id: number, data: CmsAccountInput) => void
}) {
  const isEditMode = Boolean(account)
  const values = useMemo<AccountFormValues>(
    () =>
      account
        ? {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            password: '',
            roleIds: account.roleIds,
            websiteAccessMode: account.websiteAccessMode,
            websiteIds: account.websiteIds,
            status: account.status,
          }
        : EMPTY_FORM,
    [account],
  )
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    values,
  })
  const accessMode = watch('websiteAccessMode')
  const submit = handleSubmit((values) => {
    const data: CmsAccountInput = {
      ...values,
      password: values.password || undefined,
    }
    if (isEditMode && account) onUpdate(account.id, data)
    else onCreate({ ...data, password: values.password })
  })
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <DialogTitle>
          {isEditMode ? 'Edit account' : 'Create account'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {catalogError ? (
              <Alert severity="error">{catalogError}</Alert>
            ) : null}
            {!catalog ? (
              <Skeleton height={240} />
            ) : (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First name"
                        required
                        autoComplete="given-name"
                        error={Boolean(errors.firstName)}
                        helperText={errors.firstName?.message}
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last name"
                        required
                        autoComplete="family-name"
                        error={Boolean(errors.lastName)}
                        helperText={errors.lastName?.message}
                        fullWidth
                      />
                    )}
                  />
                </Stack>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      required
                      autoComplete="email"
                      error={Boolean(errors.email)}
                      helperText={errors.email?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={
                        isEditMode ? 'New password (optional)' : 'Password'
                      }
                      type="password"
                      required={!isEditMode}
                      autoComplete="new-password"
                      inputProps={{ minLength: 8 }}
                      helperText="Minimum 8 characters"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="roleIds"
                  control={control}
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.roleIds)}>
                      <FormLabel>Roles</FormLabel>
                      {catalog.roles.map((role) => (
                        <FormControlLabel
                          key={role.id}
                          label={role.name}
                          control={
                            <Checkbox
                              checked={field.value.includes(role.id)}
                              onChange={(_, checked) =>
                                field.onChange(
                                  checked
                                    ? [...field.value, role.id]
                                    : field.value.filter(
                                        (id) => id !== role.id,
                                      ),
                                )
                              }
                            />
                          }
                        />
                      ))}
                      <FormHelperText>{errors.roleIds?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
                <Controller
                  name="websiteAccessMode"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel>Website access</FormLabel>
                      <RadioGroup {...field} row>
                        <FormControlLabel
                          value="all_websites"
                          control={<Radio />}
                          label="All websites"
                        />
                        <FormControlLabel
                          value="selected_websites"
                          control={<Radio />}
                          label="Selected websites"
                        />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                {accessMode === 'selected_websites' ? (
                  <Controller
                    name="websiteIds"
                    control={control}
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.websiteIds)}>
                        <FormLabel>Assigned websites</FormLabel>
                        {catalog.websites.map((website) => (
                          <FormControlLabel
                            key={website.id}
                            label={website.name}
                            control={
                              <Checkbox
                                checked={field.value.includes(website.id)}
                                onChange={(_, checked) =>
                                  field.onChange(
                                    checked
                                      ? [...field.value, website.id]
                                      : field.value.filter(
                                          (id) => id !== website.id,
                                        ),
                                  )
                                }
                              />
                            }
                          />
                        ))}
                        <FormHelperText>
                          {errors.websiteIds?.message}
                        </FormHelperText>
                      </FormControl>
                    )}
                  />
                ) : null}
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Status"
                      SelectProps={{ native: true }}
                      fullWidth
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </TextField>
                  )}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || !catalog}
          >
            {isEditMode ? 'Save changes' : 'Create account'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
