import type {
  ConnectedAccount,
  PostDraft,
  PublishedPost,
  ScheduledPost,
} from '../types'
import { SocialPlatformEnum } from '../types'

export const mockConnectedAccounts: ConnectedAccount[] = [
  {
    id: 1,
    platform: SocialPlatformEnum.Facebook,
    accountName: 'Company Official Page',
    handle: 'Company Official Page',
    isConnected: true,
  },
  {
    id: 2,
    platform: SocialPlatformEnum.Instagram,
    accountName: '@companyofficial',
    handle: '@companyofficial',
    isConnected: true,
  },
  {
    id: 3,
    platform: SocialPlatformEnum.TikTok,
    accountName: '@companyofficial',
    handle: '@companyofficial',
    isConnected: true,
  },
]

export const defaultPostDraft: PostDraft = {
  caption: '',
  mediaUrls: [],
  mediaType: null,
  selectedAccountIds: [],
  publishMode: 'now',
  scheduledAt: null,
}

export const mockPublishedPosts: PublishedPost[] = [
  {
    id: 1,
    caption:
      'Introducing our newest product. Available now across all our channels.',
    mediaUrl:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop',
    platforms: [
      SocialPlatformEnum.Facebook,
      SocialPlatformEnum.Instagram,
      SocialPlatformEnum.TikTok,
    ],
    publishedAt: '2026-09-02T14:30:00.000Z',
    status: 'published',
  },
  {
    id: 2,
    caption: 'Summer sale starts today — up to 40% off selected items.',
    mediaUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
    platforms: [SocialPlatformEnum.Facebook, SocialPlatformEnum.Instagram],
    publishedAt: '2026-08-28T09:00:00.000Z',
    status: 'published',
  },
  {
    id: 3,
    caption: 'Behind the scenes at our latest photo shoot.',
    mediaUrl: null,
    platforms: [SocialPlatformEnum.TikTok],
    publishedAt: '2026-08-15T16:45:00.000Z',
    status: 'failed',
  },
]

export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: 1,
    caption: 'Launch day is here! Join us live at 3 PM.',
    mediaUrl:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop',
    platforms: [
      SocialPlatformEnum.Facebook,
      SocialPlatformEnum.Instagram,
      SocialPlatformEnum.TikTok,
    ],
    scheduledAt: '2026-09-05T07:00:00.000Z',
    status: 'scheduled',
  },
  {
    id: 2,
    caption: 'Weekly tips: how to get the most from our platform.',
    mediaUrl: null,
    platforms: [SocialPlatformEnum.Instagram],
    scheduledAt: '2026-09-10T10:00:00.000Z',
    status: 'scheduled',
  },
]
