import multer from 'multer'

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 100 * 1024 * 1024
export const MAX_IMAGES_PER_POST = 10

export const facebookImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: MAX_IMAGES_PER_POST },
  fileFilter: (_req, file, callback) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'))
      return
    }
    callback(null, true)
  },
})

const MARKETING_MEDIA_MIME_TYPES = new Set([...IMAGE_MIME_TYPES, 'video/mp4'])

/** Upload policy for local draft/scheduled post media. */
export const marketingMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_VIDEO_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!MARKETING_MEDIA_MIME_TYPES.has(file.mimetype)) {
      callback(new Error('Only JPEG, PNG, GIF, WebP images, or MP4 videos are allowed'))
      return
    }
    if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_BYTES) {
      callback(new Error('Images must be 10 MB or smaller'))
      return
    }
    callback(null, true)
  },
})
