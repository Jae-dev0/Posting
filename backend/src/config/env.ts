import { z } from 'zod'

const EnvSchema = z.object({
  GENESIS_WEBSITE_ID: z.coerce.number().int().positive().default(1),
  GENESIS_SITE_URL: z.string().url().default('https://demo2.bookna.com'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().min(16).default('dev-only-change-me-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  /** 64-char hex (32 bytes). Falls back to a key derived from JWT_SECRET in development. */
  TOKEN_ENCRYPTION_KEY: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
  ),
  META_APP_ID: z.string().optional().default(''),
  META_APP_SECRET: z.string().optional().default(''),
  META_REDIRECT_URI: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3001/api/social/facebook/callback'),
  META_GRAPH_API_VERSION: z.string().default('v22.0'),
  /**
   * Comma-separated OAuth scopes for Facebook Page connect/publish.
   */
  META_OAUTH_SCOPES: z
    .string()
    .default(
      'public_profile,pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content',
    ),
  /**
   * Instagram via Facebook Login (API setup with Facebook login).
   * Match Meta Use cases → Manage content on Instagram.
   */
  META_INSTAGRAM_OAUTH_SCOPES: z
    .string()
    .default(
      'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management,public_profile',
    ),
  /**
   * Optional: Instagram Login app credentials (only if using Instagram Login instead).
   */
  META_INSTAGRAM_APP_ID: z.string().optional().default(''),
  META_INSTAGRAM_APP_SECRET: z.string().optional().default(''),
  META_INSTAGRAM_REDIRECT_URI: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3001/api/social/instagram/callback'),
  /**
   * Public base URL Meta can fetch for Instagram image_url (e.g. https://xxxx.ngrok.io).
   * Required for local file → Instagram publish. Falls back to http://localhost:PORT (Meta cannot reach localhost).
   */
  PUBLIC_API_BASE_URL: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().url().optional(),
  ),
})

export const env = EnvSchema.parse(process.env)

export function isMetaConfigured() {
  return Boolean(env.META_APP_ID && env.META_APP_SECRET)
}

export function isInstagramLoginConfigured() {
  return Boolean(env.META_INSTAGRAM_APP_ID && env.META_INSTAGRAM_APP_SECRET)
}

export function getMetaOAuthScopes() {
  return env.META_OAUTH_SCOPES.split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

export function getMetaInstagramOAuthScopes() {
  return env.META_INSTAGRAM_OAUTH_SCOPES.split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

export function getPublicApiBaseUrl() {
  return (env.PUBLIC_API_BASE_URL ?? `http://localhost:${env.PORT}`).replace(
    /\/$/,
    '',
  )
}
