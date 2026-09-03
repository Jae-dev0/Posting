import { Alert, Button, Stack, TextField } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { AuthCard } from '@/features/auth'
import { loginRequest } from '@/lib/auth/api'
import { useAuth } from '@/lib/auth/hooks'
import { loginFormSchema } from '@/lib/auth/schemas'

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsed = loginFormSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid form input')
      return
    }

    setIsSubmitting(true)

    try {
      const session = await loginRequest(
        parsed.data.email,
        parsed.data.password,
      )
      login(session)
      const redirectTo =
        searchParams.get('redirectTo') ?? paths.posting.create.getHref()
      void navigate(redirectTo, { replace: true })
    } catch {
      setError('Invalid email or password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ContentLayout title="Login">
      <AuthCard
        title="Sign In"
        subtitle="Sign in to manage and publish posts across your connected social platforms."
      >
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            fullWidth
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
            sx={{ mt: 1 }}
          >
            Sign In
          </Button>
        </Stack>
      </AuthCard>
    </ContentLayout>
  )
}
