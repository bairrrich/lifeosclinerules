"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from "next-intl"
import { ChevronDown, Plus, X, Check } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  id: string
  label: string
}

export interface ComboboxProps {
  label?: string
  options: ComboboxOption[]
  value: string | string[]
  onChange: (value: string | string[], newItem?: string) => void
  mode?: "single" | "multiple"
  placeholder?: string
  allowCustom?: boolean
  searchable?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Универсальный компонент Combobox
 * Поддерживает одиночный и множественный выбор, поиск и добавление custom значений
 */
export function Combobox({
  label,
  options,
  value,
  onChange,
  mode = "single",
  placeholder,
  allowCustom = true,
  searchable = mode === "multiple",
  disabled = false,
  className,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useTranslations("common")

  const selectedIds = mode === "multiple" ? (value as string[]) : value ? [value as string] : []
  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id))

  // Фильтрация опций по поиску
  const filteredOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options

  // Проверка, есть ли точное совпадение с существующим вариантом
  const exactMatch = options.some(
    (option) => option.label.toLowerCase() === searchQuery.toLowerCase()
  )

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
        setSearchQuery("")
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Фокус на input при показе формы добавления
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showAddForm])

  const handleSelect = (id: string) => {
    if (mode === "multiple") {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((i) => i !== id))
      } else {
        onChange([...selectedIds, id])
      }
    } else {
      onChange(id)
      setIsOpen(false)
    }
  }

  const handleAddNew = () => {
    const trimmedName = newItemName.trim() || searchQuery.trim()
    if (trimmedName) {
      if (mode === "multiple") {
        onChange(selectedIds, trimmedName)
      } else {
        onChange(trimmedName, trimmedName)
      }
      setNewItemName("")
      setSearchQuery("")
      setShowAddForm(false)
      setIsOpen(false)
    }
  }

  const handleRemove = (id: string) => {
    if (mode === "multiple") {
      onChange(selectedIds.filter((i) => i !== id))
    } else {
      onChange("")
    }
  }

  const getDisplayValue = () => {
    if (mode === "multiple") {
      return selectedOptions.length > 0
        ? `${selectedOptions.length} ${t("combobox.selected")}`
        : placeholder || t("combobox.selectPlaceholder")
    } else {
      const selected = selectedOptions[0]
      return selected ? selected.label : placeholder || t("combobox.selectPlaceholder")
    }
  }

  return (
    <div className={cn("space-y-2", className)} ref={containerRef}>
      {label && <Label>{label}</Label>}

      {/* Выбранные элементы (для multiple) */}
      {mode === "multiple" && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="gap-1">
              {option.label}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => handleRemove(option.id)}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Выпадающий список */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedOptions.length && "text-muted-foreground"
          )}
        >
          <span>{getDisplayValue()}</span>
          <ChevronDown
            className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg">
            {/* Поиск */}
            {searchable && (
              <div className="p-2 border-b">
                <Input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setShowAddForm(false)
                  }}
                  placeholder={t("combobox.searchPlaceholder")}
                  className="h-8"
                />
              </div>
            )}

            {/* Список опций */}
            <div className="max-h-48 overflow-auto p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent",
                      selectedIds.includes(option.id) && "bg-accent"
                    )}
                  >
                    {mode === "multiple" && (
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border",
                          selectedIds.includes(option.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-input"
                        )}
                      >
                        {selectedIds.includes(option.id) && <Check className="h-3 w-3" />}
                      </div>
                    )}
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  {t("combobox.nothingFound")}
                </div>
              )}
            </div>

            {/* Добавление нового */}
            {allowCustom &&
              (!showAddForm ? (
                <div className="border-t p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(true)
                      if (searchQuery.trim() && !exactMatch) {
                        setNewItemName(searchQuery)
                      }
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent"
                  >
                    <Plus className="h-4 w-4" />
                    {searchQuery.trim() && !exactMatch
                      ? t("combobox.addWithName", { name: searchQuery.trim() })
                      : t("combobox.addCustom")}
                  </button>
                </div>
              ) : (
                <div className="border-t p-2 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder={t("combobox.addNewPlaceholder")}
                      className="h-8 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddNew()
                        }
                        if (e.key === "Escape") {
                          setShowAddForm(false)
                          setNewItemName("")
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddNew}
                      disabled={!newItemName.trim()}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
