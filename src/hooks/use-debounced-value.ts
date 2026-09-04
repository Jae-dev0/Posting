import { useEffect, useState } from 'react'

type UseDebouncedValueOptions = {
  wait?: number
}

export function useDebouncedValue<T>(
  value: T,
  { wait = 350 }: UseDebouncedValueOptions = {},
): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), wait)
    return () => window.clearTimeout(timer)
  }, [value, wait])

  return debounced
}
