import type { User } from '@prisma/client'

export function mapUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullname: `${user.firstName} ${user.lastName}`.trim(),
    username: user.email.split('@')[0] ?? user.email,
    role: user.role,
    companyId: user.companyId,
    createdAt: user.createdAt.toISOString(),
  }
}
