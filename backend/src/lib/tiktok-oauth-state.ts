import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'

export type TikTokOAuthState = {
  userId: number
  companyId: number
}

export function signTikTokOAuthState(payload: TikTokOAuthState) {
  return jwt.sign({ ...payload, purpose: 'tiktok-oauth' }, env.JWT_SECRET, {
    expiresIn: '15m',
  })
}

export function verifyTikTokOAuthState(token: string): TikTokOAuthState {
  const decoded = jwt.verify(token, env.JWT_SECRET)
  if (
    typeof decoded === 'string' ||
    decoded.purpose !== 'tiktok-oauth' ||
    !Number.isInteger(Number(decoded.userId)) ||
    !Number.isInteger(Number(decoded.companyId))
  ) {
    throw new Error('Invalid TikTok OAuth state')
  }

  return {
    userId: Number(decoded.userId),
    companyId: Number(decoded.companyId),
  }
}
