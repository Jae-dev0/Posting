import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'

export type MetaOAuthPlatform = 'facebook' | 'instagram'

export type MetaOAuthState = {
  userId: number
  companyId: number
  platform: MetaOAuthPlatform
}

const STATE_EXPIRES_IN = '15m'

export function signMetaOAuthState(payload: MetaOAuthState) {
  return jwt.sign(
    {
      userId: payload.userId,
      companyId: payload.companyId,
      platform: payload.platform,
      purpose: 'meta-oauth',
    },
    env.JWT_SECRET,
    { expiresIn: STATE_EXPIRES_IN },
  )
}

/** @deprecated Use signMetaOAuthState */
export function signFacebookOAuthState(payload: {
  userId: number
  companyId: number
}) {
  return signMetaOAuthState({ ...payload, platform: 'facebook' })
}

export function verifyMetaOAuthState(token: string): MetaOAuthState {
  const decoded = jwt.verify(token, env.JWT_SECRET)

  if (typeof decoded === 'string') {
    throw new Error('Invalid OAuth state')
  }

  const purpose = decoded.purpose
  const userId = Number(decoded.userId)
  const companyId = Number(decoded.companyId)
  const platform =
    decoded.platform === 'instagram' || decoded.platform === 'facebook'
      ? decoded.platform
      : purpose === 'facebook-oauth'
        ? 'facebook'
        : null

  if (
    (purpose !== 'meta-oauth' && purpose !== 'facebook-oauth') ||
    !Number.isInteger(userId) ||
    !Number.isInteger(companyId) ||
    !platform
  ) {
    throw new Error('Invalid OAuth state payload')
  }

  return { userId, companyId, platform }
}

/** @deprecated Use verifyMetaOAuthState */
export function verifyFacebookOAuthState(token: string) {
  const state = verifyMetaOAuthState(token)
  return { userId: state.userId, companyId: state.companyId }
}
