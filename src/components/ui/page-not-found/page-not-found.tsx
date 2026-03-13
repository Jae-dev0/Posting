import { Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router'

interface PageNotFoundProps {
  statusCode?: number
  message?: string
  redirectPath?: string
}

export function PageNotFound({
  statusCode = 404,
  message = 'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.',
  redirectPath = '/',
}: PageNotFoundProps) {
  const navigate = useNavigate()

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="90vh"
      spacing={3}
    >
      <Typography variant="h1" fontWeight="bold">
        {statusCode}
      </Typography>
      <Typography variant="h3" fontWeight="bold">
        Not Found
      </Typography>
      <Typography variant="caption" fontWeight="400">
        {message}
      </Typography>

      <Button variant="contained" onClick={() => navigate(redirectPath)}>
        Go to Homepage
      </Button>
    </Stack>
  )
}
