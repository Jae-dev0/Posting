import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'

import { env } from '../config/env.js'

export type AuthTokenPayload = {
  sub: number
  email: string
}

export function signAccessToken(payload: AuthTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  }

  return jwt.sign(payload, env.JWT_SECRET, options)
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET)

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload')
  }

  const payload = decoded as JwtPayload & AuthTokenPayload

  if (typeof payload.sub !== 'number' && typeof payload.sub !== 'string') {
    throw new Error('Invalid token subject')
  }

  return {
    sub: typeof payload.sub === 'string' ? Number(payload.sub) : payload.sub,
    email: payload.email,
  }
}
