/** Min validity (seconds) for `keycloak.updateToken` — refresh if access token expires sooner. */
export const UPDATE_TOKEN_MIN_VALIDITY_SEC = 5

/**
 * How often to probe refresh while the document is visible.
 * API calls already refresh via OpenAPI; this covers idle UI with no requests.
 */
export const SESSION_REFRESH_POLL_MS = 60_000

/** Debounce user activity before resetting the idle timer (reduces scroll spam). */
export const IDLE_ACTIVITY_DEBOUNCE_MS = 500
