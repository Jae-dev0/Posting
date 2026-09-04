import { useCallback, useState } from 'react'

export const useEntityViewDialog = <T>() => {
  const [isOpen, setIsOpen] = useState(false)
  const [entity, setEntity] = useState<T | null>(null)

  const openWith = useCallback((item: T) => {
    setEntity(item)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setEntity(null)
  }, [])

  return { isOpen, entity, openWith, close }
}
