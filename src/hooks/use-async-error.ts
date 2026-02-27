"use client"

import { useCallback, useState } from "react"

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export function useAsyncError() {
  const [, setError] = useState<Error | null>(null)

  const throwAsyncError = useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])

  return { throwAsyncError }
}

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: false,
  })

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setState({ data: null, error: null, isLoading: true })

    try {
      const data = await asyncFn()
      setState({ data, error: null, isLoading: false })
      return data
    } catch (error) {
      setState({ data: null, error: error as Error, isLoading: false })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false })
  }, [])

  return { ...state, execute, reset }
}
