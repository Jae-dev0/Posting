import multer from 'multer'

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
])

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
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
