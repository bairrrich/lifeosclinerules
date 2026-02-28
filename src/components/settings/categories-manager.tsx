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
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("categories.name")}</Label>
            <Input
              value={item?.name || ""}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={t("categories.name")}
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
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label className="sr-only">{t("categories.icon")}</Label>
            <Input
              value={item?.icon || ""}
              onChange={(e) => onChange({ icon: e.target.value })}
              placeholder={t("categories.icon")}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="action-sm" onClick={onSave}>
              {tCommon("save")}
            </Button>
            <Button size="action-sm" variant="outline" onClick={onCancel}>
              {tCommon("cancel")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderItem = (item: Category, onEdit: () => void, onDelete: () => void) => {
    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {item.icon && <span>{item.icon}</span>}
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {getFinanceTypeLabel(item.finance_type)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <span className="sr-only">Редактировать</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
          >
            <span className="sr-only">Удалить</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </div>
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
      showActions={false}
    />
  )
}
