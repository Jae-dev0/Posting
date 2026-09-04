import { Grid, Skeleton, Stack } from '@mui/material'

export function AnalyticsDashboardSkeleton() {
  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Skeleton variant="text" width={240} height={36} />
        <Skeleton variant="text" width={420} height={24} />
      </Stack>

      <Grid container spacing={2}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={148} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={320} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={320} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={360} />
        </Grid>
      </Grid>
    </Stack>
  )
}
