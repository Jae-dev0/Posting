<<<<<<< HEAD
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { AuthCard } from '@/features/auth'
import { loginRequest } from '@/lib/auth/api'
import {
  getDepartmentHomePath,
  getHomeDepartment,
  hasCmsRole,
  hasMarketingRole,
  hasPlatformRole,
} from '@/lib/auth/departments'
import { useAuth } from '@/lib/auth/hooks'
import { loginFormSchema, type LoginFormValues } from '@/lib/auth/schemas'
import type { AuthUser } from '@/lib/auth/types'

const REDIRECT_PREFIX_PLATFORM = '/platform'
const REDIRECT_PREFIX_CMS = '/cms'
const REDIRECT_PREFIX_POSTING = '/posting'
const REDIRECT_PATH_DASHBOARD = '/dashboard'

const INPUT_BORDER_RADIUS_PX = 12
const BUTTON_HEIGHT_PX = 48
const SPACING_FORM_GAP = 2.5

function canAccessRedirect(user: AuthUser, redirectTo: string) {
  if (redirectTo.startsWith(REDIRECT_PREFIX_PLATFORM)) {
    return hasPlatformRole(user)
  }
  if (redirectTo.startsWith(REDIRECT_PREFIX_CMS)) {
    return hasCmsRole(user)
  }
  if (
    redirectTo.startsWith(REDIRECT_PREFIX_POSTING) ||
    redirectTo === REDIRECT_PATH_DASHBOARD
  ) {
    return hasMarketingRole(user)
  }
  return true
}
=======
import { Alert, Button, Stack, TextField } from '@mui/material'
import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import { AuthCard } from '@/features/auth'
import { loginRequest } from '@/lib/auth/api'
import { useAuth } from '@/lib/auth/hooks'
import { loginFormSchema } from '@/lib/auth/schemas'
>>>>>>> origin/main

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
<<<<<<< HEAD
  const [authError, setAuthError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const { errors, isSubmitting } = formState

  const handleRememberMeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRememberMe(event.target.checked)
  }

  const onSubmit = async (values: LoginFormValues) => {
    const { email, password } = values
    setAuthError(null)

    try {
      const session = await loginRequest(email, password)
      login(session)

      const redirectParam = searchParams.get('redirectTo')
      if (redirectParam && canAccessRedirect(session.user, redirectParam)) {
        void navigate(redirectParam, { replace: true })
        return
      }

      const userDepartment = getHomeDepartment(session.user)
      const homePath = getDepartmentHomePath(userDepartment)
      void navigate(homePath, { replace: true })
    } catch {
      setAuthError('Invalid email or password')
=======
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
>>>>>>> origin/main
    }
  }

  return (
    <ContentLayout title="Login">
<<<<<<< HEAD
      <AuthCard title="Content Management System" hideLogo hideFooter>
        {authError ? (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: `${INPUT_BORDER_RADIUS_PX}px` }}
          >
            {authError}
          </Alert>
        ) : null}

        <Stack
          component="form"
          spacing={SPACING_FORM_GAP}
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                type="email"
                autoComplete="username"
                fullWidth
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: `${INPUT_BORDER_RADIUS_PX}px`,
                      height: BUTTON_HEIGHT_PX,
                      '&:-webkit-autofill': {
                        WebkitBoxShadow:
                          '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: 'inherit !important',
                      },
                    },
                  },
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Password"
                type="password"
                autoComplete="current-password"
                fullWidth
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: `${INPUT_BORDER_RADIUS_PX}px`,
                      height: BUTTON_HEIGHT_PX,
                      '&:-webkit-autofill': {
                        WebkitBoxShadow:
                          '0 0 0 1000px #ffffff inset !important',
                        WebkitTextFillColor: 'inherit !important',
                      },
                    },
                  },
                }}
              />
            )}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={handleRememberMeChange}
                color="primary"
                size="small"
              />
            }
            label="Remember me"
            sx={{ ml: -0.5, mt: -0.5, mb: 0.5 }}
          />

=======
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
>>>>>>> origin/main
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting}
<<<<<<< HEAD
            sx={{
              height: BUTTON_HEIGHT_PX,
              borderRadius: `${INPUT_BORDER_RADIUS_PX}px`,
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
            }}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
=======
            sx={{ mt: 1 }}
          >
            Sign In
>>>>>>> origin/main
          </Button>
        </Stack>
      </AuthCard>
    </ContentLayout>
  )
}
