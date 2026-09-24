import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  IconButton,
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
import { LuPencil, LuTrash2 } from 'react-icons/lu'

import {
  EmptyState,
  EntityListPage,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import { Dialog, FormDialogTitle, LoadingButton } from '@/components/ui'
import {
  useDeletePlatformResource,
  useListCompanies,
  usePlatformMedia,
  usePlatformSettings,
  usePlatformWebsites,
  useSavePlatformSetting,
  useSavePlatformWebsite,
  type PlatformSetting,
  type PlatformWebsite,
} from '@/features/platform'
import { useSnackbar } from '@/lib/mui'
import { formatDate } from '@/utils'

const EMPTY_WEBSITE = { companyId: 0, name: '', domain: '', isPrimary: false }
const EMPTY_SETTING = { websiteId: 0, key: '', value: '' }

function ResourceState({
  status,
  error,
  empty,
  children,
}: {
  status: 'pending' | 'error' | 'success'
  error: unknown
  empty: boolean
  children: React.ReactNode
}) {
  const renderContent = () => {
    if (status === 'pending')
      return (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={38} />
          ))}
        </Stack>
      )
    if (status === 'error')
      return (
        <Alert severity="error">
          {error instanceof Error
            ? error.message
            : 'Could not load platform data.'}
        </Alert>
      )
    if (empty)
      return (
        <EmptyState
          title="No records found"
          description="Create a record or adjust your search."
        />
      )
    return children
  }
  return <Stack>{renderContent()}</Stack>
}

export function PlatformWebsitesPage() {
  const { showSuccess, showError } = useSnackbar()
  const query = usePlatformWebsites()
  const { data: companies = [] } = useListCompanies()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<PlatformWebsite>()
  const [form, setForm] = useState(EMPTY_WEBSITE)
  const [open, setOpen] = useState(false)
  const save = useSavePlatformWebsite({
    onSuccess: () => {
      showSuccess('Website saved.')
      setOpen(false)
    },
    onError: (error) => showError(error.message),
  })
  const remove = useDeletePlatformResource('websites', {
    onSuccess: () => showSuccess('Website deleted.'),
    onError: (error) => showError(error.message),
  })
  const websites = useMemo(
    () =>
      (query.data ?? []).filter((item) =>
        `${item.name} ${item.domain ?? ''} ${item.company.name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [query.data, search],
  )
  const openForm = (website?: PlatformWebsite) => {
    setSelected(website)
    setForm(
      website
        ? {
            companyId: website.companyId,
            name: website.name,
            domain: website.domain ?? '',
            isPrimary: website.isPrimary,
          }
        : EMPTY_WEBSITE,
    )
    setOpen(true)
  }

  return (
    <>
      <EntityListPage
        layoutTitle="Websites"
        toolbarTitle="Website Management"
        toolbarDescription={
          <ListPageShowingCount
            count={query.status === 'success' ? websites.length : 0}
          >
            websites across all companies.
          </ListPageShowingCount>
        }
        toolbarPrimaryAction={{
          label: 'Create Website',
          onClick: () => openForm(),
          startIcon: <ListPagePrimaryAddIcon />,
        }}
        pagedTable={
          <PagedTableCard
            count={websites.length}
            page={0}
            rowsPerPage={Math.max(websites.length, 10)}
            onPageChange={() => undefined}
            onRowsPerPageChange={() => undefined}
          >
            <TextField
              size="small"
              label="Search websites"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ mb: 2, minWidth: 260 }}
            />
            <ResourceState
              status={query.status}
              error={query.error}
              empty={!websites.length}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Website</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Domain</TableCell>
                    <TableCell>Content</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {websites.map((website) => (
                    <TableRow key={website.id} hover>
                      <TableCell>
                        {website.name}
                        {website.isPrimary ? ' (Primary)' : ''}
                      </TableCell>
                      <TableCell>{website.company.name}</TableCell>
                      <TableCell>{website.domain ?? '—'}</TableCell>
                      <TableCell>
                        {website._count.pages} pages · {website._count.media}{' '}
                        media
                      </TableCell>
                      <TableCell>{formatDate(website.updatedAt)}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label={`Edit ${website.name}`}
                          onClick={() => openForm(website)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          aria-label={`Delete ${website.name}`}
                          color="error"
                          disabled={website.isPrimary || remove.isPending}
                          onClick={() => remove.mutate(website.id)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResourceState>
          </PagedTableCard>
        }
      />
      <Dialog
        fullWidth
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent) => {
              event.preventDefault()
              save.mutate({
                id: selected?.id,
                data: { ...form, domain: form.domain || null },
              })
            },
          },
        }}
      >
        <FormDialogTitle
          title={selected ? 'Edit Website' : 'Create Website'}
          subtitle="Manage a website within a company."
          onClose={() => setOpen(false)}
        />
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              select
              required
              label="Company"
              value={form.companyId}
              disabled={Boolean(selected)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  companyId: Number(event.target.value),
                }))
              }
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              label="Website name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <TextField
              label="Domain"
              value={form.domain}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  domain: event.target.value,
                }))
              }
            />
            <TextField
              select
              label="Type"
              value={form.isPrimary ? 'primary' : 'additional'}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isPrimary: event.target.value === 'primary',
                }))
              }
            >
              <MenuItem value="primary">Primary</MenuItem>
              <MenuItem value="additional">Additional</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={save.isPending}
            disabled={!form.companyId || !form.name.trim()}
          >
            Save Website
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export function PlatformMediaPage() {
  const { showSuccess, showError } = useSnackbar()
  const query = usePlatformMedia()
  const [search, setSearch] = useState('')
  const remove = useDeletePlatformResource('media', {
    onSuccess: () => showSuccess('Media deleted.'),
    onError: (error) => showError(error.message),
  })
  const media = useMemo(
    () =>
      (query.data ?? []).filter((item) =>
        `${item.originalName} ${item.company.name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [query.data, search],
  )
  return (
    <EntityListPage
      layoutTitle="Media"
      toolbarTitle="Media Management"
      toolbarDescription={
        <ListPageShowingCount
          count={query.status === 'success' ? media.length : 0}
        >
          media files across all companies.
        </ListPageShowingCount>
      }
      pagedTable={
        <PagedTableCard
          count={media.length}
          page={0}
          rowsPerPage={Math.max(media.length, 10)}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        >
          <TextField
            size="small"
            label="Search media"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ mb: 2, minWidth: 260 }}
          />
          <ResourceState
            status={query.status}
            error={query.error}
            empty={!media.length}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Uploaded</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {media.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography
                        component="a"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="body2"
                      >
                        {item.originalName}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.company.name}</TableCell>
                    <TableCell>{item.website?.name ?? 'Unassigned'}</TableCell>
                    <TableCell>{item.mimeType}</TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label={`Delete ${item.originalName}`}
                        color="error"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(item.id)}
                      >
                        <LuTrash2 />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResourceState>
        </PagedTableCard>
      }
    />
  )
}

export function PlatformSettingsPage() {
  const { showSuccess, showError } = useSnackbar()
  const query = usePlatformSettings()
  const { data: websites = [] } = usePlatformWebsites()
  const [selected, setSelected] = useState<PlatformSetting>()
  const [form, setForm] = useState(EMPTY_SETTING)
  const [open, setOpen] = useState(false)
  const save = useSavePlatformSetting({
    onSuccess: () => {
      showSuccess('Setting saved.')
      setOpen(false)
    },
    onError: (error) => showError(error.message),
  })
  const remove = useDeletePlatformResource('settings', {
    onSuccess: () => showSuccess('Setting deleted.'),
    onError: (error) => showError(error.message),
  })
  const openForm = (setting?: PlatformSetting) => {
    setSelected(setting)
    setForm(
      setting
        ? {
            websiteId: setting.websiteId,
            key: setting.key,
            value: setting.value,
          }
        : EMPTY_SETTING,
    )
    setOpen(true)
  }
  const settings = query.data ?? []
  return (
    <>
      <EntityListPage
        layoutTitle="System Settings"
        toolbarTitle="System Settings"
        toolbarDescription={
          <ListPageShowingCount
            count={query.status === 'success' ? settings.length : 0}
          >
            website settings across the platform.
          </ListPageShowingCount>
        }
        toolbarPrimaryAction={{
          label: 'Create Setting',
          onClick: () => openForm(),
          startIcon: <ListPagePrimaryAddIcon />,
        }}
        pagedTable={
          <PagedTableCard
            count={settings.length}
            page={0}
            rowsPerPage={Math.max(settings.length, 10)}
            onPageChange={() => undefined}
            onRowsPerPageChange={() => undefined}
          >
            <ResourceState
              status={query.status}
              error={query.error}
              empty={!settings.length}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Website</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {settings.map((setting) => (
                    <TableRow key={setting.id} hover>
                      <TableCell>{setting.key}</TableCell>
                      <TableCell>{setting.value}</TableCell>
                      <TableCell>{setting.website.name}</TableCell>
                      <TableCell>{setting.company.name}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label={`Edit ${setting.key}`}
                          onClick={() => openForm(setting)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          aria-label={`Delete ${setting.key}`}
                          color="error"
                          disabled={remove.isPending}
                          onClick={() => remove.mutate(setting.id)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResourceState>
          </PagedTableCard>
        }
      />
      <Dialog
        fullWidth
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            component: 'form',
            onSubmit: (event: React.FormEvent) => {
              event.preventDefault()
              save.mutate(form)
            },
          },
        }}
      >
        <FormDialogTitle
          title={selected ? 'Edit Setting' : 'Create Setting'}
          subtitle="Configure a website-level platform value."
          onClose={() => setOpen(false)}
        />
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <TextField
              select
              required
              label="Website"
              value={form.websiteId}
              disabled={Boolean(selected)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  websiteId: Number(event.target.value),
                }))
              }
            >
              {websites.map((website) => (
                <MenuItem key={website.id} value={website.id}>
                  {website.company.name} — {website.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              label="Setting key"
              value={form.key}
              disabled={Boolean(selected)}
              onChange={(event) =>
                setForm((current) => ({ ...current, key: event.target.value }))
              }
            />
            <TextField
              required
              multiline
              minRows={3}
              label="Value"
              value={form.value}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  value: event.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            loading={save.isPending}
            disabled={!form.websiteId || !form.key.trim()}
          >
            Save Setting
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}
