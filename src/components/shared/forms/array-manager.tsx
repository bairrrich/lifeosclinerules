"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ArrayManagerItemProps<T> {
  item: T
  index: number
  onUpdate: (field: keyof T, value: any) => void
  onRemove: () => void
  onMove?: (direction: "up" | "down") => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export interface ArrayManagerProps<T extends { id?: string | number | null }> {
  items: T[]
  onChange: (items: T[]) => void
  renderItem: (
    item: T,
    index: number,
    onUpdate: (field: keyof T, value: any) => void,
    onRemove: () => void,
    canMoveUp: boolean,
    canMoveDown: boolean
  ) => React.ReactNode
  onAdd: () => T
  emptyMessage?: string
  addButtonText?: string
  showDragHandle?: boolean
  allowReorder?: boolean
  className?: string
}

/**
 * Универсальный менеджер массивов элементов
 * Используется для редактируемых списков: шаги рецептов, ингредиенты, цитаты и т.п.
 */
export function ArrayManager<T extends { id?: string | number | null }>({
  items,
  onChange,
  renderItem,
  onAdd,
  emptyMessage,
  addButtonText,
  showDragHandle = false,
  allowReorder = true,
  className,
}: ArrayManagerProps<T>) {
  const t = useTranslations("common")

  const handleUpdate = (index: number, field: keyof T, value: any) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    if (!allowReorder) return
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= items.length) return

    const updated = [...items]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp
    onChange(updated)
  }

  const handleAdd = () => {
    const newItem = onAdd()
    onChange([...items, newItem])
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {items.length > 0 ? `${items.length} ${t("items")}` : emptyMessage || t("noItems")}
          </CardTitle>
          <Button type="button" size="action-sm" variant="outline" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            {addButtonText || t("add")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {emptyMessage || t("noItems")}
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id || index} className="flex gap-2 p-3 rounded-lg bg-muted/30 border">
              {showDragHandle && allowReorder && (
                <div className="flex flex-col items-center gap-0.5 pt-2">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={!allowReorder || index === 0}
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <div className="h-3 w-3" />
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={!allowReorder || index === items.length - 1}
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex-1">
                {renderItem(
                  item,
                  index,
                  (field, value) => handleUpdate(index, field, value),
                  () => handleRemove(index),
                  index > 0,
                  index < items.length - 1
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => handleRemove(index)}
                aria-label={t("remove")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
