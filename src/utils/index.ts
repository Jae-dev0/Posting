export function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export function getSuccessMessage(
  name: string,
  action: string,
  entity: string,
): string {
  return `${entity} "${name}" ${action}.`
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string' &&
    error.response.data.message.trim()
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
): { data: T[]; total: number; currentPage: number; lastPage: number } {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(Math.max(1, page), lastPage)
  const start = (currentPage - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    total,
    currentPage,
    lastPage,
  }
}
