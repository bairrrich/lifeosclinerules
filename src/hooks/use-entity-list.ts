"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/db"

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

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const items = await entity.toArray()
      setData(filter ? items.filter(filter) : items)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [entity])

  return { data, isLoading, error, refetch: fetchData }
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
