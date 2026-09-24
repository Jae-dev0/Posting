import { env } from '../config/env.js'

const API_BASE = 'https://open.tiktokapis.com'

type TikTokError = { code?: string; message?: string; log_id?: string }

export class TikTokApiError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'TikTokApiError'
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & {
    error?: TikTokError | string
    error_description?: string
  }
  const apiError = typeof body.error === 'object' ? body.error : undefined
  if (!response.ok || (apiError?.code && apiError.code !== 'ok')) {
    throw new TikTokApiError(
      apiError?.message ??
        body.error_description ??
        `TikTok request failed (${response.status})`,
      apiError?.code ??
        (typeof body.error === 'string' ? body.error : undefined),
    )
  }
  return body
}

export function buildTikTokOAuthUrl(state: string, scopes: string[]) {
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.searchParams.set('client_key', env.TIKTOK_CLIENT_KEY)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scopes.join(','))
  url.searchParams.set('redirect_uri', env.TIKTOK_REDIRECT_URI)
  url.searchParams.set('state', state)
  return url.toString()
}

export type TikTokToken = {
  access_token: string
  expires_in: number
  open_id: string
  refresh_token: string
  refresh_expires_in: number
  scope: string
  token_type: string
}

async function requestToken(params: URLSearchParams) {
  const response = await fetch(`${API_BASE}/v2/oauth/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  return parseResponse<TikTokToken>(response)
}

export function exchangeTikTokCode(code: string) {
  return requestToken(
    new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: env.TIKTOK_REDIRECT_URI,
    }),
  )
}

export function refreshTikTokToken(refreshToken: string) {
  return requestToken(
    new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  )
}

export async function revokeTikTokToken(accessToken: string) {
  const response = await fetch(`${API_BASE}/v2/oauth/revoke/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      token: accessToken,
    }),
  })
  if (!response.ok)
    throw new TikTokApiError(`TikTok revoke failed (${response.status})`)
}

export async function fetchTikTokUser(accessToken: string) {
  const url = new URL(`${API_BASE}/v2/user/info/`)
  url.searchParams.set('fields', 'open_id,display_name,avatar_url')
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const body = await parseResponse<{
    data: {
      user: { open_id: string; display_name: string; avatar_url?: string }
    }
  }>(response)
  return body.data.user
}

export async function fetchTikTokCreatorInfo(accessToken: string) {
  const response = await fetch(
    `${API_BASE}/v2/post/publish/creator_info/query/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: '{}',
    },
  )
  const body = await parseResponse<{
    data: {
      creator_username: string
      creator_nickname: string
      privacy_level_options: string[]
    }
  }>(response)
  return body.data
}

export async function publishTikTokVideo(input: {
  accessToken: string
  title: string
  videoUrl?: string
  video?: { buffer: Buffer; mimetype: string }
}) {
  const { accessToken, title, videoUrl, video } = input
  const maxChunkBytes = 10 * 1024 * 1024
  const chunkSize = video
    ? Math.min(video.buffer.length, maxChunkBytes)
    : undefined
  const sourceInfo = video
    ? {
        source: 'FILE_UPLOAD',
        video_size: video.buffer.length,
        chunk_size: chunkSize,
        total_chunk_count: Math.ceil(video.buffer.length / maxChunkBytes),
      }
    : { source: 'PULL_FROM_URL', video_url: videoUrl }

  const response = await fetch(`${API_BASE}/v2/post/publish/video/init/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title,
        privacy_level: 'SELF_ONLY',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
      },
      source_info: sourceInfo,
    }),
  })
  const body = await parseResponse<{
    data: { publish_id: string; upload_url?: string }
  }>(response)

  if (video) {
    if (!body.data.upload_url)
      throw new TikTokApiError('TikTok did not return an upload URL')
    for (let start = 0; start < video.buffer.length; start += maxChunkBytes) {
      const end = Math.min(start + maxChunkBytes, video.buffer.length)
      const chunk = video.buffer.subarray(start, end)
      const upload = await fetch(body.data.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': video.mimetype,
          'Content-Length': String(chunk.length),
          'Content-Range': `bytes ${start}-${end - 1}/${video.buffer.length}`,
        },
        body: chunk,
      })
      if (!upload.ok) {
        throw new TikTokApiError(
          `TikTok video upload failed (${upload.status})`,
        )
      }
    }
  }

  return body.data.publish_id
}
