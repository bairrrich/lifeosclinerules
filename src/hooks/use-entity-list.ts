"use client"

import { useEffect, useState, useCallback } from "react"
import { db } from "@/lib/db"
import { toast } from "@/components/ui/toast"
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from "@/lib/constants"

interface Entity<T> {
  toArray(): Promise<T[]>
  get(id: string | number): Promise<T | undefined>
  where(keyPath: string): { equals(value: any): Entity<T> }
}

interface UseEntityListResult<T> {
  data: T[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  retry: () => Promise<void>
}

/**
 * Хук для получения списка сущностей из IndexedDB
 * Автоматически управляет загрузкой и ошибками
 */
export function useEntityList<T extends { id?: string | number }>(
  entity: Entity<T>,
  filter?: (item: T) => boolean
): UseEntityListResult<T> {
  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchData = useCallback(
    async (isRetry = false) => {
      try {
        setIsLoading(true)
        const items = await entity.toArray()
        setData(filter ? items.filter(filter) : items)
        setError(null)
        setRetryCount(0)
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err))
        setError(errorObj)

        if (isRetry && retryCount < MAX_RETRY_ATTEMPTS) {
          // Retry with delay
          setTimeout(
            () => {
              setRetryCount((prev) => prev + 1)
              fetchData(true)
            },
            RETRY_DELAY_MS * (retryCount + 1)
          )
        } else if (!isRetry) {
          // Show toast on first error
          toast.error(`Ошибка загрузки: ${errorObj.message}`)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [entity, filter, retryCount]
  )

  const retry = useCallback(async () => {
    setRetryCount(0)
    await fetchData(true)
  }, [fetchData])

  const refetch = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  return { data, isLoading, error, refetch, retry }
}

/**
 * Хук для получения одной сущности по ID
 */
export function useEntity<T extends { id?: string | number }>(
  entity: Entity<T>,
  id?: string | number
): { data: T | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        const item = await entity.get(id)
        setData(item || null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [entity, id])

  return { data, isLoading, error }
}

/**
 * Хук для получения активных сущностей (с флагом is_active)
 */
export function useActiveEntities<T extends Record<string, any>>(
  entity: Entity<T>,
  keyPath = "is_active"
): UseEntityListResult<T> {
  return useEntityList<T>(entity, (item) => !!item[keyPath])
}
