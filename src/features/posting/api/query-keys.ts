export const facebookKeys = {
  all: ['facebook'] as const,
  pages: () => [...facebookKeys.all, 'pages'] as const,
  posts: () => [...facebookKeys.all, 'posts'] as const,
  engagement: (postId: number) =>
    [...facebookKeys.all, 'engagement', postId] as const,
}

export const instagramKeys = {
  all: ['instagram'] as const,
  accounts: () => [...instagramKeys.all, 'accounts'] as const,
  posts: () => [...instagramKeys.all, 'posts'] as const,
  engagement: (postId: number) =>
    [...instagramKeys.all, 'engagement', postId] as const,
}
