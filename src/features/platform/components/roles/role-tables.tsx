import {
  Alert,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { MdEdit, MdVisibility } from 'react-icons/md'

import { EmptyState } from '@/components/layout'
import type { PlatformRole } from '@/features/platform/api'
import type { Status } from '@/types'

export type RoleTablesProps = {
  data: PlatformRole[]
  status: Status
  onViewItem?: (item: PlatformRole) => void
  onEditItem?: (item: PlatformRole) => void
}

export function RoleTables({
  data,
  status,
  onViewItem,
  onEditItem,
}: RoleTablesProps) {
  const renderBody = () => {
    if (status === 'pending') {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}>
            <Skeleton height={28} />
          </TableCell>
        </TableRow>
      ))
    }

    if (status === 'error') {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Alert severity="error">Could not load roles.</Alert>
          </TableCell>
        </TableRow>
      )
    }

    if (!data || data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <EmptyState
              title="No roles"
              description="Create a role to assign module permissions."
            />
          </TableCell>
        </TableRow>
      )
    }

    return data.map((item) => {
      const { id, name, description, scope, assignmentCount, permissions } =
        item

      return (
        <TableRow
          key={id}
          hover
          sx={{ cursor: onViewItem ? 'pointer' : 'default' }}
          onClick={() => onViewItem?.(item)}
        >
          <TableCell>
            <Typography variant="body2" fontWeight={600}>
              {name}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2" color="text.secondary" noWrap>
              {description ?? '—'}
            </Typography>
          </TableCell>
          <TableCell>
            <Chip
              size="small"
              label={scope === 'platform' ? 'Platform' : 'Company'}
              color={scope === 'platform' ? 'primary' : 'default'}
              variant="outlined"
            />
          </TableCell>
          <TableCell>
            <Stack spacing={0}>
              <Typography variant="body2">
                {assignmentCount} assignment{assignmentCount === 1 ? '' : 's'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {permissions.length} permission
                {permissions.length === 1 ? '' : 's'}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
              {onViewItem ? (
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => onViewItem(item)}>
                    <MdVisibility />
                  </IconButton>
                </Tooltip>
              ) : null}
              {onEditItem ? (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => onEditItem(item)}>
                    <MdEdit />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>
          </TableCell>
        </TableRow>
      )
    })
  }

  return (
    <Table size="small" aria-label="roles table">
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>Scope</TableCell>
          <TableCell>Assignments</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>{renderBody()}</TableBody>
    </Table>
  )
}
