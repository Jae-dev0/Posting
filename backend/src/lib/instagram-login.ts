import {
  env,
  getMetaInstagramOAuthScopes,
} from '../config/env.js'
import { MetaGraphError } from './meta-graph.js'

type GraphErrorBody = {
  error?: {
    message?: string
    type?: string
    code?: number
  }
  error_message?: string
  error_type?: string
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & GraphErrorBody

  if (!response.ok || body.error || body.error_message) {
    const message =
      body.error?.message ??
      body.error_message ??
      `Instagram API error (${response.status})`
    throw new MetaGraphError(message, response.status, body.error?.code)
  }

  return body
}

function igGraphBaseUrl() {
  return `https://graph.instagram.com/${env.META_GRAPH_API_VERSION}`
}

export function buildInstagramLoginOAuthUrl(state: string) {
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id', env.META_INSTAGRAM_APP_ID)
  url.searchParams.set('redirect_uri', env.META_INSTAGRAM_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', getMetaInstagramOAuthScopes().join(','))
  url.searchParams.set('state', state)
  url.searchParams.set('enable_fb_login', '0')
  url.searchParams.set('force_authentication', '1')
  return url.toString()
}

export type InstagramShortLivedToken = {
  access_token: string
  user_id: number | string
  permissions?: string
}

export async function exchangeInstagramCodeForToken(code: string) {
  const form = new URLSearchParams()
  form.set('client_id', env.META_INSTAGRAM_APP_ID)
  form.set('client_secret', env.META_INSTAGRAM_APP_SECRET)
  form.set('grant_type', 'authorization_code')
  form.set('redirect_uri', env.META_INSTAGRAM_REDIRECT_URI)
  form.set('code', code)

  const response = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })

  return parseJsonResponse<InstagramShortLivedToken>(response)
}

export type InstagramLongLivedToken = {
  access_token: string
  token_type?: string
  expires_in?: number
}

export async function exchangeInstagramLongLivedToken(shortLivedToken: string) {
  const url = new URL(`${igGraphBaseUrl()}/access_token`)
  url.searchParams.set('grant_type', 'ig_exchange_token')
  url.searchParams.set('client_secret', env.META_INSTAGRAM_APP_SECRET)
  url.searchParams.set('access_token', shortLivedToken)

  const response = await fetch(url)
  return parseJsonResponse<InstagramLongLivedToken>(response)
}

export type InstagramLoginProfile = {
  id: string
  user_id?: string
  username?: string
  name?: string
  account_type?: string
  profile_picture_url?: string
}

export async function fetchInstagramLoginProfile(accessToken: string) {
  const url = new URL(`${igGraphBaseUrl()}/me`)
  url.searchParams.set(
    'fields',
    'id,user_id,username,name,account_type,profile_picture_url',
  )
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url)
  return parseJsonResponse<InstagramLoginProfile>(response)
}

export async function createInstagramLoginImageContainer(input: {
  igUserId: string
  accessToken: string
  imageUrl: string
  caption: string
}) {
  const url = new URL(`${igGraphBaseUrl()}/${input.igUserId}/media`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: input.imageUrl,
      caption: input.caption,
      access_token: input.accessToken,
    }),
  })

  return parseJsonResponse<{ id: string }>(response)
}

export async function getInstagramLoginContainerStatus(input: {
  containerId: string
  accessToken: string
}) {
  const url = new URL(`${igGraphBaseUrl()}/${input.containerId}`)
  url.searchParams.set('fields', 'status_code,status')
  url.searchParams.set('access_token', input.accessToken)

  const response = await fetch(url)
  return parseJsonResponse<{
    id: string
    status_code?: string
    status?: string
  }>(response)
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForInstagramLoginContainer(input: {
  containerId: string
  accessToken: string
  maxAttempts?: number
  delayMs?: number
}) {
  const maxAttempts = input.maxAttempts ?? 30
  const delayMs = input.delayMs ?? 2000

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await getInstagramLoginContainerStatus({
      containerId: input.containerId,
      accessToken: input.accessToken,
    })

    if (status.status_code === 'FINISHED') {
      return status
    }

    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new MetaGraphError(
        `Instagram media container ${status.status_code}: ${status.status ?? 'unknown'}`,
        502,
      )
    }

    await sleep(delayMs)
  }

  throw new MetaGraphError('Timed out waiting for Instagram media container', 504)
}

export async function publishInstagramLoginContainer(input: {
  igUserId: string
  accessToken: string
  creationId: string
}) {
  const url = new URL(`${igGraphBaseUrl()}/${input.igUserId}/media_publish`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: input.creationId,
      access_token: input.accessToken,
    }),
  })

  return parseJsonResponse<{ id: string }>(response)
}

export async function fetchInstagramLoginMediaEngagement(input: {
  mediaId: string
  accessToken: string
}) {
  const url = new URL(`${igGraphBaseUrl()}/${input.mediaId}`)
  url.searchParams.set(
    'fields',
    [
      'id',
      'caption',
      'media_type',
      'media_url',
      'permalink',
      'timestamp',
      'like_count',
      'comments_count',
      'comments{id,text,timestamp,username}',
    ].join(','),
  )
  url.searchParams.set('access_token', input.accessToken)

  const response = await fetch(url)
  return parseJsonResponse<{
    id: string
    caption?: string
    media_type?: string
    media_url?: string
    permalink?: string
    timestamp?: string
    like_count?: number
    comments_count?: number
    comments?: {
      data?: Array<{
        id: string
        text?: string
        timestamp?: string
        username?: string
      }>
    }
  }>(response)
}
