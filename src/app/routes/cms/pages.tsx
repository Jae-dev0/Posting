import { useMemo, useState } from 'react'
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
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
  ContentLayout,
} from '@/components/layout'
import {
  Dialog,
  DialogActions,
  DialogContent,
  FormDialogTitle,
  FormLabelText,
  LoadingButton,
  PageHeader,
} from '@/components/ui'
import {
  useCmsDashboard,
  useCreateCmsPage,
  useDeleteCmsPage,
  useListCmsMedia,
  useListCmsNavigation,
  useListCmsPages,
  useListCmsSettings,
  useUpdateCmsPage,
  useUpsertCmsSetting,
  type CmsPage,
} from '@/features/cms'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PERMISSIONS, useCan } from '@/lib/auth'
import { useSnackbar } from '@/lib/mui'
import { formatDate, getErrorMessage, getSuccessMessage, paginate } from '@/utils'
import type { Status } from '@/types'

export function CmsDashboardPage() {
  const { data, status, error } = useCmsDashboard()

  return (
    <ContentLayout title="CMS Dashboard">
      <PageHeader
        title="Company CMS"
        description="Website content overview for the active company"
      />
      {status === 'pending' ? (
        <Typography color="text.secondary">Loading…</Typography>
      ) : status === 'error' ? (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load CMS dashboard'}
        </Alert>
      ) : (
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {data.company?.name ?? 'Company'} ·{' '}
            {data.company?.website?.name ?? 'No website'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Chip label={`${data.totals.pages} pages`} variant="outlined" />
            <Chip
              label={`${data.totals.published} published`}
              color="success"
              variant="outlined"
            />
            <Chip label={`${data.totals.media} media`} variant="outlined" />
          </Stack>
          <Typography fontWeight={600}>Recent activity</Typography>
          {data.recentActivity.length === 0 ? (
            <Typography color="text.secondary">No recent CMS activity</Typography>
          ) : (
            data.recentActivity.map((log) => (
              <Typography key={log.id} variant="body2">
                {log.summary} · {formatDate(log.createdAt)}
              </Typography>
            ))
          )}
        </Stack>
      )}
    </ContentLayout>
  )
}

const pageFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
})

type PageFormValues = z.infer<typeof pageFormSchema>

const emptyPageForm: PageFormValues = {
  title: '',
  slug: '',
  content: '',
  status: 'draft',
}

export function CmsPagesPage() {
  const { showSuccess, showError } = useSnackbar()
  const canCreate = useCan(PERMISSIONS.CMS_CREATE)
  const canPublish = useCan(PERMISSIONS.CMS_PUBLISH)
  const canDelete = useCan(PERMISSIONS.CMS_DELETE)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: pages = [], status, error, refetch } = useListCmsPages()

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return pages
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.slug.toLowerCase().includes(q),
    )
  }, [pages, debouncedSearch])

  const { data, total, currentPage } = paginate(
    filtered,
    pagination.page,
    pagination.perPage,
  )

  const {
    control,
    reset,
    handleSubmit,
    formState: { isDirty },
  } = useForm<PageFormValues>({
    mode: 'onChange',
    defaultValues: emptyPageForm,
    resolver: zodResolver(pageFormSchema),
  })

  const createPage = useCreateCmsPage({
    onSuccess: (page) => {
      showSuccess(getSuccessMessage(page.title, 'created', 'Page'))
      setIsDialogOpen(false)
      reset(emptyPageForm)
    },
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not create page. Try again.')),
  })

  const updatePage = useUpdateCmsPage({
    onSuccess: (page) =>
      showSuccess(getSuccessMessage(page.title, 'updated', 'Page')),
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not update page. Try again.')),
  })

  const deletePage = useDeleteCmsPage({
    onSuccess: () => showSuccess('Page deleted.'),
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not delete page. Try again.')),
  })

  const onCreateSubmit = handleSubmit((formData) => {
    createPage.mutate({
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      status: formData.status,
    })
  })

  return (
    <EntityListPage
      layoutTitle="Pages"
      toolbarTitle="Pages"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          CMS pages.
        </ListPageShowingCount>
      }
      toolbarPrimaryAction={
        canCreate
          ? {
              label: 'New Page',
              onClick: () => {
                reset(emptyPageForm)
                setIsDialogOpen(true)
              },
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
          </Stack>
          <CmsPagesTable
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={error instanceof Error ? error.message : undefined}
            onRetry={() => void refetch()}
            canPublish={canPublish}
            canDelete={canDelete}
            onPublish={(page) =>
              updatePage.mutate({
                id: page.id,
                data: { status: 'published' },
              })
            }
            onUnpublish={(page) =>
              updatePage.mutate({
                id: page.id,
                data: { status: 'draft' },
              })
            }
            onDelete={(page) => deletePage.mutate(page.id)}
          />
        </PagedTableCard>
      }
      footer={
        <Dialog
          fullWidth
          maxWidth="sm"
          open={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            reset(emptyPageForm)
          }}
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
            title="Create Page"
            subtitle="Add a new CMS page for this company website."
            onClose={() => {
              setIsDialogOpen(false)
              reset(emptyPageForm)
            }}
          />
          <DialogContent>
            <Stack spacing={2} pt={1}>
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <FormLabelText required>Title</FormLabelText>
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
                name="slug"
                control={control}
                render={({ field, fieldState }) => (
                  <div>
                    <FormLabelText required>Slug</FormLabelText>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      error={Boolean(fieldState.error)}
                      helperText={
                        fieldState.error?.message || 'lowercase-kebab-case'
                      }
                    />
                  </div>
                )}
              />
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <div>
                    <FormLabelText>Content</FormLabelText>
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      multiline
                      minRows={4}
                    />
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
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="archived">Archived</MenuItem>
                    </TextField>
                  </div>
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <LoadingButton
              variant="outlined"
              onClick={() => {
                setIsDialogOpen(false)
                reset(emptyPageForm)
              }}
              disabled={createPage.isPending}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={createPage.isPending}
              disabled={!isDirty}
            >
              Create Page
            </LoadingButton>
          </DialogActions>
        </Dialog>
      }
    />
  )
}

type CmsPagesTableProps = {
  data: CmsPage[]
  status: Status
  errorMessage?: string
  onRetry: () => void
  canPublish: boolean
  canDelete: boolean
  onPublish: (page: CmsPage) => void
  onUnpublish: (page: CmsPage) => void
  onDelete: (page: CmsPage) => void
}

function CmsPagesTable({
  data,
  status,
  errorMessage,
  onRetry,
  canPublish,
  canDelete,
  onPublish,
  onUnpublish,
  onDelete,
}: CmsPagesTableProps) {
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
        {errorMessage ?? 'Could not load pages.'}
      </Alert>
    )
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No pages yet"
        description="Create your first CMS page to get started."
      />
    )
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Slug</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Updated</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((page) => {
          const { id, title, slug, status: pageStatus, updatedAt } = page
          return (
            <TableRow key={id} hover>
              <TableCell>{title}</TableCell>
              <TableCell>/{slug}</TableCell>
              <TableCell>
                <Chip size="small" label={pageStatus} variant="outlined" />
              </TableCell>
              <TableCell>{formatDate(updatedAt)}</TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  {canPublish ? (
                    pageStatus !== 'published' ? (
                      <Button size="small" onClick={() => onPublish(page)}>
                        Publish
                      </Button>
                    ) : (
                      <Button size="small" onClick={() => onUnpublish(page)}>
                        Unpublish
                      </Button>
                    )
                  ) : null}
                  {canDelete ? (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => onDelete(page)}
                    >
                      Delete
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

export function CmsMediaPage() {
  const { data: items = [], status, error } = useListCmsMedia()
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const { data, total, currentPage } = paginate(
    items,
    pagination.page,
    pagination.perPage,
  )

  return (
    <EntityListPage
      layoutTitle="Media"
      toolbarTitle="Media"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          media files.
        </ListPageShowingCount>
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
          {status === 'pending' ? (
            <Stack spacing={1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={36} />
              ))}
            </Stack>
          ) : status === 'error' ? (
            <Alert severity="error">
              {error instanceof Error ? error.message : 'Could not load media.'}
            </Alert>
          ) : !data.length ? (
            <EmptyState
              title="No media yet"
              description="Upload media via the CMS media API when ready."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>URL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => {
                  const { id, originalName, mimeType, sizeBytes, url } = item
                  return (
                    <TableRow key={id} hover>
                      <TableCell>{originalName}</TableCell>
                      <TableCell>{mimeType}</TableCell>
                      <TableCell>{Math.round(sizeBytes / 1024)} KB</TableCell>
                      <TableCell>
                        <Typography
                          component="a"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          variant="body2"
                        >
                          Open
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </PagedTableCard>
      }
    />
  )
}

export function CmsNavigationPage() {
  const { data: items = [], status, error } = useListCmsNavigation()
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const { data, total, currentPage } = paginate(
    items,
    pagination.page,
    pagination.perPage,
  )

  return (
    <EntityListPage
      layoutTitle="Navigation"
      toolbarTitle="Navigation"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          navigation items.
        </ListPageShowingCount>
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
          {status === 'pending' ? (
            <Stack spacing={1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={36} />
              ))}
            </Stack>
          ) : status === 'error' ? (
            <Alert severity="error">
              {error instanceof Error
                ? error.message
                : 'Could not load navigation.'}
            </Alert>
          ) : !data.length ? (
            <EmptyState
              title="No navigation items"
              description="Navigation links will appear here once configured."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell>Href</TableCell>
                  <TableCell>Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => {
                  const { id, label, href, sortOrder } = item
                  return (
                    <TableRow key={id} hover>
                      <TableCell>{label}</TableCell>
                      <TableCell>{href}</TableCell>
                      <TableCell>{sortOrder}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </PagedTableCard>
      }
    />
  )
}

export function CmsSettingsPage() {
  const { showSuccess, showError } = useSnackbar()
  const canEdit = useCan(PERMISSIONS.SETTINGS_EDIT)
  const { data: items = [], status, error } = useListCmsSettings()
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [key, setKey] = useState('site_title')
  const [value, setValue] = useState('')

  const upsert = useUpsertCmsSetting({
    onSuccess: () => showSuccess('Setting saved.'),
    onError: (err) =>
      showError(getErrorMessage(err, 'Could not save setting. Try again.')),
  })

  const { data, total, currentPage } = paginate(
    items,
    pagination.page,
    pagination.perPage,
  )

  return (
    <EntityListPage
      layoutTitle="Website Settings"
      toolbarTitle="Website Settings"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          website settings.
        </ListPageShowingCount>
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
              label="Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <TextField
              size="small"
              label="Value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            {canEdit ? (
              <LoadingButton
                variant="contained"
                onClick={() => upsert.mutate({ key, value })}
                disabled={!key.trim()}
                loading={upsert.isPending}
              >
                Save
              </LoadingButton>
            ) : null}
          </Stack>
          {status === 'pending' ? (
            <Stack spacing={1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={36} />
              ))}
            </Stack>
          ) : status === 'error' ? (
            <Alert severity="error">
              {error instanceof Error
                ? error.message
                : 'Could not load settings.'}
            </Alert>
          ) : !data.length ? (
            <EmptyState
              title="No settings yet"
              description="Save a key/value pair to create the first setting."
            />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.key}</TableCell>
                    <TableCell>{item.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </PagedTableCard>
      }
    />
  )
}
