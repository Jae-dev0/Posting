import { Alert, Button, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useLocation } from 'react-router'

import { ContentLayout } from '@/components/layout'
import {
  AUTH_ERROR_GENERIC_MESSAGE,
  AUTH_ERROR_INCOMPLETE_PROFILE,
  AUTH_ERROR_STORAGE_KEY,
  INCOMPLETE_PROFILE_MESSAGE,
  useKeycloak,
} from '@/lib/keycloak'

export const Login = () => {
  const yearNow = new Date().getFullYear()
  const { keycloak } = useKeycloak()
  const location = useLocation()

  const [authError] = useState(() => {
    const value = sessionStorage.getItem(AUTH_ERROR_STORAGE_KEY)
    if (value) {
      sessionStorage.removeItem(AUTH_ERROR_STORAGE_KEY)
    }
    return value
  })

  const projectName = 'TEMPLATE'

  return (
    <ContentLayout title="Login">
      {authError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {authError === AUTH_ERROR_INCOMPLETE_PROFILE
            ? INCOMPLETE_PROFILE_MESSAGE
            : AUTH_ERROR_GENERIC_MESSAGE}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          p: 5,
          mb: 3,
          borderRadius: 5,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          {projectName}
        </Typography>

        <Stack spacing={0.5} my={3}>
          <Typography variant="subtitle2" fontWeight="600">
            Sign In
          </Typography>
          <Typography variant="caption" fontWeight="500">
            To access {projectName}, you will be securely redirected to JAC ERP
            login page.
          </Typography>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          sx={{ backgroundColor: '#F9001C' }}
          onClick={() =>
            keycloak.login({
              redirectUri: `${window.location.origin}${location.search}`,
            })
          }
        >
          Continue to Sign In
        </Button>
      </Paper>

      <Stack direction="row" justifyContent="center">
        <Typography variant="caption" color="text.secondary" fontWeight="600">
          {`© JAC Liner ${projectName} ${yearNow}. All rights reserved.`}
        </Typography>
      </Stack>
    </ContentLayout>
  )
}
