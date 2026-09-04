export const cmsKeys = {
  all: ['cms'] as const,
  dashboard: () => [...cmsKeys.all, 'dashboard'] as const,
  pages: () => [...cmsKeys.all, 'pages'] as const,
  pageList: () => [...cmsKeys.pages(), 'list'] as const,
  media: () => [...cmsKeys.all, 'media'] as const,
  navigation: () => [...cmsKeys.all, 'navigation'] as const,
  settings: () => [...cmsKeys.all, 'settings'] as const,
}
