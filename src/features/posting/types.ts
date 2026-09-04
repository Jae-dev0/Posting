import type { Timestamp } from '@/types/common'

export const SocialPlatformEnum = {
  Facebook: 'facebook',
  Instagram: 'instagram',
  TikTok: 'tiktok',
} as const

export type SocialPlatform =
  (typeof SocialPlatformEnum)[keyof typeof SocialPlatformEnum]

export type ConnectedAccount = {
  id: number
  platform: SocialPlatform
  accountName: string
  handle: string
  isConnected: boolean
  /** Meta SocialAccount.id used when publishing (may differ from UI id). */
  socialAccountId?: number
}

export type PostDraft = {
  caption: string
  /** Preview URLs (blob: or https). Supports up to MEDIA_MAX_IMAGES. */
  mediaUrls: string[]
  mediaType: 'image' | 'video' | null
  selectedAccountIds: number[]
  publishMode: 'now' | 'schedule'
  scheduledAt: Timestamp | null
}

export type PublishedPost = {
  id: number
  caption: string
  mediaUrl: string | null
  platforms: SocialPlatform[]
  publishedAt: Timestamp
  status: 'published' | 'failed'
  /** True when Meta Graph engagement can be fetched for Facebook. */
  canFetchFacebookEngagement?: boolean
  /** True when Meta Graph engagement can be fetched for Instagram. */
  canFetchInstagramEngagement?: boolean
}


export type ScheduledPost = {
  id: number
  caption: string
  mediaUrl: string | null
  platforms: SocialPlatform[]
  scheduledAt: Timestamp
  status: 'scheduled' | 'failed'
}
