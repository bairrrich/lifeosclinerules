"use client"

import { useEffect, useState, useRef } from "react"
import { ChevronDown, Plus } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ComboboxSelectProps {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ComboboxSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Выберите...",
}: ComboboxSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>
      {!showCustomInput ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg">
              <div className="max-h-60 overflow-auto p-1">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent ${
                      value === option ? "bg-accent" : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="border-t p-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(true)
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  Добавить свой вариант
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Введите свой вариант"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setShowCustomInput(false)
              setCustomValue("")
            }}
            aria-label="Отмена"
          >
            ✕
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (customValue.trim()) {
                onChange(customValue.trim())
                setShowCustomInput(false)
                setCustomValue("")
              }
            }}
            aria-label="Подтвердить"
          >
            ✓
          </Button>
        </div>
      )}
    </div>
  )
}
