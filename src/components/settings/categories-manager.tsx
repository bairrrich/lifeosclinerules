"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Tag, Plus, Save, Edit2, Trash2 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { useSettings } from "./settings-context"
import { LogType, FinanceType } from "@/types"

export function CategoriesManager() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
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
    icon: "",
    finance_type: FinanceType.EXPENSE,
  })

  // Опции для выпадающего списка
  const financeTypeOptions = [
    { value: FinanceType.INCOME, label: t("categories.financeTypes.income") },
    { value: FinanceType.EXPENSE, label: t("categories.financeTypes.expense") },
    { value: FinanceType.TRANSFER, label: t("categories.financeTypes.transfer") },
  ]

  // Фильтруем только финансовые категории
  const financeCategories = categories.filter((c) => c.type === LogType.FINANCE)

  // Получить отображаемое имя типа
  const getFinanceTypeLabel = (type?: FinanceType) => {
    switch (type) {
      case FinanceType.INCOME:
        return t("categories.financeTypes.income")
      case FinanceType.EXPENSE:
        return t("categories.financeTypes.expense")
      case FinanceType.TRANSFER:
        return t("categories.financeTypes.transfer")
      default:
        return "-"
    }
  }

  const handleCreate = async () => {
    if (!newCategory.name.trim()) return
    await createCategory({
      name: newCategory.name,
      type: LogType.FINANCE,
      icon: newCategory.icon || undefined,
      finance_type: newCategory.finance_type,
    })
    setNewCategory({ name: "", icon: "", finance_type: FinanceType.EXPENSE })
  }

  const handleUpdate = async () => {
    if (!editingCategory) return
    await updateCategoryData(editingCategory.id, {
      name: editingCategory.name,
      type: LogType.FINANCE,
      icon: editingCategory.icon || undefined,
      finance_type: editingCategory.finance_type,
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm(tCommon("delete"))) {
      await deleteCategoryData(id)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {t("categories.title")}
        </CardTitle>
        <CardDescription>{t("categories.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список категорий */}
        {financeCategories.length > 0 ? (
          <div className="space-y-2">
            {financeCategories.map((category) => (
              <div key={category.id} className="p-3 rounded-xl bg-muted">
                {editingCategory?.id === category.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor={`edit-cat-name-${category.id}`} className="sr-only">
                          {t("categories.name")}
                        </Label>
                        <Input
                          id={`edit-cat-name-${category.id}`}
                          value={editingCategory.name}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, name: e.target.value })
                          }
                          placeholder={t("categories.name")}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-cat-icon-${category.id}`} className="sr-only">
                          {t("categories.icon")}
                        </Label>
                        <Input
                          id={`edit-cat-icon-${category.id}`}
                          value={editingCategory.icon || ""}
                          onChange={(e) =>
                            setEditingCategory({ ...editingCategory, icon: e.target.value })
                          }
                          placeholder={t("categories.icon")}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`edit-cat-type-${category.id}`}>
                          {t("categories.financeType")}
                        </Label>
                        <NativeSelect
                          id={`edit-cat-type-${category.id}`}
                          value={editingCategory.finance_type || ""}
                          onChange={(e) =>
                            setEditingCategory({
                              ...editingCategory,
                              finance_type: e.target.value as FinanceType,
                            })
                          }
                        >
                          {financeTypeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </NativeSelect>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate}>
                        <Save className="h-4 w-4 mr-1" />
                        {tCommon("save")}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)}>
                        {tCommon("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      <span className="font-medium">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({getFinanceTypeLabel(category.finance_type)})
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingCategory(category)}
                        aria-label={tCommon("edit")}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        aria-label={tCommon("delete")}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {t("categories.noCategories")}
          </div>
        )}

        {/* Форма добавления */}
        <div className="p-3 rounded-xl border-2 border-dashed space-y-3">
          <div className="text-sm font-medium">{t("categories.addCategory")}</div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="new-cat-name" className="sr-only">
                {t("categories.name")}
              </Label>
              <Input
                id="new-cat-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder={t("categories.name")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-cat-icon" className="sr-only">
                {t("categories.icon")}
              </Label>
              <Input
                id="new-cat-icon"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                placeholder={t("categories.icon")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-cat-type">{t("categories.financeType")}</Label>
              <NativeSelect
                id="new-cat-type"
                value={newCategory.finance_type}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    finance_type: e.target.value as FinanceType,
                  })
                }
              >
                {financeTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={!newCategory.name.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            {tCommon("add")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
