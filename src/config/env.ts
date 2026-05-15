import { z } from 'zod/v4'

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z.string().nonempty(),
    KEYCLOAK_URL: z.string().nonempty(),
    KEYCLOAK_REALM: z.string().default('master'),
    KEYCLOAK_CLIENT_ID: z.string().nonempty(),

    AUTH_BYPASS: z
      .string()
      .default('false')
      .transform((v) => v === 'true' && import.meta.env.DEV),

    /**
     * Client idle logout (minutes). Set via `VITE_APP_SESSION_IDLE_LOGOUT_MINUTES`.
     * 0 = disabled (SSO / Keycloak session rules still apply).
     */
    SESSION_IDLE_LOGOUT_MINUTES: z.coerce.number().min(0).default(10),
  })

  const envVars = Object.entries(import.meta.env).reduce<
    Record<string, string>
  >((acc, curr: [string, string]) => {
    const [key, value] = curr

    if (key.startsWith('VITE_APP_')) {
      acc[key.replace('VITE_APP_', '')] = value
    }

    return acc
  }, {})

  const parsedEnv = EnvSchema.safeParse(envVars)

  if (!parsedEnv.success) {
    const vars = Object.entries(parsedEnv.error.flatten().fieldErrors)
      .map(([k, v]) => `- ${k}: ${v.join(', ')}`)
      .join('\n')

    throw new Error(
      `Invalid env provided. The following variables are missing or invalid:\n${vars}`,
    )
  }

  return parsedEnv.data
}

export const env = createEnv()
