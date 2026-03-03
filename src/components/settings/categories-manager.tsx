"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Tag } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CrudManager } from "@/components/shared"
import { useSettings } from "./settings-context"
import { LogType, FinanceType } from "@/types"
import type { Category } from "@/types"

// Предустановленные emoji для категорий
const CATEGORY_EMOJIS = [
  "💰",
  "💳",
  "💵",
  "💸",
  "🏦",
  "📊",
  "🧾",
  "💹",
  "🍔",
  "🍕",
  "🍜",
  "☕",
  "🍰",
  "🍎",
  "🥗",
  "🍷",
  "🚗",
  "⛽",
  "🚌",
  "🚕",
  "✈️",
  "🚆",
  "🚲",
  "💊",
  "🏥",
  "💪",
  "🧘",
  "😴",
  "🦷",
  "👁️",
  "🏠",
  "🛋️",
  "🛏️",
  "🚿",
  "💡",
  "🧹",
  "🌡️",
  "💼",
  "💻",
  "📱",
  "📧",
  "📅",
  "📝",
  "✏️",
  "🛒",
  "🛍️",
  "🎁",
  "👕",
  "👟",
  "💄",
  "🎬",
  "🎮",
  "📚",
  "🎵",
  "⚽",
  "🎨",
  "🎭",
  "📖",
  "🎓",
  "🔬",
  "🖥️",
  "🐕",
  "🐈",
  "🐠",
  "🦜",
  "🐰",
  "🌞",
  "🌙",
  "⭐",
  "🌈",
  "🌸",
  "🌲",
  "🔥",
  "❤️",
  "✨",
  "🎯",
  "🔔",
  "📌",
  "🏷️",
  "📦",
  "🔧",
]

// Маппинг старых иконок lucide-react на emoji
const ICON_TO_EMOJI: Record<string, string> = {
  wallet: "💰",
  "credit-card": "💳",
  landmark: "🏦",
  "trending-up": "📈",
  "line-chart": "📊",
  bitcoin: "₿",
  utensils: "🍴",
  "utensils-crossed": "🍴",
  coffee: "☕",
  apple: "🍎",
  carrot: "🥕",
  dumbbell: "💪",
  heart: "❤️",
  activity: "🏃",
  home: "🏠",
  car: "🚗",
  bus: "🚌",
  plane: "✈️",
  shopping: "🛒",
  gift: "🎁",
  book: "📖",
  music: "🎵",
  film: "🎬",
  gamepad: "🎮",
  tag: "🏷️",
  star: "⭐",
  moon: "🌙",
  sun: "☀️",
  cloud: "☁️",
  droplet: "💧",
  flame: "🔥",
}

// Получить emoji для категории (конвертирует старые иконки в emoji)
function getCategoryEmoji(icon?: string): string {
  if (!icon) return "🏷️"
  // Если это emoji (один символ или суррогатная пара)
  if (icon.length <= 2 && /[\p{Emoji}]/u.test(icon)) {
    return icon
  }
  // Если это название иконки lucide-react, конвертируем
  return ICON_TO_EMOJI[icon] || "🏷️"
}

// Компонент выбора emoji
function EmojiPicker({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const displayIcon = getCategoryEmoji(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-10 h-10 p-0"
          aria-label="Выбрать emoji"
        >
          <span className="text-xl">{displayIcon}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
          {CATEGORY_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="flex items-center justify-center w-9 h-9 rounded-md text-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => {
                onChange(emoji)
                setOpen(false)
              }}
              aria-label={`Выбрать ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={() => onChange("")}
          >
            Удалить emoji
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}

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
    { id: FinanceType.INCOME, label: t("categories.financeTypes.income") },
    { id: FinanceType.EXPENSE, label: t("categories.financeTypes.expense") },
    { id: FinanceType.TRANSFER, label: t("categories.financeTypes.transfer") },
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
        <div className="flex items-center gap-2">
          <EmojiPicker value={item?.icon} onChange={(icon) => onChange({ icon })} />
          <Input
            value={item?.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("categories.name")}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Combobox
            options={financeTypeOptions}
            value={item?.finance_type || FinanceType.EXPENSE}
            onChange={(value) => onChange({ finance_type: value as FinanceType })}
            placeholder={t("categories.financeTypes.select")}
            allowCustom={false}
            className="w-32 mr-auto"
          />
          <Button size="action-sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="action-sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t("categories.iconHelp")}</p>
      </div>
    )
  }

  const renderItem = (item: Category, onEdit: () => void, onDelete: () => void) => {
    const displayIcon = getCategoryEmoji(item.icon)

    return (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xl">{displayIcon}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{item.name}</span>
            <span className="text-xs text-muted-foreground">
              {getFinanceTypeLabel(item.finance_type)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <span className="sr-only">{tCommon("edit")}</span>
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
            <span className="sr-only">{tCommon("delete")}</span>
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
