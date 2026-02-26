"use client"

import { useEffect, useState, useCallback, useRef } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Глобальный кэш
const cache = new Map<string, CacheEntry<unknown>>()

// Время жизни кэша по умолчанию (5 минут)
const DEFAULT_TTL = 5 * 60 * 1000

/**
 * Хук для кэширования данных с автоматическим обновлением
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => void
} {
  const [data, setData] = useState<T | null>(() => {
    const cached = cache.get(key) as CacheEntry<T> | undefined
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!data)
  const [error, setError] = useState<Error | null>(null)
  const isFetching = useRef(false)

  const fetchData = useCallback(async () => {
    if (isFetching.current) return
    isFetching.current = true
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      cache.set(key, { data: result, timestamp: Date.now() })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
      isFetching.current = false
    }
  }, [key, fetcher])

  const invalidate = useCallback(() => {
    cache.delete(key)
  }, [key])

  const refetch = useCallback(async () => {
    invalidate()
    await fetchData()
  }, [fetchData, invalidate])

  useEffect(() => {
    const cached = cache.get(key) as CacheEntry<T> | undefined
    if (!cached || Date.now() - cached.timestamp >= ttl) {
      fetchData()
    }
  }, [key, ttl, fetchData])

  return { data, isLoading, error, refetch, invalidate }
}

/**
 * Очистить весь кэш
 */
export function clearCache() {
  cache.clear()
}

/**
 * Очистить кэш по ключу
 */
export function invalidateCache(key: string) {
  cache.delete(key)
}

/**
 * Очистить кэш по паттерну
 */
export function invalidateCachePattern(pattern: string) {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}