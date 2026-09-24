import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material'
import {
  LuCalendarRange,
  LuChartNoAxesColumn,
  LuCircleAlert,
  LuTrendingUp,
} from 'react-icons/lu'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { useAnalyticsSummary } from '@/features/posting'
import { AnalyticsAccountHealth } from '@/features/posting/components/analytics-account-health'
import { AnalyticsActivityFeed } from '@/features/posting/components/analytics-activity-feed'
import { AnalyticsDashboardSkeleton } from '@/features/posting/components/analytics-dashboard-skeleton'
import { AnalyticsPipelineCard } from '@/features/posting/components/analytics-pipeline-card'
import { AnalyticsPublishingTrend } from '@/features/posting/components/analytics-publishing-trend'
import { AnalyticsStatCard } from '@/features/posting/components/analytics-stat-card'

export function Dashboard() {
  const { status, error, data, refetch } = useAnalyticsSummary()

  const renderContent = () => {
    if (status === 'pending') {
      return <AnalyticsDashboardSkeleton />
    }

    if (status === 'error' || !data) {
      return (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : 'Unable to load analytics. Please try again.'}
        </Alert>
      )
    }

    const {
      postsPublishedThisWeek,
      postsPublishedThisMonth,
      failedPublishCount,
      scheduledCount,
      draftCount,
      pendingApprovalCount,
      publishedWithEngagementAvailable,
      publishingTrend = [],
      accountHealth,
      recentActivity,
    } = data

    const hasAccountIssues = accountHealth.some(
      (account) =>
        account.health === 'expired' ||
        account.health === 'expiring_soon' ||
        account.health === 'disconnected',
    )
    const failedAccentColor = failedPublishCount > 0 ? '#D32F2F' : '#757575'
    const failedSubtitle =
      failedPublishCount > 0
        ? 'Needs attention in History'
        : 'All publishes succeeded'

    return (
      <Stack spacing={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
              Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Publishing volume, content pipeline, account health, and team
              activity at a glance.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticsStatCard
              label="Published this week"
              value={postsPublishedThisWeek}
              icon={LuTrendingUp}
              accentColor="#C62828"
              subtitle="Last 7 days"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticsStatCard
              label="Published this month"
              value={postsPublishedThisMonth}
              icon={LuCalendarRange}
              accentColor="#1565C0"
              subtitle="Last 30 days"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticsStatCard
              label="Failed publishes"
              value={failedPublishCount}
              icon={LuCircleAlert}
              accentColor={failedAccentColor}
              subtitle={failedSubtitle}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <AnalyticsStatCard
              label="Engagement-ready posts"
              value={publishedWithEngagementAvailable}
              href={paths.posting.history.getHref()}
              icon={LuChartNoAxesColumn}
              accentColor="#2E7D32"
              subtitle="View metrics in Post History"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <AnalyticsPublishingTrend
              trend={publishingTrend}
              weekTotal={postsPublishedThisWeek}
              monthTotal={postsPublishedThisMonth}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <AnalyticsPipelineCard
              scheduledCount={scheduledCount}
              draftCount={draftCount}
              pendingApprovalCount={pendingApprovalCount}
            />
          </Grid>
        </Grid>

        {hasAccountIssues ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            One or more connected accounts need attention. Expired or expiring
            tokens can block publishing — reconnect from Accounts.
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsAccountHealth accountHealth={accountHealth} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <AnalyticsActivityFeed recentActivity={recentActivity} />
          </Grid>
        </Grid>
      </Stack>
    )
  }

  return <ContentLayout title="Analytics">{renderContent()}</ContentLayout>
}
