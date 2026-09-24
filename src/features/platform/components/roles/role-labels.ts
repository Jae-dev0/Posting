const SYSTEM_ROLE_LABELS: Record<string, string> = {
  super_admin: 'Main Admin',
  company_admin: 'CMS Admin',
  marketing_admin: 'Marketing Admin',
  employee: 'Employee',
}

export function getRoleDisplayName(name: string) {
  return SYSTEM_ROLE_LABELS[name] ?? name
}
