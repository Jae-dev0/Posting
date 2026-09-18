import { useMemo, useState } from 'react'

import {
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  ListPageToolbar,
  PagedTableCard,
} from '@/components/layout'
import { useListRoles, type PlatformRole } from '@/features/platform'
import {
  RoleFilters,
  RoleFormDialogs,
  RoleTables,
  RoleViewDialogs,
} from '@/features/platform/components/roles'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useEntityViewDialog } from '@/hooks/use-entity-view-dialog'
import { PERMISSIONS, useCan, useIsSuperAdmin } from '@/lib/auth'
import { paginate } from '@/utils'

export function PlatformRolesListPage() {
  const { data: roles = [], status } = useListRoles()
  const hasCreatePermission = useCan(PERMISSIONS.ROLE_CREATE)
  const canCreate = useIsSuperAdmin() && hasCreatePermission
  const isSuperAdmin = useIsSuperAdmin()
  const hasEditPermission = useCan(PERMISSIONS.ROLE_EDIT)
  const canEdit = isSuperAdmin && hasEditPermission
  const { isOpen, entity, openWith, close } =
    useEntityViewDialog<PlatformRole>()

  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState<'platform' | 'company' | ''>(
    '',
  )
  const debouncedSearch = useDebouncedValue(search)
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const [isDialogCreateOpen, setIsDialogCreateOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PlatformRole | undefined>(
    undefined,
  )

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return roles.filter((role) => {
      if (scopeFilter && role.scope !== scopeFilter) return false
      if (
        q &&
        !role.name.toLowerCase().includes(q) &&
        !(role.description ?? '').toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [roles, debouncedSearch, scopeFilter])

  const { data, total, currentPage } = paginate(
    filtered,
    pagination.page,
    pagination.perPage,
  )

  const handleOpenAddDialog = () => {
    setSelectedItem(undefined)
    setIsDialogCreateOpen(true)
  }

  const handleOpenEditDialog = (item: PlatformRole) => {
    setSelectedItem(item)
    setIsDialogCreateOpen(true)
  }

  const handleCloseCreateDialog = () => {
    setIsDialogCreateOpen(false)
    setSelectedItem(undefined)
  }

  return (
    <>
      <ListPageToolbar
        title="Roles"
        description={
          <ListPageShowingCount count={status === 'success' ? total : 0}>
            role information and details.
          </ListPageShowingCount>
        }
        primaryAction={
          canCreate
            ? {
                label: 'Create New Role',
                onClick: handleOpenAddDialog,
                startIcon: <ListPagePrimaryAddIcon />,
              }
            : undefined
        }
      />

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
        <RoleFilters
          filters={{ q: search, scope: scopeFilter }}
          onFilterChange={(next) => {
            setSearch(next.q ?? '')
            setScopeFilter(next.scope ?? '')
            setPagination((prev) => ({ ...prev, page: 1 }))
          }}
        />
        <RoleTables
          data={status === 'success' ? data : []}
          status={status}
          onViewItem={openWith}
          onEditItem={canEdit ? handleOpenEditDialog : undefined}
        />
      </PagedTableCard>

      <RoleFormDialogs
        data={selectedItem}
        open={isDialogCreateOpen}
        onClose={handleCloseCreateDialog}
      />
      <RoleViewDialogs data={entity} open={isOpen} onClose={close} />
    </>
  )
}
