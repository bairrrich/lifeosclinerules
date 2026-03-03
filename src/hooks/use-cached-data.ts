"use client"

import { useState, useEffect, useCallback } from "react"
import { db } from "@/lib/db"

// Cache TTL constants
export const CACHE_SHORT_TTL = 60 * 1000 // 1 minute
export const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
export const CACHE_LONG_TTL = 60 * 60 * 1000 // 1 hour

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// In-memory cache
const cache = new Map<string, CacheEntry<any>>()

/**
 * Get cached data or fetch from database
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): { data: T | null; isLoading: boolean; error: Error | null; refetch: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check cache first
      const cached = cache.get(key)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setData(cached.data)
        setIsLoading(false)
        return
      }

      // Fetch from database
      const newData = await fetchFn()
      cache.set(key, { data: newData, timestamp: Date.now(), ttl })
      setData(newData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [key, fetchFn, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

/**
 * Get cached categories by type
 */
export function useCategories(type?: string) {
  const key = type ? `categories:${type}` : "categories:all"
  const fetchFn = async () => {
    const all = await db.categories.toArray()
    return type ? all.filter((c) => c.type === type) : all
  }

  return useCachedData(key, fetchFn, CACHE_LONG_TTL)
}

/**
 * Get cached units
 */
export function useUnits() {
  return useCachedData("units", () => db.units.toArray(), CACHE_LONG_TTL)
}

/**
 * Get cached accounts
 */
export function useAccounts() {
  return useCachedData("accounts", () => db.accounts.toArray(), CACHE_LONG_TTL)
}

/**
 * Get cached tags
 */
export function useTags() {
  return useCachedData("tags", () => db.tags.toArray(), CACHE_LONG_TTL)
}

/**
 * Clear cache for specific key
 */
export function clearCache(key: string): void {
  cache.delete(key)
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear()
}

/**
 * Invalidate cache older than TTL
 */
export function cleanupCache(): void {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key)
    }
  }
}

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupCache, 5 * 60 * 1000)
}
