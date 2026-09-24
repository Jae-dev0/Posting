import multer from 'multer'

const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm'])
const MAX_VIDEO_BYTES = 500 * 1024 * 1024

export const tiktokVideoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!VIDEO_MIME_TYPES.has(file.mimetype)) {
      callback(
        new Error('Only MP4, MOV, or WebM videos are allowed for TikTok'),
      )
      return
    }
    callback(null, true)
  },
})
