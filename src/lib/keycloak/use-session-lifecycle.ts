import type Keycloak from 'keycloak-js'
import { useCallback, useEffect } from 'react'

import { env } from '@/config/env'

import type { TokenState } from './context'
import { logoutToLogin } from './logout-to-login'
import { validateTokenParsed } from './schema'
import {
  IDLE_ACTIVITY_DEBOUNCE_MS,
  SESSION_REFRESH_POLL_MS,
  UPDATE_TOKEN_MIN_VALIDITY_SEC,
} from './session-constants'

const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const

type UseSessionLifecycleArgs = {
  client: Keycloak
  enabled: boolean
  setIsAuthenticated: (value: boolean) => void
  setToken: (value: TokenState | null) => void
}

export function useSessionLifecycle({
  client,
  enabled,
  setIsAuthenticated,
  setToken,
}: UseSessionLifecycleArgs) {
  const refreshSession = useCallback(async () => {
    if (!client.authenticated) {
      setIsAuthenticated(false)
      setToken(null)
      return
    }

    try {
      await client.updateToken(UPDATE_TOKEN_MIN_VALIDITY_SEC)
    } catch {
      setIsAuthenticated(false)
      setToken(null)
      await logoutToLogin(client)
      return
    }

    if (!client.token) {
      setIsAuthenticated(false)
      setToken(null)
      await logoutToLogin(client)
      return
    }

    setIsAuthenticated(true)
    setToken(validateTokenParsed(client.tokenParsed))
  }, [client, setIsAuthenticated, setToken])

  useEffect(() => {
    if (!enabled) return

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void refreshSession()
      }
    }

    document.addEventListener('visibilitychange', onVisible)

    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshSession()
      }
    }, SESSION_REFRESH_POLL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(pollId)
    }
  }, [enabled, refreshSession])

  const idleMinutes = env.SESSION_IDLE_LOGOUT_MINUTES
  const idleLogoutMs = idleMinutes * 60_000

  useEffect(() => {
    if (!enabled || idleLogoutMs <= 0) return

    let idleTimeoutId: number
    let debounceId: number

    const scheduleIdleLogout = () => {
      window.clearTimeout(idleTimeoutId)
      idleTimeoutId = window.setTimeout(() => {
        void logoutToLogin(client)
      }, idleLogoutMs)
    }

    scheduleIdleLogout()

    const bumpActivity = () => {
      window.clearTimeout(debounceId)
      debounceId = window.setTimeout(() => {
        scheduleIdleLogout()
      }, IDLE_ACTIVITY_DEBOUNCE_MS)
    }

    for (const ev of ACTIVITY_EVENTS) {
      document.addEventListener(ev, bumpActivity, { passive: true })
    }

    return () => {
      window.clearTimeout(idleTimeoutId)
      window.clearTimeout(debounceId)
      for (const ev of ACTIVITY_EVENTS) {
        document.removeEventListener(ev, bumpActivity)
      }
    }
  }, [client, enabled, idleLogoutMs])
}
