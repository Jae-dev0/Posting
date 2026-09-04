import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { AuthCard } from '@/features/auth'
import {
  getDepartmentHomePath,
  getHomeDepartment,
  hasCmsRole,
  hasMarketingRole,
  hasPlatformRole,
} from '@/lib/auth/departments'
import { loginRequest } from '@/lib/auth/api'
import { useAuth } from '@/lib/auth/hooks'
import { loginFormSchema } from '@/lib/auth/schemas'
import type { AuthUser } from '@/lib/auth/types'

function canAccessRedirect(user: AuthUser, redirectTo: string) {
  if (redirectTo.startsWith('/platform')) return hasPlatformRole(user)
  if (redirectTo.startsWith('/cms')) return hasCmsRole(user)
  if (redirectTo.startsWith('/posting') || redirectTo === '/dashboard') {
    return hasMarketingRole(user)
  }
  return true
}

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

      const redirectParam = searchParams.get('redirectTo')
      if (redirectParam && canAccessRedirect(session.user, redirectParam)) {
        void navigate(redirectParam, { replace: true })
        return
      }

      void navigate(
        getDepartmentHomePath(getHomeDepartment(session.user)),
        { replace: true },
      )
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
        subtitle="One platform · three departments — Platform Admin, Website CMS, and Marketing."
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
          <Typography variant="caption" color="text.secondary">
            Demo (password123): superadmin@posting.local ·
            cmsadmin@posting.local · marketingadmin@posting.local
          </Typography>
        </Stack>
      </AuthCard>
    </ContentLayout>
  )
}
