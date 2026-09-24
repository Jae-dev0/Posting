import type { NextFunction, Request, Response } from 'express'

<<<<<<< HEAD
import {
  buildAuthContext,
  type AuthContextUser,
  type RoleAssignmentWithRole,
  userHasPermission,
} from '../lib/auth-context.js'
import { verifyAccessToken } from '../lib/jwt.js'
import type { PermissionName } from '../lib/permissions.js'
import { prisma } from '../lib/prisma.js'

export type AuthenticatedRequest = Request & {
  user?: AuthContextUser
  /** Resolved tenant for the request (never trust client company_id for non–super-admins). */
  tenantCompanyId?: number
}

const assignmentInclude = {
  role: {
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  },
} as const

export async function loadAuthContext(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roleAssignments: { include: assignmentInclude },
    },
  })

  if (!user) {
    return null
  }

  const { roleAssignments, ...rest } = user
  return buildAuthContext(
    rest,
    roleAssignments as unknown as RoleAssignmentWithRole[],
  )
=======
import { verifyAccessToken } from '../lib/jwt.js'
import { prisma } from '../lib/prisma.js'
import { mapUser } from '../lib/user-mapper.js'

export type AuthenticatedRequest = Request & {
  user?: ReturnType<typeof mapUser>
>>>>>>> origin/main
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  const token = header.slice('Bearer '.length)

  try {
    const payload = verifyAccessToken(token)
<<<<<<< HEAD
    const authUser = await loadAuthContext(payload.sub)

    if (!authUser) {
=======
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user) {
>>>>>>> origin/main
      res.status(401).json({ message: 'Invalid or expired token' })
      return
    }

<<<<<<< HEAD
    if (authUser.status === 'disabled') {
      res.status(403).json({ message: 'Account is disabled' })
      return
    }

    req.user = authUser
=======
    req.user = mapUser(user)
>>>>>>> origin/main
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
<<<<<<< HEAD

export function requirePermission(...permissions: PermissionName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    const allowed = permissions.every((p) => userHasPermission(user, p))
    if (!allowed) {
      res.status(403).json({ message: 'Insufficient permissions' })
      return
    }

    next()
  }
}

export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user?.isSuperAdmin) {
    res.status(403).json({ message: 'Super Admin access required' })
    return
  }
  next()
}

/**
 * Resolves tenant company for the request.
 * Super Admin may pass X-Company-Id to act on a tenant.
 * Everyone else is locked to their home companyId.
 */
export function resolveTenantScope(options?: {
  allowQueryOverrideForSuperAdmin?: boolean
}) {
  const allowQuery = options?.allowQueryOverrideForSuperAdmin ?? true

  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user) {
      res.status(401).json({ message: 'Authentication required' })
      return
    }

    const headerRaw = req.headers['x-company-id']
    const headerValue = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw
    const queryRaw = allowQuery
      ? (req.query.companyId ?? req.query.company_id)
      : undefined
    const requested =
      headerValue != null && String(headerValue) !== ''
        ? Number(headerValue)
        : queryRaw != null && String(queryRaw) !== ''
          ? Number(queryRaw)
          : undefined

    if (user.isSuperAdmin) {
      if (requested != null) {
        if (!Number.isInteger(requested) || requested <= 0) {
          res.status(400).json({ message: 'Invalid company id' })
          return
        }
        req.tenantCompanyId = requested
      } else {
        req.tenantCompanyId = user.companyId
      }
      next()
      return
    }

    if (requested != null && requested !== user.companyId) {
      res.status(403).json({
        message: 'Access to another company is not allowed',
      })
      return
    }

    req.tenantCompanyId = user.companyId
    next()
  }
}

export function requireTenantCompany(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.tenantCompanyId) {
    res.status(403).json({ message: 'Company context required' })
    return
  }
  next()
}
=======
>>>>>>> origin/main
