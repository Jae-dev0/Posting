import { Button, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { useId, useState } from 'react'
import type { IconType } from 'react-icons'
import { LuBuilding2, LuChevronDown, LuGlobe, LuMegaphone } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { paths } from '@/config/paths'
import type { AppDepartment } from '@/lib/auth'

export type DepartmentTopNavItem = {
  department: AppDepartment
  label: string
  href: string
  icon: IconType
}

export type DepartmentTopNavProps = {
  items: DepartmentTopNavItem[]
  activeDepartment: AppDepartment
}

export function buildDepartmentTopNavItems(access: {
  canAccessPlatform: boolean
  canAccessCms: boolean
  canAccessMarketing: boolean
}): DepartmentTopNavItem[] {
  return [
    ...(access.canAccessPlatform
      ? [
          {
            department: 'platform' as const,
            label: 'Platform',
            href: paths.platform.dashboard.getHref(),
            icon: LuBuilding2,
          },
        ]
      : []),
    ...(access.canAccessCms
      ? [
          {
            department: 'cms' as const,
            label: 'CMS',
            href: paths.cms.dashboard.getHref(),
            icon: LuGlobe,
          },
        ]
      : []),
    ...(access.canAccessMarketing
      ? [
          {
            department: 'marketing' as const,
            label: 'Marketing',
            href: paths.dashboard.getHref(),
            icon: LuMegaphone,
          },
        ]
      : []),
  ]
}

export function DepartmentTopNav({
  items,
  activeDepartment,
}: DepartmentTopNavProps) {
  const menuId = useId()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  if (items.length < 2) return null

  const activeItem =
    items.find((item) => item.department === activeDepartment) ?? items[0]
  const ActiveIcon = activeItem.icon

  return (
    <>
      <Button
        size="small"
        color="primary"
        variant="contained"
        startIcon={<ActiveIcon size={14} />}
        endIcon={<LuChevronDown size={14} />}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          flexShrink: 0,
          textTransform: 'none',
          fontWeight: 600,
          px: 1.5,
          whiteSpace: 'nowrap',
        }}
      >
        {activeItem.label}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          list: { dense: true, sx: { minWidth: 180 } },
        }}
      >
        {items.map(({ department, label, href, icon: Icon }) => {
          const isActive = department === activeDepartment

          return (
            <MenuItem
              key={department}
              component={RouterLink}
              to={href}
              selected={isActive}
              onClick={() => setAnchorEl(null)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Icon size={16} />
              </ListItemIcon>
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
