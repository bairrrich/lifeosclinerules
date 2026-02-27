"use client"

import { useState } from "react"
import { ChevronDown, Plus, X } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { CocktailRecipeMetadata, CocktailMethod, GlassType, IceType } from "@/types"

// ============================================
// Константы
// ============================================

export const cocktailMethods: { value: CocktailMethod; label: string; description: string }[] = [
  { value: "shaken", label: "Шейк", description: "Взбить в шейкере со льдом" },
  { value: "stirred", label: "Стир", description: "Размешать в смесительном стакане" },
  { value: "blended", label: "Бленд", description: "Смешать в блендере" },
  { value: "built", label: "Билд", description: "Собрать прямо в бокале" },
  { value: "muddled", label: "Мадл", description: "Помять ингредиенты мадлером" },
  { value: "layered", label: "Слоями", description: "Уложить слоями" },
]

export const glassTypes: { value: GlassType; label: string }[] = [
  { value: "highball", label: "Хайбол" },
  { value: "lowball", label: "Лоуболл (Рокс)" },
  { value: "martini", label: "Мартини (Коктейльная рюмка)" },
  { value: "coupe", label: "Купе (Купет)" },
  { value: "margarita", label: "Маргарита" },
  { value: "hurricane", label: "Ураган" },
  { value: "shot", label: "Шот" },
  { value: "wine", label: "Бокал для вина" },
  { value: "champagne", label: "Флюте (Шампанское)" },
  { value: "mug", label: "Кружка" },
  { value: "collins", label: "Коллинз" },
  { value: "rocks", label: "Олд-фешн" },
]

export const iceTypes: { value: IceType; label: string }[] = [
  { value: "cubed", label: "Кубики" },
  { value: "crushed", label: "Дроблёный" },
  { value: "sphere", label: "Сфера" },
  { value: "none", label: "Без льда" },
]

export const baseSpirits = [
  "Водка",
  "Джин",
  "Ром белый",
  "Ром тёмный",
  "Текила",
  "Виски",
  "Бурбон",
  "Коньяк",
  "Бренди",
  "Ликёр",
  "Абсент",
  "Другое",
]

export const ibaCategories = [
  "The Unforgettables",
  "Contemporary Classics",
  "New Era Drinks",
  "Текила",
  "Водка",
  "Джин",
  "Ром",
  "Виски",
  "Бренди",
  "Ликёр",
]

export const cocktailTools = [
  "Шейкер",
  "Шейкер Бостон",
  "Джиггер",
  "Мадлер",
  "Барная ложка",
  "Стрейнер",
  "Фильтр Хоторн",
  "Сайзер",
  "Пестик",
  "Конус",
  "Другое",
]

export const garnishOptions = [
  "Лимон",
  "Лайм",
  "Апельсин",
  "Грейпфрут",
  "Мята",
  "Базилик",
  "Оливки",
  "Вишня",
  "Ананас",
  "Клубника",
  "Сахарный ободок",
  "Соль",
  "Цедра лимона",
  "Цедра апельсина",
  "Огурец",
  "Другое",
]

// ============================================
// Интерфейсы
// ============================================

interface CocktailRecipeFormProps {
  metadata: CocktailRecipeMetadata
  onChange: (metadata: CocktailRecipeMetadata) => void
}

// ============================================
// Компонент
// ============================================

export function CocktailRecipeForm({ metadata, onChange }: CocktailRecipeFormProps) {
  const updateField = <K extends keyof CocktailRecipeMetadata>(
    field: K,
    value: CocktailRecipeMetadata[K]
  ) => {
    onChange({ ...metadata, [field]: value })
  }

  const toggleArrayItem = (field: "garnish" | "tools", item: string) => {
    const current = metadata[field] || []
    if (current.includes(item)) {
      updateField(
        field,
        current.filter((i) => i !== item)
      )
    } else {
      updateField(field, [...current, item])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Параметры коктейля</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Алкогольный / Безалкогольный */}
        <div className="space-y-2">
          <Label>Тип</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField("is_alcoholic", true)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                metadata.is_alcoholic
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              🍸 Алкогольный
            </button>
            <button
              type="button"
              onClick={() => updateField("is_alcoholic", false)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                !metadata.is_alcoholic
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              🍹 Безалкогольный
            </button>
          </div>
        </div>

        {/* Крепость (если алкогольный) */}
        {metadata.is_alcoholic && (
          <>
            <div className="space-y-2">
              <Label htmlFor="alcohol_percent">Крепость (%)</Label>
              <Input
                id="alcohol_percent"
                type="number"
                placeholder="12"
                min={0}
                max={80}
                value={metadata.alcohol_percent || ""}
                onChange={(e) =>
                  updateField("alcohol_percent", parseFloat(e.target.value) || undefined)
                }
              />
            </div>

            {/* Базовый спирт */}
            <div className="space-y-2">
              <Label>Базовый спирт</Label>
              <div className="relative">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={metadata.base_spirit || ""}
                  onChange={(e) => updateField("base_spirit", e.target.value || undefined)}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  }}
                >
                  <option value="">Не указан</option>
                  {baseSpirits.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
              </div>
            </div>

            {/* IBA категория */}
            <div className="space-y-2">
              <Label>Категория IBA</Label>
              <div className="relative">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={metadata.iba_category || ""}
                  onChange={(e) => updateField("iba_category", e.target.value || undefined)}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  }}
                >
                  <option value="">Не указана</option>
                  {ibaCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
              </div>
            </div>
          </>
        )}

        {/* Метод приготовления */}
        <div className="space-y-2">
          <Label>Метод приготовления</Label>
          <div className="grid grid-cols-3 gap-2">
            {cocktailMethods.map((cm) => (
              <button
                key={cm.value}
                type="button"
                onClick={() => updateField("cocktail_method", cm.value)}
                className={`px-2 py-2 text-xs rounded-lg border transition-colors ${
                  metadata.cocktail_method === cm.value
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-background hover:bg-accent"
                }`}
                title={cm.description}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Бокал */}
        <div className="space-y-2">
          <Label>Тип бокала</Label>
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={metadata.glass_type || ""}
              onChange={(e) =>
                updateField("glass_type", (e.target.value as GlassType) || undefined)
              }
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="">Не указан</option>
              {glassTypes.map((gt) => (
                <option key={gt.value} value={gt.value}>
                  {gt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        {/* Тип льда */}
        <div className="space-y-2">
          <Label>Лёд</Label>
          <div className="grid grid-cols-4 gap-2">
            {iceTypes.map((it) => (
              <button
                key={it.value}
                type="button"
                onClick={() => updateField("ice_type", it.value)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.ice_type === it.value
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div className="space-y-2">
          <Label htmlFor="color">Цвет напитка</Label>
          <Input
            id="color"
            placeholder="Оранжевый, Золотистый..."
            value={metadata.color || ""}
            onChange={(e) => updateField("color", e.target.value || undefined)}
          />
        </div>

        {/* Гарнир */}
        <div className="space-y-2">
          <Label>Гарнир / Украшение</Label>
          <div className="grid grid-cols-4 gap-2">
            {garnishOptions.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleArrayItem("garnish", g)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.garnish?.includes(g)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Инструменты */}
        <div className="space-y-2">
          <Label>Инструменты</Label>
          <div className="grid grid-cols-3 gap-2">
            {cocktailTools.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleArrayItem("tools", t)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.tools?.includes(t)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
