"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export interface SourceOption {
  value: string
  label: string
  icon: React.ElementType
  color?: string
}

export interface SourceTypeSelectorProps {
  options: SourceOption[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Переключатель типа источника
 * Используется для выбора между custom/recipe/product и подобными вариантами
 */
export function SourceTypeSelector({
  options,
  value,
  onChange,
  className,
}: SourceTypeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {options.map((option) => {
        const Icon = option.icon
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-2 h-9 px-3 text-sm rounded-xl border transition-colors",
              isActive
                ? option.color || "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-accent"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-center leading-tight">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
