export const USER_ROLE = {
  MAIN_ADMIN: 'main_admin',
  ADMIN: 'admin',
} as const

export type UserRoleValue = (typeof USER_ROLE)[keyof typeof USER_ROLE]

export const USER_ROLE_OPTIONS = [
<<<<<<< HEAD
  { value: USER_ROLE.MAIN_ADMIN, label: 'Marketing Admin' },
  { value: USER_ROLE.ADMIN, label: 'Marketing Sub Admin' },
] as const

/** Roles Marketing Admin can assign when creating accounts. */
export const MARKETING_SUB_ADMIN_OPTIONS = [
  { value: USER_ROLE.ADMIN, label: 'Marketing Sub Admin' },
=======
  { value: USER_ROLE.MAIN_ADMIN, label: 'Main Admin' },
  { value: USER_ROLE.ADMIN, label: 'Admin' },
>>>>>>> origin/main
] as const

export function getUserRoleLabel(role: UserRoleValue) {
  return (
    USER_ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role
  )
}
