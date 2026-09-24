import type { ConnectedAccount, Post, PostMedia, SocialPlatform } from '@prisma/client'

type PostWithAccounts = Post & {
  media: PostMedia[]
  accounts: Array<{
    accountId: number
    account: Pick<ConnectedAccount, 'id' | 'platform' | 'accountName' | 'handle' | 'isConnected'>
  }>
}

export function mapAccount(account: ConnectedAccount) {
  return {
    id: account.id,
    platform: account.platform,
    accountName: account.accountName,
    handle: account.handle,
    isConnected: account.isConnected,
  }
}

export function mapPublishedPost(post: PostWithAccounts) {
  return {
    id: post.id,
    caption: post.caption,
    mediaUrl: post.media[0]?.url ?? post.mediaUrl,
    media: post.media.map(({ url, type, position }) => ({ url, type, position })),
    platforms: post.accounts.map(
      ({ account }) => account.platform as SocialPlatform,
    ),
    publishedAt: post.publishedAt?.toISOString() ?? post.createdAt.toISOString(),
    status: post.status === 'failed' ? 'failed' : 'published',
  }
}

export function mapScheduledPost(post: PostWithAccounts) {
  return {
    id: post.id,
    caption: post.caption,
    mediaUrl: post.media[0]?.url ?? post.mediaUrl,
    media: post.media.map(({ url, type, position }) => ({ url, type, position })),
    platforms: post.accounts.map(
      ({ account }) => account.platform as SocialPlatform,
    ),
    scheduledAt: post.scheduledAt?.toISOString() ?? post.createdAt.toISOString(),
    status: post.status === 'failed' ? 'failed' : 'scheduled',
  }
}

export function mapPostDetail(post: PostWithAccounts) {
  return {
    id: post.id,
    caption: post.caption,
    mediaUrl: post.media[0]?.url ?? post.mediaUrl,
    mediaType: post.media[0]?.type ?? post.mediaType,
    media: post.media.map(({ url, type, position }) => ({ url, type, position })),
    publishMode: post.publishMode,
    status: post.status,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    selectedAccountIds: post.accounts.map(({ accountId }) => accountId),
    platforms: post.accounts.map(({ account }) => account.platform),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}
