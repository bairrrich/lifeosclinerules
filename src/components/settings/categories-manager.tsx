"use client"

import { useState } from "react"
import { Tag, Plus, Save, Edit2, Trash2 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSettings, logTypeLabels } from "./settings-context"
import { LogType } from "@/types"
import type { Category } from "@/types"

export function CategoriesManager() {
  const {
    categories,
    editingCategory,
    setEditingCategory,
    createCategory,
    updateCategoryData,
    deleteCategoryData,
  } = useSettings()

  const [newCategory, setNewCategory] = useState({
    name: "",
    type: LogType.FOOD,
    icon: "",
  })
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return
    await createCategory({
      name: newCategory.name,
      type: newCategory.type,
      icon: newCategory.icon || undefined,
    })
    setNewCategory({ name: "", type: LogType.FOOD, icon: "" })
  }

  const handleUpdate = async () => {
    if (!editingCategory) return
    await updateCategoryData(editingCategory.id, {
      name: editingCategory.name,
      type: editingCategory.type,
      icon: editingCategory.icon || undefined,
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Удалить категорию?")) {
      await deleteCategoryData(id)
    }
  }

  const filteredCategories =
    categoryFilter === "all" ? categories : categories.filter((c) => c.type === categoryFilter)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Категории
        </CardTitle>
        <CardDescription>Категории для записей учёта</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Фильтр */}
        <div className="flex gap-1 flex-wrap">
          <Button
            size="sm"
            variant={categoryFilter === "all" ? "default" : "outline"}
            onClick={() => setCategoryFilter("all")}
          >
            Все
          </Button>
          {Object.entries(logTypeLabels).map(([type, { label, icon: Icon }]) => (
            <Button
              key={type}
              size="sm"
              variant={categoryFilter === type ? "default" : "outline"}
              onClick={() => setCategoryFilter(type)}
              className="flex items-center gap-1"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Button>
          ))}
        </div>

        {/* Список категорий */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const typeInfo = logTypeLabels[category.type]
              return (
                <div key={category.id} className="p-3 rounded-xl bg-muted">
                  {editingCategory?.id === category.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor={`edit-cat-name-${category.id}`} className="sr-only">
                            Название
                          </Label>
                          <Input
                            id={`edit-cat-name-${category.id}`}
                            value={editingCategory.name}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, name: e.target.value })
                            }
                            placeholder="Название"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`edit-cat-type-${category.id}`} className="sr-only">
                            Тип
                          </Label>
                          <select
                            id={`edit-cat-type-${category.id}`}
                            className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            value={editingCategory.type}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                type: e.target.value as LogType,
                              })
                            }
                          >
                            {Object.entries(logTypeLabels).map(([type, { label }]) => (
                              <option key={type} value={type}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-cat-icon-${category.id}`} className="sr-only">
                          Иконка
                        </Label>
                        <Input
                          id={`edit-cat-icon-${category.id}`}
                          value={editingCategory.icon || ""}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, icon: e.target.value })
                          }
                          placeholder="Иконка (emoji)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleUpdate}>
                          <Save className="h-4 w-4 mr-1" />
                          Сохранить
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCategory(null)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {category.icon && <span>{category.icon}</span>}
                        <span className="font-medium">{category.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({typeInfo?.label || category.type})
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingCategory(category)}
                          aria-label="Редактировать"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(category.id)}
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">Нет категорий</div>
        )}

        {/* Форма добавления */}
        <div className="p-3 rounded-xl border-2 border-dashed space-y-3">
          <div className="text-sm font-medium">Добавить категорию</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="new-cat-name" className="sr-only">
                Название
              </Label>
              <Input
                id="new-cat-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Название"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-cat-type" className="sr-only">
                Тип
              </Label>
              <select
                id="new-cat-type"
                className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                value={newCategory.type}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, type: e.target.value as LogType })
                }
              >
                {Object.entries(logTypeLabels).map(([type, { label }]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="new-cat-icon" className="sr-only">
              Иконка
            </Label>
            <Input
              id="new-cat-icon"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              placeholder="Иконка (emoji, опционально)"
            />
          </div>
          <Button onClick={handleCreate} disabled={!newCategory.name.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
