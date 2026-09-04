import { MenuItem, Stack, TextField } from '@mui/material'

export type RoleFilterParams = {
  q?: string
  scope?: 'platform' | 'company' | ''
}

export type RoleFiltersProps = {
  filters: RoleFilterParams
  onFilterChange: (data: RoleFilterParams) => void
}

export function RoleFilters({ filters, onFilterChange }: RoleFiltersProps) {
  const { q: search, scope } = filters

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
      <TextField
        size="small"
        label="Search roles"
        placeholder="Search by role name or description..."
        value={search ?? ''}
        onChange={(e) =>
          onFilterChange({ ...filters, q: e.target.value || undefined })
        }
        fullWidth
      />
      <TextField
        select
        size="small"
        label="Scope"
        value={scope ?? ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            scope: (e.target.value || '') as RoleFilterParams['scope'],
          })
        }
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">All scopes</MenuItem>
        <MenuItem value="platform">Platform</MenuItem>
        <MenuItem value="company">Company</MenuItem>
      </TextField>
    </Stack>
  )
}
