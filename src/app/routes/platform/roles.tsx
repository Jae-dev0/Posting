import {
  ContentLayout,
  NestedTabLayout,
  type TabConfig,
} from '@/components/layout'
import { PageHeader } from '@/components/ui'
import { paths } from '@/config/paths'

const tabs: TabConfig[] = [
  {
    label: 'Roles',
    path: paths.platform.roles.roles.segment,
    to: paths.platform.roles.roles.getHref(),
  },
  {
    label: 'Permission Groups',
    path: paths.platform.roles.permissionGroups.segment,
    to: paths.platform.roles.permissionGroups.getHref(),
  },
]

export function PlatformRolesPage() {
  return (
    <ContentLayout title="Roles & Permissions">
      <PageHeader
        title="Roles & Permissions"
        description="Manage user roles and module-level permission groups."
      />
      <NestedTabLayout tabs={tabs} maxWidth={false} />
    </ContentLayout>
  )
}
