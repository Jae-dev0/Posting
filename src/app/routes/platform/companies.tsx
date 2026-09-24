import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router'
import { z } from 'zod'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  Dialog,
  DialogActions,
  DialogContent,
  FormDialogTitle,
  FormLabelText,
  LoadingButton,
} from '@/components/ui'
import { paths } from '@/config/paths'
import {
  useCreateCompany,
  useListCompanies,
  useUpdateCompany,
  type Company,
} from '@/features/platform'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PERMISSIONS, useCan } from '@/lib/auth'
import { useSnackbar } from '@/lib/mui'
import { setActiveCompanyId } from '@/lib/tenant-context'
import type { Status } from '@/types'
import { getErrorMessage, getSuccessMessage, paginate } from '@/utils'

const companyFormSchema = z.object({
  name: z.string().trim().min(1, 'Company name is required'),
  domain: z.string().trim().optional(),
  status: z.enum(['active', 'disabled']),
  adminFirstName: z.string().trim().optional(),
  adminLastName: z.string().trim().optional(),
  adminEmail: z.string().trim().optional(),
  adminPassword: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

const emptyFormValues: CompanyFormValues = {
  name: '',
  domain: '',
  status: 'active',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPassword: '',
}

export function PlatformCompaniesPage() {
  const { showSuccess, showError, showNotification } = useSnackbar()
  const canCreate = useCan(PERMISSIONS.COMPANY_CREATE)
  const canEdit = useCan(PERMISSIONS.COMPANY_EDIT)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'disabled' | ''>(
    '',
  )
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    data: companies = [],
    status,
    error,
    refetch,
  } = useListCompanies({
    search: debouncedSearch,
    status: statusFilter,
  })

  const { data, total, currentPage } = useMemo(
    () => paginate(companies, pagination.page, pagination.perPage),
    [companies, pagination.page, pagination.perPage],
  )

  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<CompanyFormValues>({
    mode: 'onChange',
    defaultValues: emptyFormValues,
    resolver: zodResolver(companyFormSchema),
  })

  const createCompany = useCreateCompany({
    onSuccess: (company) => {
      showSuccess(getSuccessMessage(company.name, 'created', 'Company'))
      setIsDialogOpen(false)
      reset(emptyFormValues)
    },
    onError: (err) => {
      showError(getErrorMessage(err, 'Could not create company. Try again.'))
    },
  })

  const updateCompany = useUpdateCompany({
    onSuccess: (company) => {
      showSuccess(getSuccessMessage(company.name, 'updated', 'Company'))
    },
    onError: (err) => {
      showError(getErrorMessage(err, 'Could not update company. Try again.'))
    },
  })

  const handleOpenCreate = () => {
    reset(emptyFormValues)
    setIsDialogOpen(true)
  }

  const handleCloseCreate = () => {
    setIsDialogOpen(false)
    reset(emptyFormValues)
  }

  const onCreateSubmit = handleSubmit((formData) => {
    const hasAdmin =
      Boolean(formData.adminEmail?.trim()) &&
      Boolean(formData.adminPassword) &&
      Boolean(formData.adminFirstName?.trim()) &&
      Boolean(formData.adminLastName?.trim())

    createCompany.mutate({
      name: formData.name,
      domain: formData.domain || null,
      status: formData.status,
      admin: hasAdmin
        ? {
            firstName: formData.adminFirstName!,
            lastName: formData.adminLastName!,
            email: formData.adminEmail!,
            password: formData.adminPassword!,
          }
        : undefined,
    })
  })

  return (
    <>
      <EntityListPage
        layoutTitle="Companies"
        toolbarTitle="Companies"
        toolbarDescription={
          <ListPageShowingCount count={status === 'success' ? total : 0}>
            companies available.
          </ListPageShowingCount>
        }
        toolbarPrimaryAction={
          canCreate
            ? {
                label: 'Create Company',
                onClick: handleOpenCreate,
                startIcon: <ListPagePrimaryAddIcon />,
              }
            : undefined
        }
        pagedTable={
          <PagedTableCard
            count={status === 'success' ? total : 0}
            page={currentPage - 1}
            rowsPerPage={pagination.perPage}
            onPageChange={(_, page) =>
              setPagination((prev) => ({ ...prev, page: page + 1 }))
            }
            onRowsPerPageChange={(e) => {
              setPagination({
                page: 1,
                perPage: parseInt(e.target.value, 10),
              })
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
              <TextField
                size="small"
                label="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                sx={{ minWidth: 220 }}
              />
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as 'active' | 'disabled' | '')
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </TextField>
            </Stack>
            <CompanyTables
              data={status === 'success' ? data : []}
              status={status}
              errorMessage={error instanceof Error ? error.message : undefined}
              onRetry={() => void refetch()}
              canEdit={canEdit}
              onToggleStatus={(company) =>
                updateCompany.mutate({
                  id: company.id,
                  data: {
                    status: company.status === 'active' ? 'disabled' : 'active',
                  },
                })
              }
              onUseInMarketing={(company) => {
                setActiveCompanyId(company.id)
                showNotification(
                  `Marketing context set to ${company.name}`,
                  'info',
                )
              }}
              onViewCms={(company) => setActiveCompanyId(company.id)}
            />
          </PagedTableCard>
        }
        footer={
          <Dialog
            fullWidth
            maxWidth="sm"
            open={isDialogOpen}
            onClose={handleCloseCreate}
            slotProps={{
              paper: {
                component: 'form',
                onSubmit: (e: React.FormEvent<HTMLDivElement>) => {
                  e.preventDefault()
                  void onCreateSubmit()
                },
              },
            }}
          >
            <FormDialogTitle
              title="Create Company"
              subtitle="Add a company and optional CMS admin account."
              onClose={handleCloseCreate}
            />
            <DialogContent>
              <Stack spacing={2} pt={1}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div>
                      <FormLabelText required>Company name</FormLabelText>
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        error={Boolean(fieldState.error)}
                        helperText={fieldState.error?.message}
                      />
                    </div>
                  )}
                />
                <Controller
                  name="domain"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <FormLabelText>Domain</FormLabelText>
                      <TextField {...field} fullWidth size="small" />
                    </div>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <FormLabelText required>Status</FormLabelText>
                      <TextField {...field} select fullWidth size="small">
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="disabled">Disabled</MenuItem>
                      </TextField>
                    </div>
                  )}
                />
                <Typography variant="subtitle2">Optional CMS Admin</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Controller
                    name="adminFirstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First name"
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                  <Controller
                    name="adminLastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last name"
                        fullWidth
                        size="small"
                      />
                    )}
                  />
                </Stack>
                <Controller
                  name="adminEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Admin email"
                      fullWidth
                      size="small"
                    />
                  )}
                />
                <Controller
                  name="adminPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Admin password"
                      type="password"
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <LoadingButton
                variant="outlined"
                onClick={handleCloseCreate}
                disabled={createCompany.isPending}
              >
                Cancel
              </LoadingButton>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={createCompany.isPending}
                disabled={!isDirty}
              >
                Create Company
              </LoadingButton>
            </DialogActions>
          </Dialog>
        }
      />
    </>
  )
}

type CompanyTablesProps = {
  data: Company[]
  status: Status
  errorMessage?: string
  onRetry: () => void
  canEdit: boolean
  onToggleStatus: (company: Company) => void
  onUseInMarketing: (company: Company) => void
  onViewCms: (company: Company) => void
}

function CompanyTables({
  data,
  status,
  errorMessage,
  onRetry,
  canEdit,
  onToggleStatus,
  onUseInMarketing,
  onViewCms,
}: CompanyTablesProps) {
  if (status === 'pending') {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={36} />
        ))}
      </Stack>
    )
  }

  if (status === 'error') {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        }
      >
        {errorMessage ?? 'Could not load companies.'}
      </Alert>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No companies found"
        description="Create a company to get started."
      />
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Domain</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Users</TableCell>
          <TableCell>Websites</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((company) => {
          const {
            id,
            name,
            domain,
            status: companyStatus,
            userCount,
            websiteCount,
          } = company
          return (
            <TableRow key={id} hover>
              <TableCell>{name}</TableCell>
              <TableCell>{domain || '—'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={companyStatus}
                  color={companyStatus === 'active' ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>{userCount ?? '—'}</TableCell>
              <TableCell>{websiteCount ?? '—'}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    onClick={() => onUseInMarketing(company)}
                  >
                    Use in Marketing
                  </Button>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={paths.cms.dashboard.getHref()}
                    onClick={() => onViewCms(company)}
                  >
                    View CMS
                  </Button>
                  {canEdit ? (
                    <Button
                      size="small"
                      color={companyStatus === 'active' ? 'warning' : 'success'}
                      onClick={() => onToggleStatus(company)}
                    >
                      {companyStatus === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
