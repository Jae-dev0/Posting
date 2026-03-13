import Stack from '@mui/material/Stack'

export interface CenterLayoutProps {
  children: React.ReactNode
}

export function CenterLayout({ children }: CenterLayoutProps) {
  return (
    <Stack
      sx={{
        height: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Stack>
  )
}
