"use client"

import { useEffect, useState, useRef, Suspense, lazy, ComponentType } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface LazyLoadProps {
  children: React.ReactNode
  placeholder?: React.ReactNode
  rootMargin?: string
  threshold?: number
}

/**
 * Компонент для отложенной загрузки контента при появлении в viewport
 */
export function LazyLoad({
  children,
  placeholder,
  rootMargin = "100px",
  threshold = 0.1,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(element)

    return () => observer.unobserve(element)
  }, [rootMargin, threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : (placeholder || <Skeleton className="h-40 w-full" />)}
    </div>
  )
}

/**
 * HOC для lazy loading компонентов
 */
export function lazyLoad<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback: React.ReactNode = <Skeleton className="h-40 w-full" />
) {
  const LazyComponent = lazy(importFn)

  return function LazyLoadedComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

/**
 * Хук для определения видимости элемента
 */
export function useIntersectionObserver(
  rootMargin = "0px",
  threshold = 0.1
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(element)

    return () => observer.unobserve(element)
  }, [rootMargin, threshold])

  return [ref, isVisible]
}