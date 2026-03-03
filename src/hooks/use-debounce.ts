"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Хук для debounce значений
 * @param value - Значение для debounce
 * @param delay - Задержка в миллисекундах (по умолчанию 300мс)
 * @returns Debounced значение
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Хук для debounce функций
 * @param fn - Функция для debounce
 * @param delay - Задержка в миллисекундах (по умолчанию 300мс)
 * @returns Debounced функция
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(fn: T, delay = 300): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      const id = setTimeout(() => {
        fn(...args)
      }, delay)

      setTimeoutId(id)
    },
    [fn, delay, timeoutId]
  ) as T

  return debouncedFn
}
