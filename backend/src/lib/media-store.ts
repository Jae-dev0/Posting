import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

<<<<<<< HEAD
import { getPublicApiBaseUrl, env } from '../config/env.js'
=======
import { getPublicApiBaseUrl } from '../config/env.js'
>>>>>>> origin/main

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
<<<<<<< HEAD
  'video/mp4': '.mp4',
=======
>>>>>>> origin/main
}

export async function savePublicMediaFile(file: {
  buffer: Buffer
  mimetype: string
  originalname: string
}) {
  await mkdir(UPLOAD_DIR, { recursive: true })

  const fromName = path.extname(file.originalname).toLowerCase()
  const ext = EXT_BY_MIME[file.mimetype] ?? (fromName || '.jpg')
  const filename = `${randomUUID()}${ext}`
  await writeFile(path.join(UPLOAD_DIR, filename), file.buffer)
  return filename
}

<<<<<<< HEAD
/**
 * Browser-facing media URL (via nginx same-origin `/api/media/...` when possible).
 * Prefer FRONTEND_URL so Docker UI on :3000 can load thumbnails after publish.
 */
export function getPublicMediaUrl(filename: string) {
  const pathPart = `/api/media/${filename}`
  const frontendBase = env.FRONTEND_URL?.replace(/\/$/, '')
  if (frontendBase) {
    return `${frontendBase}${pathPart}`
  }
  return `${getPublicApiBaseUrl()}${pathPart}`
}

/**
 * Absolute URL Meta Graph can fetch (requires PUBLIC_API_BASE_URL tunnel in local Docker).
 */
export function getMetaFetchableMediaUrl(filename: string) {
=======
export function getPublicMediaUrl(filename: string) {
>>>>>>> origin/main
  return `${getPublicApiBaseUrl()}/api/media/${filename}`
}

export function resolveMediaPath(filename: string) {
  const safe = path.basename(filename)
  if (safe !== filename || safe.includes('..')) {
    throw new Error('Invalid media filename')
  }
  return path.join(UPLOAD_DIR, safe)
}

export function isPubliclyReachableUrl(url: string) {
  try {
    const { hostname, protocol } = new URL(url)
    if (protocol !== 'https:' && protocol !== 'http:') return false
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}
