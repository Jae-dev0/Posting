import { Container } from '@mui/material'
import { Outlet } from 'react-router'

import { CenterLayout } from '../center-layout'

export const PublicLayout = () => {
  return (
    <CenterLayout>
      <Container maxWidth="xs" style={{ padding: 0 }}>
        <Outlet />
      </Container>
    </CenterLayout>
  )
}
