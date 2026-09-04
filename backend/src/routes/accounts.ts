import { Router } from 'express'

import { mapAccount } from '../lib/mappers.js'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { requireMainAdmin } from '../middleware/require-main-admin.js'
import { createAccountSchema, updateAccountSchema } from '../schemas/posting.js'

export const accountsRouter = Router()

accountsRouter.use(requireAuth)

accountsRouter.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const accounts = await prisma.connectedAccount.findMany({
      where: { companyId },
      orderBy: { id: 'asc' },
    })
    res.json(accounts.map(mapAccount))
  } catch (error) {
    next(error)
  }
})

accountsRouter.post('/', requireMainAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const body = createAccountSchema.parse(req.body)
    const account = await prisma.connectedAccount.create({
      data: { ...body, companyId },
    })
    res.status(201).json(mapAccount(account))
  } catch (error) {
    next(error)
  }
})

accountsRouter.patch('/:id', requireMainAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const companyId = req.user?.companyId
    if (!companyId) {
      res.status(403).json({ message: 'Company context required' })
      return
    }

    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      res.status(400).json({ message: 'Invalid account id' })
      return
    }

    const existing = await prisma.connectedAccount.findFirst({
      where: { id, companyId },
    })
    if (!existing) {
      res.status(404).json({ message: 'Account not found' })
      return
    }

    const body = updateAccountSchema.parse(req.body)
    const account = await prisma.connectedAccount.update({
      where: { id },
      data: body,
    })
    res.json(mapAccount(account))
  } catch (error) {
    next(error)
  }
})
