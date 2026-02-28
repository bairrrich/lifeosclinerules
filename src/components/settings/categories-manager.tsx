"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Tag } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import { CrudManager } from "@/components/shared"
import { useSettings } from "./settings-context"
import { LogType, FinanceType } from "@/types"
import type { Category } from "@/types"

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

  const renderForm = (
    item: Category | null,
    onChange: (updates: Partial<Category>) => void,
    onSave: () => void,
    onCancel: () => void
  ) => {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="sr-only">{t("categories.name")}</Label>
          <Input
            value={item?.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("categories.name")}
          />
        </div>
        <div className="space-y-2">
          <Label className="sr-only">{t("categories.icon")}</Label>
          <Input
            value={item?.icon || ""}
            onChange={(e) => onChange({ icon: e.target.value })}
            placeholder={t("categories.icon")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("categories.financeType")}</Label>
          <NativeSelect
            value={item?.finance_type || FinanceType.EXPENSE}
            onChange={(e) => onChange({ finance_type: e.target.value as FinanceType })}
          >
            {financeTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: Category, onEdit: () => void, onDelete: () => void) => {
    return (
      <div className="flex items-center gap-2">
        {item.icon && <span>{item.icon}</span>}
        <span className="font-medium">{item.name}</span>
        <span className="text-xs text-muted-foreground">
          ({getFinanceTypeLabel(item.finance_type)})
        </span>
      </div>
    )
  }

  return (
    <CrudManager
      title={t("categories.title")}
      description={t("categories.description")}
      icon={Tag}
      items={financeCategories}
      editingItem={editingCategory}
      setEditingItem={setEditingCategory}
      onCreate={createCategory}
      onUpdate={(id: string) => updateCategoryData(id, editingCategory!)}
      onDelete={(id: string) => deleteCategoryData(id)}
      getKey={(item) => item.id}
      renderForm={renderForm}
      renderItem={renderItem}
      emptyMessage={t("categories.noCategories")}
    />
  )
}
