"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export interface PriorityOption {
  value: string
  label: string
  color: string
}

export interface PrioritySelectorProps {
  options: PriorityOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Переключатель приоритетов
 * Используется в напоминаниях, задачах и других сущностях с приоритетами
 */
export function PrioritySelector({ options, value, onChange, className }: PrioritySelectorProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "flex flex-col items-center gap-1 px-2 py-3 text-xs rounded-xl border transition-colors",
            value === option.value
              ? `${option.color} border-current`
              : "bg-background hover:bg-accent border-transparent"
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              value === option.value ? option.color : "bg-muted"
            )}
          />
          <span className="text-center">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
