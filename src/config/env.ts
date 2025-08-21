import { z } from 'zod/v4'

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z.string().nonempty(),
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
    throw new Error(
      `Invalid env provided. The following variables are missing or invalid:\n${z.prettifyError(parsedEnv.error)}`,
    )
  }

  return parsedEnv.data
}

export const env = createEnv()
