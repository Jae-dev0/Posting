import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { getPublicApiBaseUrl } from '../config/env.js'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
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

export function getPublicMediaUrl(filename: string) {
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
