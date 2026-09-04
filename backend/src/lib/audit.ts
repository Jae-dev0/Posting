import { Prisma } from '@prisma/client'

import { prisma } from './prisma.js'

export async function writeAuditLog(input: {
  companyId: number
  userId?: number | null
  action: string
  entityType: string
  entityId?: number | null
  summary: string
  metadata?: Prisma.InputJsonValue
}) {
  const { companyId, userId, action, entityType, entityId, summary, metadata } =
    input

  try {
    await prisma.auditLog.create({
      data: {
        companyId,
        userId: userId ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        summary,
        metadata: metadata ?? undefined,
      },
    })
  } catch (error) {
    console.error('[audit] Failed to write audit log', error)
  }
}
