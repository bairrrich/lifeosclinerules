"use client"

import { Loader2 } from "@/lib/icons"
import { cn } from "@/lib/utils"

export interface LoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
  showBorder?: boolean
}

/**
 * Универсальное состояние загрузки
 * Используется при загрузке данных и асинхронных операциях
 */
export function LoadingState({
  message,
  size = "md",
  className,
  showBorder = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "gap-2 py-4",
    md: "gap-3 py-8",
    lg: "gap-4 py-12",
  }

  const spinnerSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        sizeClasses[size],
        showBorder && "border rounded-xl",
        className
      )}
    >
      <Loader2 className={cn("animate-spin text-primary", spinnerSizes[size])} />
      {message && <p className={cn("text-muted-foreground mt-2", textSizes[size])}>{message}</p>}
    </div>
  )
}
