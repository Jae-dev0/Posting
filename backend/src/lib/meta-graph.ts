import { env, getMetaOAuthScopes } from '../config/env.js'

type GraphErrorBody = {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
}

export class MetaGraphError extends Error {
  status: number
  code?: number

  constructor(message: string, status: number, code?: number) {
    super(message)
    this.name = 'MetaGraphError'
    this.status = status
    this.code = code
  }
}

function graphBaseUrl() {
  return `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}`
}

async function parseGraphResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T & GraphErrorBody

  if (!response.ok || body.error) {
    const message = body.error?.message ?? `Meta Graph API error (${response.status})`
    throw new MetaGraphError(message, response.status, body.error?.code)
  }

  return body
}

export type MetaTokenResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
}

export type MetaPageAccount = {
  id: string
  name: string
  access_token: string
  tasks?: string[]
}

export type MetaUserProfile = {
  id: string
  name?: string
}

export async function exchangeCodeForUserToken(code: string) {
  const url = new URL(`${graphBaseUrl()}/oauth/access_token`)
  url.searchParams.set('client_id', env.META_APP_ID)
  url.searchParams.set('client_secret', env.META_APP_SECRET)
  url.searchParams.set('redirect_uri', env.META_REDIRECT_URI)
  url.searchParams.set('code', code)

  const response = await fetch(url)
  return parseGraphResponse<MetaTokenResponse>(response)
}

export async function exchangeForLongLivedUserToken(shortLivedToken: string) {
  const url = new URL(`${graphBaseUrl()}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', env.META_APP_ID)
  url.searchParams.set('client_secret', env.META_APP_SECRET)
  url.searchParams.set('fb_exchange_token', shortLivedToken)

  const response = await fetch(url)
  return parseGraphResponse<MetaTokenResponse>(response)
}

export async function fetchFacebookUser(accessToken: string) {
  const url = new URL(`${graphBaseUrl()}/me`)
  url.searchParams.set('fields', 'id,name')
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url)
  return parseGraphResponse<MetaUserProfile>(response)
}

export async function fetchManagedPages(userAccessToken: string) {
  const url = new URL(`${graphBaseUrl()}/me/accounts`)
  url.searchParams.set('fields', 'id,name,access_token,tasks')
  url.searchParams.set('access_token', userAccessToken)

  const response = await fetch(url)
  const body = await parseGraphResponse<{ data: MetaPageAccount[] }>(response)
  return body.data ?? []
}

export async function publishPageFeedPost(input: {
  pageId: string
  pageAccessToken: string
  message: string
  link?: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.pageId}/feed`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      link: input.link,
      access_token: input.pageAccessToken,
    }),
  })

  return parseGraphResponse<{ id: string }>(response)
}

export async function publishPagePhotoPost(input: {
  pageId: string
  pageAccessToken: string
  message: string
  imageUrl: string
  published?: boolean
}) {
  const url = new URL(`${graphBaseUrl()}/${input.pageId}/photos`)
  const body: Record<string, string | boolean> = {
    url: input.imageUrl,
    access_token: input.pageAccessToken,
  }
  if (input.published === false) {
    body.published = false
  } else {
    body.caption = input.message
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return parseGraphResponse<{ id: string; post_id?: string }>(response)
}

export async function publishPagePhotoFromFile(input: {
  pageId: string
  pageAccessToken: string
  message: string
  file: {
    buffer: Buffer
    mimetype: string
    originalname: string
  }
  published?: boolean
}) {
  const form = new FormData()
  const bytes = new Uint8Array(input.file.buffer)
  const blob = new Blob([bytes], { type: input.file.mimetype })
  form.append('source', blob, input.file.originalname || 'upload.jpg')
  if (input.published === false) {
    form.append('published', 'false')
  } else {
    form.append('caption', input.message)
  }
  form.append('access_token', input.pageAccessToken)

  const response = await fetch(`${graphBaseUrl()}/${input.pageId}/photos`, {
    method: 'POST',
    body: form,
  })

  return parseGraphResponse<{ id: string; post_id?: string }>(response)
}

export async function publishPageMultiPhotoPost(input: {
  pageId: string
  pageAccessToken: string
  message: string
  photoIds: string[]
}) {
  const url = new URL(`${graphBaseUrl()}/${input.pageId}/feed`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      attached_media: input.photoIds.map((id) => ({ media_fbid: id })),
      access_token: input.pageAccessToken,
    }),
  })

  return parseGraphResponse<{ id: string }>(response)
}

export type MetaReactionSummary = {
  summary?: { total_count?: number }
}

export type MetaPostEngagement = {
  id: string
  message?: string
  created_time?: string
  permalink_url?: string
  full_picture?: string
  shares?: { count?: number }
  reactions?: MetaReactionSummary
  reactions_like?: MetaReactionSummary
  reactions_love?: MetaReactionSummary
  reactions_care?: MetaReactionSummary
  reactions_haha?: MetaReactionSummary
  reactions_wow?: MetaReactionSummary
  reactions_sad?: MetaReactionSummary
  reactions_angry?: MetaReactionSummary
  comments?: {
    summary?: { total_count?: number }
    data?: Array<{
      id: string
      message?: string
      created_time?: string
      from?: { id: string; name?: string }
    }>
  }
}

export type FacebookReactionBreakdown = {
  like: number
  love: number
  care: number
  haha: number
  wow: number
  sad: number
  angry: number
}

export function summarizeFacebookReactions(
  engagement: MetaPostEngagement,
): FacebookReactionBreakdown {
  return {
    like: engagement.reactions_like?.summary?.total_count ?? 0,
    love: engagement.reactions_love?.summary?.total_count ?? 0,
    care: engagement.reactions_care?.summary?.total_count ?? 0,
    haha: engagement.reactions_haha?.summary?.total_count ?? 0,
    wow: engagement.reactions_wow?.summary?.total_count ?? 0,
    sad: engagement.reactions_sad?.summary?.total_count ?? 0,
    angry: engagement.reactions_angry?.summary?.total_count ?? 0,
  }
}

export async function fetchPostEngagement(input: {
  postId: string
  pageAccessToken: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.postId}`)
  url.searchParams.set(
    'fields',
    [
      'id',
      'message',
      'created_time',
      'permalink_url',
      'full_picture',
      'shares',
      'reactions.summary(true).limit(0)',
      'reactions.type(LIKE).summary(true).limit(0).as(reactions_like)',
      'reactions.type(LOVE).summary(true).limit(0).as(reactions_love)',
      'reactions.type(CARE).summary(true).limit(0).as(reactions_care)',
      'reactions.type(HAHA).summary(true).limit(0).as(reactions_haha)',
      'reactions.type(WOW).summary(true).limit(0).as(reactions_wow)',
      'reactions.type(SAD).summary(true).limit(0).as(reactions_sad)',
      'reactions.type(ANGRY).summary(true).limit(0).as(reactions_angry)',
      'comments.summary(true).limit(10){id,message,created_time,from}',
    ].join(','),
  )
  url.searchParams.set('access_token', input.pageAccessToken)

  const response = await fetch(url)
  return parseGraphResponse<MetaPostEngagement>(response)
}

export type MetaInstagramBusinessAccount = {
  id: string
  username?: string
  name?: string
  profile_picture_url?: string
}

export type MetaPageWithInstagram = MetaPageAccount & {
  instagram_business_account?: MetaInstagramBusinessAccount
}

export async function fetchPagesWithInstagram(userAccessToken: string) {
  const url = new URL(`${graphBaseUrl()}/me/accounts`)
  url.searchParams.set(
    'fields',
    'id,name,access_token,tasks,instagram_business_account{id,username,name,profile_picture_url}',
  )
  url.searchParams.set('access_token', userAccessToken)

  const response = await fetch(url)
  const body = await parseGraphResponse<{ data: MetaPageWithInstagram[] }>(
    response,
  )
  return body.data ?? []
}

export async function createInstagramImageContainer(input: {
  igUserId: string
  pageAccessToken: string
  imageUrl: string
  caption?: string
  isCarouselItem?: boolean
}) {
  const url = new URL(`${graphBaseUrl()}/${input.igUserId}/media`)
  const body: Record<string, string | boolean> = {
    image_url: input.imageUrl,
    access_token: input.pageAccessToken,
  }
  if (input.isCarouselItem) {
    body.is_carousel_item = true
  } else if (input.caption) {
    body.caption = input.caption
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return parseGraphResponse<{ id: string }>(response)
}

export async function createInstagramCarouselContainer(input: {
  igUserId: string
  pageAccessToken: string
  childContainerIds: string[]
  caption: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.igUserId}/media`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: input.childContainerIds.join(','),
      caption: input.caption,
      access_token: input.pageAccessToken,
    }),
  })

  return parseGraphResponse<{ id: string }>(response)
}

export async function getInstagramContainerStatus(input: {
  containerId: string
  pageAccessToken: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.containerId}`)
  url.searchParams.set('fields', 'status_code,status')
  url.searchParams.set('access_token', input.pageAccessToken)

  const response = await fetch(url)
  return parseGraphResponse<{
    id: string
    status_code?: string
    status?: string
  }>(response)
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForInstagramContainer(input: {
  containerId: string
  pageAccessToken: string
  maxAttempts?: number
  delayMs?: number
}) {
  const maxAttempts = input.maxAttempts ?? 30
  const delayMs = input.delayMs ?? 2000

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const status = await getInstagramContainerStatus({
      containerId: input.containerId,
      pageAccessToken: input.pageAccessToken,
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

export async function publishInstagramContainer(input: {
  igUserId: string
  pageAccessToken: string
  creationId: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.igUserId}/media_publish`)
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: input.creationId,
      access_token: input.pageAccessToken,
    }),
  })

  return parseGraphResponse<{ id: string }>(response)
}

export type MetaInstagramMediaEngagement = {
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
}

export async function fetchInstagramMediaEngagement(input: {
  mediaId: string
  pageAccessToken: string
}) {
  const url = new URL(`${graphBaseUrl()}/${input.mediaId}`)
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
  url.searchParams.set('access_token', input.pageAccessToken)

  const response = await fetch(url)
  return parseGraphResponse<MetaInstagramMediaEngagement>(response)
}

export function buildFacebookOAuthUrl(state: string, scopes?: string[]) {
  const url = new URL('https://www.facebook.com/dialog/oauth')
  url.searchParams.set('client_id', env.META_APP_ID)
  url.searchParams.set('redirect_uri', env.META_REDIRECT_URI)
  url.searchParams.set('state', state)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set(
    'scope',
    (scopes ?? getMetaOAuthScopes()).join(','),
  )
  return url.toString()
}
