import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

import { env } from './config/env.js'
import { accountsRouter } from './routes/accounts.js'
<<<<<<< HEAD
import { analyticsRouter } from './routes/analytics.js'
import { auditRouter } from './routes/audit.js'
import { authRouter } from './routes/auth.js'
import { cmsRouter } from './routes/cms.js'
import { cmsUsersRouter } from './routes/cms-users.js'
import { companiesRouter } from './routes/companies.js'
import { healthRouter } from './routes/health.js'
import { mediaRouter } from './routes/media.js'
import { platformRouter } from './routes/platform.js'
import { postsRouter } from './routes/posts.js'
import { rolesRouter } from './routes/roles.js'
import { facebookSocialRouter } from './routes/social-facebook.js'
import { instagramSocialRouter } from './routes/social-instagram.js'
import { tiktokSocialRouter } from './routes/social-tiktok.js'
import { teamRouter } from './routes/team.js'
=======
import { authRouter } from './routes/auth.js'
import { healthRouter } from './routes/health.js'
import { postsRouter } from './routes/posts.js'
import { facebookSocialRouter } from './routes/social-facebook.js'
import { instagramSocialRouter } from './routes/social-instagram.js'
import { mediaRouter } from './routes/media.js'
>>>>>>> origin/main
import { usersRouter } from './routes/users.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    }),
  )
  app.use(express.json({ limit: '2mb' }))

  app.use('/api/health', healthRouter)
  app.use('/api/auth', authRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/media', mediaRouter)
  app.use('/api/social/facebook', facebookSocialRouter)
  app.use('/api/social/instagram', instagramSocialRouter)
<<<<<<< HEAD
  app.use('/api/social/tiktok', tiktokSocialRouter)
  app.use('/api/accounts', accountsRouter)
  app.use('/api/posts', postsRouter)
  app.use('/api/analytics', analyticsRouter)
  app.use('/api/team', teamRouter)
  app.use('/api/companies', companiesRouter)
  app.use('/api/platform', platformRouter)
  app.use('/api/audit', auditRouter)
  app.use('/api/roles', rolesRouter)
  app.use('/api/cms', cmsRouter)
  app.use('/api/cms/users', cmsUsersRouter)

  app.use((req, res) => {
    res
      .status(404)
      .json({ message: `Route not found: ${req.method} ${req.path}` })
  })

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: 'Validation failed',
          issues: error.issues,
        })
        return
      }

      if (error instanceof multer.MulterError) {
        res.status(400).json({
          message:
            error.code === 'LIMIT_FILE_SIZE'
              ? 'Image must be 10 MB or smaller'
              : error.message,
        })
        return
      }

      if (
        error instanceof Error &&
        (error.message.startsWith('Only JPEG, PNG, GIF, or WebP') ||
          error.message.startsWith('Only MP4, MOV, or WebM'))
      ) {
        res.status(400).json({ message: error.message })
        return
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          res.status(404).json({ message: 'Resource not found' })
          return
        }
        if (error.code === 'P2002') {
          res.status(409).json({ message: 'Resource already exists' })
          return
        }
      }

      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    },
  )
=======
  app.use('/api/accounts', accountsRouter)
  app.use('/api/posts', postsRouter)

  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
  })

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({
        message: 'Validation failed',
        issues: error.issues,
      })
      return
    }

    if (error instanceof multer.MulterError) {
      res.status(400).json({
        message:
          error.code === 'LIMIT_FILE_SIZE'
            ? 'Image must be 10 MB or smaller'
            : error.message,
      })
      return
    }

    if (
      error instanceof Error &&
      error.message.startsWith('Only JPEG, PNG, GIF, or WebP')
    ) {
      res.status(400).json({ message: error.message })
      return
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Resource not found' })
        return
      }
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'Resource already exists' })
        return
      }
    }

    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  })
>>>>>>> origin/main

  return app
}
