import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'

import { EmptyState } from '@/components/layout'
import type { PlatformRole, PermissionCatalogItem } from '@/features/platform/api'
import type { Status } from '@/types'

import {
  getAssignedRoleCount,
  getPermissionsByGroup,
  type PermissionGroupTypes,
} from './permission-group-data'

const manageButtonSx = {
  backgroundColor: '#FAE6E6',
  textDecoration: 'none',
  color: 'primary.main',
}

export type PermissionGroupCardsProps = {
  data: PermissionGroupTypes[]
  permissions: PermissionCatalogItem[]
  roles: PlatformRole[]
  status: Status
  onManage?: (group: PermissionGroupTypes) => void
}

export function PermissionGroupCards({
  data,
  permissions,
  roles,
  status,
  onManage,
}: PermissionGroupCardsProps) {
  if (status === 'pending') {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress size={28} />
      </Stack>
    )
  }

  if (status === 'error') {
    return <Alert severity="error">Could not load permission groups.</Alert>
  }

  if (!data.length) {
    return (
      <EmptyState
        title="No permission groups"
        description="Permission modules will appear here once the catalog is seeded."
      />
    )
  }

  return (
    <Grid container spacing={2}>
      {data.map((group) => {
        const { group_id, name, description, is_active } = group
        const permissionCount = getPermissionsByGroup(
          group_id,
          permissions,
        ).length
        const assignedRoleCount = getAssignedRoleCount(
          group_id,
          permissions,
          roles,
        )

        return (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={group_id}>
            <Card variant="outlined">
              <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                      <Typography
                        fontSize={16}
                        fontWeight={600}
                        color="primary.main"
                        noWrap
                      >
                        {name}
                      </Typography>
                      <Typography
                        fontSize={13}
                        fontWeight={400}
                        color="text.secondary"
                      >
                        {description}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={is_active ? 'Active' : 'Inactive'}
                      color={is_active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography fontSize={12} color="text.secondary">
                    {permissionCount} permissions
                  </Typography>

                  <Divider />

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    gap={1}
                  >
                    <Typography fontSize={12} color="text.secondary">
                      Assigned to {assignedRoleCount} roles
                    </Typography>
                    <Button
                      size="small"
                      variant="text"
                      sx={manageButtonSx}
                      onClick={() => onManage?.(group)}
                      disabled={!onManage}
                    >
                      Manage
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}
