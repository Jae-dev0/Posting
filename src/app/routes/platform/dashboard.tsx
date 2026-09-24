import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  LuBuilding2,
  LuClipboardList,
  LuGlobe,
  LuImage,
  LuSettings,
  LuShield,
  LuUsers,
} from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { PageHeader } from '@/components/ui'
import { paths } from '@/config/paths'
import { usePlatformDashboard } from '@/features/platform'
import { formatDate } from '@/utils'

const managementItems = [
  {
    label: 'Companies',
    description: 'Create, activate, and manage tenants',
    href: paths.platform.companies.getHref(),
    icon: LuBuilding2,
  },
  {
    label: 'Websites',
    description: 'Manage every company website',
    href: paths.platform.websites.getHref(),
    icon: LuGlobe,
  },
  {
    label: 'Users',
    description: 'Activate, disable, or remove accounts',
    href: paths.platform.users.getHref(),
    icon: LuUsers,
  },
  {
    label: 'Roles & Permissions',
    description: 'Control platform access and grants',
    href: paths.platform.roles.getHref(),
    icon: LuShield,
  },
  {
    label: 'Media',
    description: 'Review media across all companies',
    href: paths.platform.media.getHref(),
    icon: LuImage,
  },
  {
    label: 'Audit Logs',
    description: 'Inspect administrative activity',
    href: paths.platform.audit.getHref(),
    icon: LuClipboardList,
  },
  {
    label: 'System Settings',
    description: 'Configure website-level settings',
    href: paths.platform.settings.getHref(),
    icon: LuSettings,
  },
] as const

export function PlatformDashboardPage() {
  const { data, status, error, refetch } = usePlatformDashboard()

  if (status === 'pending') {
    return (
      <ContentLayout title="Platform Dashboard">
        <PageHeader
          title="Super Admin Dashboard"
          description="Platform-wide overview across all companies"
        />
        <Typography color="text.secondary">Loading dashboard…</Typography>
      </ContentLayout>
    )
  }

  if (status === 'error') {
    return (
      <ContentLayout title="Platform Dashboard">
        <PageHeader
          title="Super Admin Dashboard"
          description="Platform-wide overview across all companies"
        />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </Alert>
      </ContentLayout>
    )
  }

  const { totals, systemStatus, recentActivity, companyOverview } = data

  return (
    <ContentLayout title="Platform Dashboard">
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ sm: 'flex-start' }}
        >
          <PageHeader
            title="Super Admin Dashboard"
            description="Platform-wide overview across all companies"
          />
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button
              component={RouterLink}
              to={paths.platform.companies.getHref()}
              variant="contained"
            >
              Manage Companies
            </Button>
            <Button
              component={RouterLink}
              to={paths.dashboard.getHref()}
              variant="outlined"
            >
              Open Marketing
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          {[
            { label: 'Total Companies', value: totals.companies },
            { label: 'Active Companies', value: totals.activeCompanies },
            { label: 'Total Users', value: totals.users },
            { label: 'Total Websites', value: totals.websites },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Management Center
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Super Admin controls for every company and platform resource.
                </Typography>
              </Box>
              <Grid container spacing={1.5}>
                {managementItems.map(
                  ({ label, description, href, icon: Icon }) => (
                    <Grid key={href} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Button
                        component={RouterLink}
                        to={href}
                        variant="outlined"
                        color="inherit"
                        startIcon={<Icon aria-hidden="true" />}
                        sx={{
                          width: '100%',
                          minHeight: 72,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ),
                )}
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={600}>System Status</Typography>
              <Chip
                size="small"
                color={systemStatus === 'operational' ? 'success' : 'warning'}
                label={systemStatus}
                variant="outlined"
              />
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography fontWeight={600} gutterBottom>
                  Company Overview
                </Typography>
                {companyOverview.length === 0 ? (
                  <Typography color="text.secondary">
                    No companies yet
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {companyOverview.map((company) => {
                      const {
                        id,
                        name,
                        userCount,
                        websiteCount,
                        status: companyStatus,
                      } = company
                      return (
                        <Stack
                          key={id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box>
                            <Typography fontWeight={600}>{name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {userCount} users · {websiteCount} websites
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={companyStatus}
                            color={
                              companyStatus === 'active' ? 'success' : 'default'
                            }
                            variant="outlined"
                          />
                        </Stack>
                      )
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography fontWeight={600} gutterBottom>
                  Recent Activity
                </Typography>
                {recentActivity.length === 0 ? (
                  <Typography color="text.secondary">
                    No recent activity
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {recentActivity.map((log) => {
                      const { id, summary, createdAt, company } = log
                      return (
                        <Box key={id}>
                          <Typography variant="body2">{summary}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(createdAt)}
                            {company ? ` · ${company.name}` : ''}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </ContentLayout>
  )
}
