"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, Plus, X, Check } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DependentLevel {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export interface DependentSelectProps {
  levels: DependentLevel[]
  className?: string
}

/**
 * Универсальный компонент зависимых выпадающих списков
 * Используется для каскадных выборок: категория → подкатегория → товар
 */
export function DependentSelect({ levels, className }: DependentSelectProps) {
  const t = useTranslations("common")
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [customValues, setCustomValues] = useState<Record<number, string>>({})
  const [showCustomInputs, setShowCustomInputs] = useState<Record<number, boolean>>({})
  const containersRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      containersRef.current.forEach((container, index) => {
        if (container && !container.contains(event.target as Node)) {
          setOpenIndex((prev) => (prev === index ? null : prev))
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (levelIndex: number, value: string) => {
    levels[levelIndex].onChange(value)
    setOpenIndex(null)

    // Сбрасываем последующие уровни при выборе значения
    for (let i = levelIndex + 1; i < levels.length; i++) {
      levels[i].onChange("")
    }
  }

  const handleAddCustom = (levelIndex: number) => {
    const customValue = customValues[levelIndex]?.trim()
    if (customValue) {
      handleSelect(levelIndex, customValue)
      setCustomValues((prev) => ({ ...prev, [levelIndex]: "" }))
      setShowCustomInputs((prev) => ({ ...prev, [levelIndex]: false }))
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      {levels.map((level, levelIndex) => {
        const isDisabled = levelIndex > 0 && !levels[levelIndex - 1].value
        const showCustom = showCustomInputs[levelIndex]
        const customValue = customValues[levelIndex] || ""

        return (
          <div
            key={level.label}
            ref={(el) => {
              containersRef.current[levelIndex] = el
            }}
          >
            {!showCustom ? (
              <div className="relative">
                <button
                  type="button"
                  disabled={isDisabled}
                  onClick={() =>
                    !isDisabled && setOpenIndex(openIndex === levelIndex ? null : levelIndex)
                  }
                  className={cn(
                    "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    !level.value && "text-muted-foreground"
                  )}
                >
                  <span>
                    {level.value
                      ? level.options.find((opt) => opt.value === level.value)?.label || level.value
                      : level.placeholder || t("combobox.selectPlaceholder")}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 opacity-50 transition-transform",
                      openIndex === levelIndex && "rotate-180"
                    )}
                  />
                </button>

                {openIndex === levelIndex && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg">
                    <div className="max-h-60 overflow-auto p-1">
                      {level.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(levelIndex, option.value)}
                          className={cn(
                            "w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent",
                            level.value === option.value && "bg-accent"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomInputs((prev) => ({ ...prev, [levelIndex]: true }))
                          setOpenIndex(null)
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent"
                      >
                        <Plus className="h-4 w-4" />
                        {t("combobox.addCustom")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={customValue}
                  onChange={(e) =>
                    setCustomValues((prev) => ({ ...prev, [levelIndex]: e.target.value }))
                  }
                  placeholder={t("combobox.addNewPlaceholder")}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustom(levelIndex)
                    }
                    if (e.key === "Escape") {
                      setShowCustomInputs((prev) => ({ ...prev, [levelIndex]: false }))
                      setCustomValues((prev) => ({ ...prev, [levelIndex]: "" }))
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowCustomInputs((prev) => ({ ...prev, [levelIndex]: false }))
                    setCustomValues((prev) => ({ ...prev, [levelIndex]: "" }))
                  }}
                  aria-label={t("cancel")}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => handleAddCustom(levelIndex)}
                  disabled={!customValue.trim()}
                  aria-label={t("confirm")}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
