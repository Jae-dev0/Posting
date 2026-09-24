import {
  LuCalendarDays,
  LuChartColumn,
  LuClock,
  LuFileText,
  LuLink,
  LuPenLine,
  LuPlus,
  LuShield,
  LuUsers,
} from 'react-icons/lu'

import { SectionTopNav } from '@/components/layout'
import { paths } from '@/config/paths'
import { useCanManageAccounts } from '@/lib/auth/hooks'

const publishingNavItems = [
  { label: 'Analytics', href: paths.dashboard.getHref(), icon: LuChartColumn },
  { label: 'Create Post', href: paths.posting.create.getHref(), icon: LuPlus },
  {
    label: 'Scheduled',
    href: paths.posting.scheduled.getHref(),
    icon: LuClock,
  },
  { label: 'Drafts', href: paths.posting.drafts.getHref(), icon: LuFileText },
  {
    label: 'Calendar',
    href: paths.posting.calendar.getHref(),
    icon: LuCalendarDays,
  },
  { label: 'History', href: paths.posting.history.getHref(), icon: LuPenLine },
] as const

const adminNavItems = [
  {
    label: 'Team & Permissions',
    href: paths.posting.team.getHref(),
    icon: LuShield,
  },
  { label: 'Accounts', href: paths.posting.accounts.getHref(), icon: LuLink },
  { label: 'Users', href: paths.posting.users.getHref(), icon: LuUsers },
] as const

export function PostingTopNav() {
  const canManageAccounts = useCanManageAccounts()
  const items = canManageAccounts
    ? [...publishingNavItems, ...adminNavItems]
    : publishingNavItems

  return <SectionTopNav items={items} />
}
