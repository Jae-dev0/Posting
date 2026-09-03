import { Router } from 'express'
import { existsSync } from 'fs'

import { resolveMediaPath } from '../lib/media-store.js'

export const mediaRouter = Router()

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
