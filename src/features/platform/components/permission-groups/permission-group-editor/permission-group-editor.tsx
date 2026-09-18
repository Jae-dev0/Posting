import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { MdCancel, MdCheckCircle } from 'react-icons/md'

import type { PlatformRole } from '@/features/platform/api'
import type { ID } from '@/types'

import {
  groupPermissionsByCategory,
  type PermissionGroupTypes,
  type PermissionTypes,
} from '../permission-group-data'

import { grantKey } from './grant-key'

export type PermissionGroupEditorProps = {
  group: PermissionGroupTypes
  permissions: PermissionTypes[]
  roles: PlatformRole[]
  selectedRoleId: ID | false
  onSelectedRoleIdChange: (roleId: ID) => void
  draftGrants: Map<string, boolean>
  onToggle: (permissionId: ID) => void
  assignedRoleCount: number
  readOnly?: boolean
}

export function PermissionGroupEditor({
  group,
  permissions,
  roles,
  selectedRoleId,
  onSelectedRoleIdChange,
  draftGrants,
  onToggle,
  assignedRoleCount,
  readOnly = false,
}: PermissionGroupEditorProps) {
  const { name, description, is_active } = group
  const categorized = groupPermissionsByCategory(permissions)

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            gap={2}
          >
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography fontSize={16} fontWeight={600}>
                  {name} Group
                </Typography>
                <Chip
                  size="small"
                  label={is_active ? 'Active Group' : 'Inactive Group'}
                  color={is_active ? 'success' : 'default'}
                  variant="outlined"
                />
              </Stack>
              <Typography fontSize={13} color="text.secondary">
                {description}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={3} sx={{ flexShrink: 0 }}>
              <Stack>
                <Typography
                  fontSize={11}
                  color="text.secondary"
                  letterSpacing={1}
                >
                  PERMISSIONS
                </Typography>
                <Typography fontSize={20} fontWeight={600}>
                  {permissions.length}
                </Typography>
              </Stack>
              <Stack>
                <Typography
                  fontSize={11}
                  color="text.secondary"
                  letterSpacing={1}
                >
                  ASSIGNED ROLES
                </Typography>
                <Typography fontSize={20} fontWeight={600}>
                  {assignedRoleCount}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <Tabs
          value={selectedRoleId}
          onChange={(_, value: ID) => onSelectedRoleIdChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Roles"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
        >
          {roles.map((role) => (
            <Tab
              key={role.id}
              label={role.name}
              value={role.id}
              id={`role-tab-${role.id}`}
              aria-controls={`role-tabpanel-${role.id}`}
            />
          ))}
        </Tabs>

        {roles.map((role) => {
          const isActiveTab = selectedRoleId === role.id
          return (
            <Box
              key={role.id}
              role="tabpanel"
              hidden={!isActiveTab}
              id={`role-tabpanel-${role.id}`}
              aria-labelledby={`role-tab-${role.id}`}
              sx={{ p: 2 }}
            >
              {isActiveTab ? (
                <Stack spacing={2.5}>
                  <Typography fontSize={13} color="text.secondary">
                    {role.name === 'super_admin'
                      ? 'All permissions are always granted to '
                      : readOnly
                        ? 'Viewing permissions for '
                        : 'Editing permissions for '}
                    <strong>{role.name}</strong>
                    {role.description ? ` — ${role.description}` : null}
                  </Typography>
                  {categorized.map(
                    ({ category, permissions: categoryPermissions }) => (
                      <Stack key={category} spacing={1}>
                        <Typography
                          component="h2"
                          fontSize={13}
                          fontWeight={600}
                          letterSpacing={0.6}
                          color="text.secondary"
                          sx={{ textTransform: 'uppercase' }}
                        >
                          {category}
                        </Typography>
                        <Stack spacing={0.5}>
                          {categoryPermissions.map((permission) => {
                            const granted = Boolean(
                              draftGrants.get(
                                grantKey(role.id, permission.permission_id),
                              ),
                            )
                            return (
                              <Stack
                                key={permission.permission_id}
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                gap={2}
                                sx={{
                                  py: 1,
                                  px: 1.5,
                                  borderRadius: 1,
                                  '&:hover': { bgcolor: 'action.hover' },
                                }}
                              >
                                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {permission.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                  >
                                    {permission.description}
                                  </Typography>
                                </Stack>
                                <IconButton
                                  aria-label={
                                    granted
                                      ? `Revoke ${permission.name} for ${role.name}`
                                      : `Grant ${permission.name} for ${role.name}`
                                  }
                                  aria-pressed={granted}
                                  onClick={() =>
                                    onToggle(permission.permission_id)
                                  }
                                  color={granted ? 'success' : 'error'}
                                  size="small"
                                  disabled={
                                    readOnly || role.name === 'super_admin'
                                  }
                                >
                                  {granted ? (
                                    <MdCheckCircle size={22} />
                                  ) : (
                                    <MdCancel size={22} />
                                  )}
                                </IconButton>
                              </Stack>
                            )
                          })}
                        </Stack>
                      </Stack>
                    ),
                  )}
                </Stack>
              ) : null}
            </Box>
          )
        })}
      </Card>
    </Stack>
  )
}
