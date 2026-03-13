import { Stack } from '@mui/material'

import { ContentLayout } from '@/components/layout'
// import { PageHeader } from '@/components/ui'
// import { useKeycloakAuth } from '@/lib/keycloak'

export function Dashboard() {
  // const [user] = useKeycloakAuth()
  // const hour = new Date().getHours()

  // const greeting =
  //   hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <ContentLayout title="Dashboards">
      {/* <PageHeader
        title={`${greeting}, ${user.firstName}!`}
        description="Monitor your fleet status and operations."
        pt={2.5}
        pb={4.5}
      /> */}
      <Stack spacing={1}>
        {/* <DashboardCards /> */}
        {/* <QuickActions /> */}
        {/* <ActivityLogs /> */}
      </Stack>
    </ContentLayout>
  )
}
