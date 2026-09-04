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
import { Link as RouterLink } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { PageHeader } from '@/components/ui'
import { paths } from '@/config/paths'
import { usePlatformDashboard } from '@/features/platform'
import { formatDate } from '@/utils'

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
                  <Typography color="text.secondary">No companies yet</Typography>
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
