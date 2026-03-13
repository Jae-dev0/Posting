/**
 * SessionStorage key used to pass an auth error code to the login page
 * after the provider clears the session (e.g. invalid company claim).
 * The login page reads and removes this key so the URL stays clean.
 */
export const AUTH_ERROR_STORAGE_KEY = 'auth_error'

/** Error code set when token company claim is missing or invalid. */
export const AUTH_ERROR_INCOMPLETE_PROFILE = 'incomplete_profile'

/** User-facing message shown on login when account lacks valid company. */
export const INCOMPLETE_PROFILE_MESSAGE =
  'Your account is not linked to a valid company. Please contact your administrator.'

/** Fallback message when an unknown auth error code is present. */
export const AUTH_ERROR_GENERIC_MESSAGE =
  'An error occurred while logging in. Please try again.'
