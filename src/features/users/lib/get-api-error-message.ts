import { isAxiosError } from 'axios'

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data
    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof responseData.message === 'string' &&
      responseData.message.trim()
    ) {
      return responseData.message
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
