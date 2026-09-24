import { Router } from 'express'
import { existsSync } from 'fs'

import {
  getPublicMediaUrl,
  resolveMediaPath,
  savePublicMediaFile,
} from '../lib/media-store.js'
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js'
import { marketingMediaUpload } from '../middleware/facebook-image-upload.js'

export const mediaRouter = Router()

/**
 * Authenticated upload for draft/schedule media (returns a public media URL).
 * POST /api/media/upload  multipart field: `media`
 */
mediaRouter.post(
  '/upload',
  requireAuth,
  marketingMediaUpload.single('media'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.user?.companyId) {
        res.status(403).json({ message: 'Company context required' })
        return
      }

      const file = req.file
      if (!file) {
        res.status(400).json({ message: 'Image or MP4 video file is required' })
        return
      }
      if (file.mimetype.startsWith('image/') && file.size > 10 * 1024 * 1024) {
        res.status(413).json({ message: 'Images must be 10 MB or smaller' })
        return
      }

      const filename = await savePublicMediaFile({
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
      })

      res.status(201).json({
        filename,
        url: getPublicMediaUrl(filename),
        type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      })
    } catch (error) {
      next(error)
    }
  },
)

/**
 * Public media files for Meta Instagram image_url fetching.
 * GET /api/media/:filename
 */
mediaRouter.get('/:filename', (req, res) => {
  try {
    const filePath = resolveMediaPath(req.params.filename)
    if (!existsSync(filePath)) {
      res.status(404).json({ message: 'Media not found' })
      return
    }
    res.sendFile(filePath)
  } catch {
    res.status(400).json({ message: 'Invalid media filename' })
  }
})
