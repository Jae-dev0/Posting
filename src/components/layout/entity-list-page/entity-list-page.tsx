import type { ReactNode } from 'react'

import { ContentLayout } from '@/components/layout/content-layout'

import {
  EmptyState,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
  ListPageToolbar,
  type ListPageToolbarProps,
} from '../list-page-toolbar'

export type EntityListPageProps = {
  layoutTitle: string
  toolbarTitle: string
  toolbarDescription?: ReactNode
  toolbarPrimaryAction?: ListPageToolbarProps['primaryAction']
  toolbarSecondaryAction?: ReactNode
  pagedTable: ReactNode
  footer?: ReactNode
}

/**
 * Jacliner settings-CRUD page shell.
 * Prefer this for standalone list pages. Nested tab children (e.g. Roles under
 * Roles & Permissions) should use ListPageToolbar + PagedTableCard directly.
 */
export function EntityListPage({
  layoutTitle,
  toolbarTitle,
  toolbarDescription,
  toolbarPrimaryAction,
  toolbarSecondaryAction,
  pagedTable,
  footer,
}: EntityListPageProps) {
  return (
    <ContentLayout title={layoutTitle}>
      <ListPageToolbar
        title={toolbarTitle}
        description={toolbarDescription}
        primaryAction={toolbarPrimaryAction}
        secondaryAction={toolbarSecondaryAction}
      />
      {pagedTable}
      {footer}
    </ContentLayout>
  )
}

export {
  EmptyState,
  ListPagePrimaryAddIcon,
  ListPageShowingCount,
}
