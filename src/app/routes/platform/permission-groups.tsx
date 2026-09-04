import { Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

import { ListPageToolbar } from '@/components/layout'
import {
  PermissionGroupCards,
  PermissionGroupEditorDialog,
  buildPermissionGroups,
  type PermissionGroupTypes,
  type RolePermissionGrant,
} from '@/features/platform/components/permission-groups'
import {
  useListPermissions,
  useListRoles,
  useSyncRolePermissionGrants,
} from '@/features/platform'
import { useEntityViewDialog } from '@/hooks/use-entity-view-dialog'
import { PERMISSIONS, useCan } from '@/lib/auth'
import { useSnackbar } from '@/lib/mui'
import { getErrorMessage } from '@/utils'
import type { Status } from '@/types'

export function PlatformPermissionGroupsPage() {
  const { showSuccess, showError } = useSnackbar()
  const canEdit = useCan(PERMISSIONS.ROLE_EDIT)
  const rolesQuery = useListRoles()
  const permissionsQuery = useListPermissions()
  const { isOpen, entity, openWith, close } =
    useEntityViewDialog<PermissionGroupTypes>()

  const syncGrants = useSyncRolePermissionGrants({
    onSuccess: () => {
      showSuccess(`Updated permissions for "${entity?.name ?? 'group'}".`)
      close()
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Could not save permission grants. Try again.'),
      )
    },
  })

  const roles = rolesQuery.data ?? []
  const catalog = permissionsQuery.data ?? []

  const groups = useMemo(() => buildPermissionGroups(catalog), [catalog])

  const status: Status =
    rolesQuery.status === 'pending' || permissionsQuery.status === 'pending'
      ? 'pending'
      : rolesQuery.status === 'error' || permissionsQuery.status === 'error'
        ? 'error'
        : 'success'

  const handleSave = (grants: RolePermissionGrant[]) => {
    if (!canEdit) {
      showError('You do not have permission to edit role grants.')
      return
    }

    const permissionIds = [
      ...new Set(grants.map((grant) => Number(grant.permission_id))),
    ]

    syncGrants.mutate({
      permissionIds,
      grants: grants.map((grant) => ({
        roleId: Number(grant.role_id),
        permissionId: Number(grant.permission_id),
        granted: grant.granted,
      })),
    })
  }

  return (
    <Stack spacing={2}>
      <ListPageToolbar
        title="Permission Groups"
        description={
          <Typography variant="body2" color="text.secondary">
            Module-level permission sets assigned to roles.
          </Typography>
        }
      />

      <PermissionGroupCards
        data={status === 'success' ? groups : []}
        permissions={catalog}
        roles={roles}
        status={status}
        onManage={openWith}
      />

      <PermissionGroupEditorDialog
        open={isOpen}
        group={entity}
        catalog={catalog}
        roles={roles}
        onClose={close}
        onSave={handleSave}
        readOnly={!canEdit}
        isSaving={syncGrants.isPending}
      />
    </Stack>
  )
}
