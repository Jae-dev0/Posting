import { useEffect, useMemo, useState } from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  FormDialogTitle,
  LoadingButton,
} from '@/components/ui'
import type {
  PlatformRole,
  PermissionCatalogItem,
} from '@/features/platform/api'
import type { ID } from '@/types'

import {
  buildRolePermissionGrants,
  getPermissionsByGroup,
  type PermissionGroupTypes,
  type RolePermissionGrant,
} from '../permission-group-data'

import { grantKey } from './grant-key'
import { PermissionGroupEditor } from './permission-group-editor'

function buildGrantMap(grants: RolePermissionGrant[]) {
  const map = new Map<string, boolean>()
  for (const grant of grants) {
    map.set(grantKey(grant.role_id, grant.permission_id), grant.granted)
  }
  return map
}

export type PermissionGroupEditorDialogProps = {
  open: boolean
  onClose: () => void
  group: PermissionGroupTypes | null
  catalog: PermissionCatalogItem[]
  roles: PlatformRole[]
  onSave?: (grants: RolePermissionGrant[]) => void
  readOnly?: boolean
  isSaving?: boolean
  dialogProps?: Omit<DialogProps, 'open' | 'onClose' | 'children'>
}

export function PermissionGroupEditorDialog({
  open,
  onClose,
  group,
  catalog,
  roles,
  onSave,
  readOnly = false,
  isSaving = false,
  dialogProps,
}: PermissionGroupEditorDialogProps) {
  const permissions = useMemo(
    () => (group ? getPermissionsByGroup(group.group_id, catalog) : []),
    [group, catalog],
  )
  const initialGrants = useMemo(
    () => buildRolePermissionGrants(permissions, roles),
    [permissions, roles],
  )

  const [selectedRoleId, setSelectedRoleId] = useState<ID | false>(
    roles[0]?.id ?? false,
  )
  const [draftGrants, setDraftGrants] = useState(() =>
    buildGrantMap(initialGrants),
  )
  const baselineGrants = useMemo(
    () => buildGrantMap(initialGrants),
    [initialGrants],
  )
  const isDirty = [...draftGrants].some(
    ([key, granted]) => baselineGrants.get(key) !== granted,
  )

  const groupId = group?.group_id

  useEffect(() => {
    if (!open || groupId == null) return
    setDraftGrants(buildGrantMap(initialGrants))
    setSelectedRoleId(roles[0]?.id ?? false)
  }, [open, groupId, initialGrants, roles])

  const assignedRoleCount = useMemo(() => {
    const roleIds = new Set<ID>()
    for (const role of roles) {
      const hasGrant = permissions.some((permission) =>
        draftGrants.get(grantKey(role.id, permission.permission_id)),
      )
      if (hasGrant) roleIds.add(role.id)
    }
    return roleIds.size
  }, [draftGrants, permissions, roles])

  const handleToggle = (permissionId: ID) => {
    if (
      readOnly ||
      isSaving ||
      selectedRoleId === false ||
      roles.find((role) => role.id === selectedRoleId)?.name === 'super_admin'
    )
      return
    const key = grantKey(selectedRoleId, permissionId)
    setDraftGrants((prev) => {
      const next = new Map(prev)
      next.set(key, !prev.get(key))
      return next
    })
  }

  const handleSave = () => {
    if (readOnly || !group || isSaving) return
    const nextGrants: RolePermissionGrant[] = []
    for (const role of roles) {
      if (role.name === 'super_admin') continue
      for (const permission of permissions) {
        const key = grantKey(role.id, permission.permission_id)
        if (draftGrants.get(key) === baselineGrants.get(key)) continue
        nextGrants.push({
          role_id: role.id,
          permission_id: permission.permission_id,
          granted: Boolean(
            draftGrants.get(grantKey(role.id, permission.permission_id)),
          ),
        })
      }
    }
    if (nextGrants.length > 0) onSave?.(nextGrants)
  }

  const handleCancel = () => {
    setDraftGrants(buildGrantMap(initialGrants))
  }

  const handleDialogExited = () => {
    setDraftGrants(buildGrantMap([]))
    setSelectedRoleId(roles[0]?.id ?? false)
  }

  const title = group ? `${group.name} Permissions` : 'Permissions'
  const subtitle = readOnly
    ? 'View module-level permissions for this group. You do not have permission to edit grants.'
    : 'Configure and manage module-level permissions for this group. Select a role tab to edit its access.'

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      {...dialogProps}
      open={open}
      onClose={() => {
        if (!isSaving) onClose()
      }}
      slotProps={{
        ...dialogProps?.slotProps,
        transition: {
          ...(dialogProps?.slotProps?.transition as object | undefined),
          onExited: () => {
            handleDialogExited()
          },
        },
      }}
    >
      <FormDialogTitle
        title={title}
        subtitle={subtitle}
        onClose={() => {
          if (!isSaving) onClose()
        }}
      />
      <DialogContent>
        {group ? (
          <PermissionGroupEditor
            key={group.group_id}
            group={group}
            permissions={permissions}
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectedRoleIdChange={setSelectedRoleId}
            draftGrants={draftGrants}
            onToggle={handleToggle}
            assignedRoleCount={assignedRoleCount}
            readOnly={readOnly || isSaving}
          />
        ) : null}
      </DialogContent>
      <DialogActions>
        {readOnly ? (
          <LoadingButton variant="outlined" onClick={onClose}>
            Close
          </LoadingButton>
        ) : (
          <>
            <LoadingButton
              variant="outlined"
              onClick={handleCancel}
              disabled={!isDirty || isSaving}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!isDirty}
              loading={isSaving}
            >
              Save Changes
            </LoadingButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
