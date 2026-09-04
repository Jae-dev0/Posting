import Container, { type ContainerProps } from '@mui/material/Container'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useMemo, type SyntheticEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'

export type TabConfig = {
  label: string
  path: string
  to?: string
  pageTitle?: string
  description?: string
}

type NestedTabLayoutProps = {
  tabs: TabConfig[]
  maxWidth?: ContainerProps['maxWidth'] | false
}

export function NestedTabLayout({
  tabs,
  maxWidth = 'xl',
}: NestedTabLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const value = useMemo(() => {
    const pathname = location.pathname.replace(/\/$/, '')
    const index = tabs.findIndex((tab) => {
      const href = (tab.to ?? tab.path).replace(/\/$/, '')
      return pathname === href || pathname.endsWith(`/${tab.path}`)
    })
    return index > -1 ? index : 0
  }, [location.pathname, tabs])

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    const tab = tabs[newValue]
    void navigate(tab.to ?? tab.path)
  }

  return (
    <Container
      maxWidth={maxWidth === false ? false : maxWidth}
      style={{ padding: 0 }}
    >
      <Tabs
        value={value}
        variant="standard"
        scrollButtons="auto"
        onChange={handleChange}
        aria-label="Section tabs"
        sx={{ mb: 2 }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            label={tab.label}
            component={Link}
            to={tab.to ?? tab.path}
          />
        ))}
      </Tabs>

      <Outlet />
    </Container>
  )
}
