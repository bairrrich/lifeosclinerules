"use client"

import { useTranslations } from "next-intl"
import { Plus, ChevronDown } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { useUnits, useLocalizedUnits } from "@/hooks/use-units"
import {
  ArrayManager,
  FormField,
  NutritionFields as NutritionFieldsComponent,
} from "@/components/shared/forms"
import type { RecipeIngredientItem } from "@/types"

export interface IngredientItem extends Omit<
  RecipeIngredientItem,
  "id" | "recipe_id" | "created_at" | "updated_at"
> {
  id?: string
  isNew?: boolean
  // Пищевая ценность на 100г/мл
  calories_per_100?: number
  protein_per_100?: number
  fat_per_100?: number
  carbs_per_100?: number
  fiber_per_100?: number
}

interface RecipeIngredientsProps {
  ingredients: IngredientItem[]
  onChange: (ingredients: IngredientItem[]) => void
}

interface IngredientFormData {
  ingredient_name: string
  amount: number
  unit: string
  optional: boolean
  note?: string
  calories_per_100?: number
  protein_per_100?: number
  fat_per_100?: number
  carbs_per_100?: number
  fiber_per_100?: number
}

export function RecipeIngredients({ ingredients, onChange }: RecipeIngredientsProps) {
  const t = useTranslations("recipes")
  const { units, isLoading, unitOptions } = useUnits()
  const { getUnitTranslation } = useLocalizedUnits()

  // Фильтруем единицы для рецептов (вес, объём, штуки)
  const recipeUnitOptions = unitOptions.filter(
    (u) => u.type === "weight" || u.type === "volume" || u.type === "count"
  )

  const handleAdd = (): IngredientItem => ({
    id: `temp-${Date.now()}`,
    ingredient_name: "",
    amount: 0,
    unit: "г",
    optional: false,
    order: ingredients.length,
    isNew: true,
  })

  const renderIngredient = (
    ingredient: IngredientItem,
    index: number,
    onUpdate: (field: keyof IngredientItem, value: any) => void
  ) => {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-12 gap-2">
          {/* Название */}
          <div className="col-span-6">
            <Input
              placeholder={t("ingredients.ingredientName")}
              value={ingredient.ingredient_name}
              onChange={(e) => onUpdate("ingredient_name", e.target.value)}
              className="h-9"
            />
          </div>

          {/* Количество */}
          <div className="col-span-2">
            <Input
              type="number"
              min="0"
              placeholder={t("ingredients.amount")}
              value={ingredient.amount || ""}
              onChange={(e) => onUpdate("amount", Math.max(0, parseFloat(e.target.value) || 0))}
              onKeyPress={(e) => {
                if (!/[0-9.]/.test(e.key)) {
                  e.preventDefault()
                }
              }}
              className="h-9"
              step="0.1"
            />
          </div>

          {/* Единица */}
          <div className="col-span-3">
            <Combobox
              options={
                isLoading
                  ? [{ id: ingredient.unit, label: getUnitTranslation(ingredient.unit) }]
                  : recipeUnitOptions.length > 0
                    ? recipeUnitOptions.map((u) => ({
                        id: u.value,
                        label: getUnitTranslation(u.abbreviation),
                      }))
                    : [
                        { id: "г", label: getUnitTranslation("г") },
                        { id: "кг", label: getUnitTranslation("кг") },
                        { id: "мл", label: getUnitTranslation("мл") },
                        { id: "л", label: getUnitTranslation("л") },
                        { id: "шт", label: getUnitTranslation("шт") },
                        { id: "ст.л.", label: getUnitTranslation("ст.л.") },
                        { id: "ч.л.", label: getUnitTranslation("ч.л.") },
                        { id: "стакан", label: getUnitTranslation("стакан") },
                        { id: "по вкусу", label: getUnitTranslation("по вкусу") },
                        { id: "щепотка", label: getUnitTranslation("щепотка") },
                      ]
              }
              value={ingredient.unit}
              onChange={(value) => onUpdate("unit", value as string)}
              allowCustom={true}
              searchable={false}
            />
          </div>

          {/* Удалить - обрабатывается в ArrayManager */}
          <div className="col-span-1" />
        </div>

        {/* КБЖУ на 100г (раскрывающийся блок) */}
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
            <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
            {t("ingredients.nutritionPer100")}
          </summary>
          <div className="grid grid-cols-5 gap-2 mt-2">
            <div>
              <Input
                type="number"
                min="0"
                placeholder={t("ingredients.calories")}
                value={ingredient.calories_per_100 || ""}
                onChange={(e) =>
                  onUpdate("calories_per_100", Math.max(0, parseFloat(e.target.value) || 0))
                }
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                placeholder={t("ingredients.protein")}
                value={ingredient.protein_per_100 || ""}
                onChange={(e) =>
                  onUpdate("protein_per_100", Math.max(0, parseFloat(e.target.value) || 0))
                }
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className="h-8 text-xs"
                step="0.1"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                placeholder={t("ingredients.fat")}
                value={ingredient.fat_per_100 || ""}
                onChange={(e) =>
                  onUpdate("fat_per_100", Math.max(0, parseFloat(e.target.value) || 0))
                }
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className="h-8 text-xs"
                step="0.1"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                placeholder={t("ingredients.carbs")}
                value={ingredient.carbs_per_100 || ""}
                onChange={(e) =>
                  onUpdate("carbs_per_100", Math.max(0, parseFloat(e.target.value) || 0))
                }
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className="h-8 text-xs"
                step="0.1"
              />
            </div>
            <div>
              <Input
                type="number"
                min="0"
                placeholder={t("nutrition.fiber")}
                value={ingredient.fiber_per_100 || ""}
                onChange={(e) =>
                  onUpdate("fiber_per_100", Math.max(0, parseFloat(e.target.value) || 0))
                }
                onKeyPress={(e) => {
                  if (!/[0-9.]/.test(e.key)) {
                    e.preventDefault()
                  }
                }}
                className="h-8 text-xs"
                step="0.1"
              />
            </div>
          </div>
        </details>

        {/* Примечание (опционально) */}
        <Input
          placeholder={t("ingredients.note")}
          value={ingredient.note || ""}
          onChange={(e) => onUpdate("note", e.target.value)}
          className="h-8 text-xs"
        />

        {/* Опционально */}
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={ingredient.optional || false}
            onChange={(e) => onUpdate("optional", e.target.checked)}
            className="rounded"
          />
          {t("ingredients.optional")}
        </label>
      </div>
    )
  }

  return (
    <ArrayManager
      items={ingredients}
      onChange={onChange}
      renderItem={(item, index, onUpdate, onRemove, canMoveUp, canMoveDown) =>
        renderIngredient(item, index, onUpdate)
      }
      onAdd={handleAdd}
      emptyMessage={t("ingredients.empty")}
      addButtonText={t("common.add")}
      showDragHandle={false}
      allowReorder={true}
    />
  )
}
