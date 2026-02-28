"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Save, Edit2, Trash2 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CrudManagerProps<T extends { id?: string | number }> {
  // Основные настройки
  title: string
  description?: string
  icon?: React.ElementType

  // Данные и состояния
  items: T[]
  editingItem: T | null
  setEditingItem: (item: T | null) => void

  // CRUD операции
  onCreate: (item: T) => Promise<void>
  onUpdate: (id: string, updates: Partial<T>) => Promise<void>
  onDelete: (id: string) => Promise<void>

  // Рендереры
  renderForm: (
    item: T | null,
    onChange: (updates: Partial<T>) => void,
    onSave: () => void,
    onCancel: () => void,
    isCreating?: boolean
  ) => React.ReactNode
  renderItem: (item: T, onEdit: () => void, onDelete: () => void) => React.ReactNode

  // Утилиты
  getKey: (item: T) => string | number
  canDelete?: (item: T) => boolean
  canEdit?: (item: T) => boolean

  // Опции
  showCreateForm?: boolean
  createButtonText?: string
  emptyMessage?: string
  className?: string
  groupBy?: (item: T) => string
  renderGroupHeader?: (groupKey: string, items: T[]) => React.ReactNode
  showActions?: boolean // Показывать кнопки редактирования/удаления
}

/**
 * Универсальный CRUD-менеджер для настроек
 * Заменяет все менеджеры настроек (CategoriesManager, AccountsManager, etc.)
 */
export function CrudManager<T extends { id?: string | number }>({
  title,
  description,
  icon: Icon,
  items,
  editingItem,
  setEditingItem,
  onCreate,
  onUpdate,
  onDelete,
  renderForm,
  renderItem,
  getKey,
  canDelete = () => true,
  canEdit = () => true,
  showCreateForm = true,
  createButtonText,
  emptyMessage,
  className,
  groupBy,
  renderGroupHeader,
  showActions = true,
}: CrudManagerProps<T>) {
  const t = useTranslations("common")
  const tSettings = useTranslations("settings")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    // Создаём пустой объект для формы
    const tempItem = {} as T
    setEditingItem(tempItem)
    setIsCreating(true)
  }

  const handleSaveCreate = async () => {
    if (!editingItem) return
    setIsLoading(true)
    try {
      await onCreate(editingItem)
      setEditingItem(null)
      setIsCreating(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingItem) return
    setIsLoading(true)
    try {
      const id = getKey(editingItem)
      if (id) {
        await onUpdate(String(id), editingItem)
        setEditingItem(null)
        setIsCreating(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm(t("delete"))) {
      setIsLoading(true)
      try {
        await onDelete(id)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Группировка элементов
  const groupedItems = groupBy
    ? items.reduce(
        (acc, item) => {
          const group = groupBy(item)
          if (!acc[group]) acc[group] = []
          acc[group].push(item)
          return acc
        },
        {} as Record<string, T[]>
      )
    : { all: items }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            <div>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </div>
          </div>
          {showCreateForm && !isCreating && (
            <Button size="sm" onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-1" />
              {createButtonText || t("add")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Форма создания/редактирования */}
        {(isCreating || editingItem) && (
          <div className="p-3 rounded-xl border-2 border-dashed space-y-3">
            <div className="text-sm font-medium">
              {isCreating ? tSettings("addItem") : tSettings("editItem")}
            </div>
            {renderForm(
              editingItem,
              (updates: Partial<T>) => setEditingItem({ ...editingItem, ...updates } as T),
              isCreating ? handleSaveCreate : handleUpdate,
              handleCancel,
              isCreating
            )}
          </div>
        )}

        {/* Список элементов */}
        {items.length > 0 ? (
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([groupKey, groupItems]) => {
              if (groupItems.length === 0) return null

              return (
                <div key={groupKey} className="space-y-2">
                  {renderGroupHeader && (
                    <div className="flex items-center gap-2 px-1">
                      {renderGroupHeader(groupKey, groupItems)}
                    </div>
                  )}
                  <div className="space-y-2">
                    {groupItems.map((item) => {
                      const key = getKey(item)
                      const isEditing =
                        editingItem !== null && getKey(editingItem) === key && !isCreating
                      const canItemEdit = canEdit(item)
                      const canItemDelete = canDelete(item)

                      return (
                        <div key={String(key)} className="p-3 rounded-xl bg-muted">
                          {isEditing && canItemEdit ? (
                            <div className="space-y-3">
                              {renderForm(
                                editingItem,
                                (updates: Partial<T>) =>
                                  setEditingItem({ ...editingItem, ...updates } as T),
                                handleUpdate,
                                handleCancel,
                                false
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {renderItem(
                                  item,
                                  () => setEditingItem(item),
                                  () => handleDelete(String(key))
                                )}
                              </div>
                              {showActions && canItemEdit && (
                                <div className="flex gap-1 ml-4">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingItem(item)}
                                    aria-label={t("edit")}
                                    disabled={isLoading}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  {canItemDelete && (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => handleDelete(String(key))}
                                      aria-label={t("delete")}
                                      disabled={isLoading}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage || tSettings("noItems")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
