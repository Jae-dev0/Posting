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

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (status?: string) => [...postKeys.lists(), status ?? 'all'] as const,
  detail: (id: number) => [...postKeys.all, 'detail', id] as const,
}

export const analyticsKeys = {
  all: ['analytics'] as const,
  summary: () => [...analyticsKeys.all, 'summary'] as const,
}

export const teamKeys = {
  all: ['team'] as const,
  overview: () => [...teamKeys.all, 'overview'] as const,
}
