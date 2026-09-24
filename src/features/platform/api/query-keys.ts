export const platformKeys = {
  all: ['platform'] as const,
  dashboard: () => [...platformKeys.all, 'dashboard'] as const,
  companies: () => [...platformKeys.all, 'companies'] as const,
  companyList: (filters: object) =>
    [...platformKeys.companies(), 'list', filters] as const,
  companyDetail: (id: number) =>
    [...platformKeys.companies(), 'detail', id] as const,
  users: (filters: object = {}) =>
    [...platformKeys.all, 'users', filters] as const,
  websites: () => [...platformKeys.all, 'websites'] as const,
  media: () => [...platformKeys.all, 'media'] as const,
  settings: () => [...platformKeys.all, 'settings'] as const,
  roles: () => [...platformKeys.all, 'roles'] as const,
  permissions: () => [...platformKeys.all, 'permissions'] as const,
  audit: (filters: object = {}) =>
    [...platformKeys.all, 'audit', filters] as const,
}
