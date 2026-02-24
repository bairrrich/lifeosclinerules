"use client"

import { useState } from "react"
import { Plus, X, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { RecipeIngredientItem } from "@/types"

// Часто используемые единицы измерения
const commonUnits = [
  { value: "г", label: "грамм" },
  { value: "кг", label: "килограмм" },
  { value: "мл", label: "миллилитр" },
  { value: "л", label: "литр" },
  { value: "шт", label: "штука" },
  { value: "ст.л.", label: "столовая ложка" },
  { value: "ч.л.", label: "чайная ложка" },
  { value: "стакан", label: "стакан" },
  { value: "зубч.", label: "зубчик" },
  { value: "по вкусу", label: "по вкусу" },
  { value: "щепотка", label: "щепотка" },
  { value: "мл", label: "мл (бар)" },
  { value: "oz", label: "унция" },
  { value: "dash", label: "деш" },
  { value: "drop", label: "капля" },
]

export interface IngredientItem extends Omit<RecipeIngredientItem, 'id' | 'recipe_id' | 'created_at' | 'updated_at'> {
  id?: string
  isNew?: boolean
}

interface RecipeIngredientsProps {
  ingredients: IngredientItem[]
  onChange: (ingredients: IngredientItem[]) => void
}

export function RecipeIngredients({ ingredients, onChange }: RecipeIngredientsProps) {
  const addIngredient = () => {
    const newIngredient: IngredientItem = {
      id: `temp-${Date.now()}`,
      ingredient_name: "",
      amount: 0,
      unit: "г",
      optional: false,
      order: ingredients.length,
      isNew: true,
    }
    onChange([...ingredients, newIngredient])
  }

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof IngredientItem, value: string | number | boolean) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Ингредиенты</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {ingredients.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Нет ингредиентов. Нажмите "Добавить" для создания.
          </div>
        ) : (
          ingredients.map((ingredient, index) => (
            <div key={ingredient.id || index} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-12 gap-2">
                  {/* Название */}
                  <div className="col-span-6">
                    <Input
                      placeholder="Название"
                      value={ingredient.ingredient_name}
                      onChange={(e) => updateIngredient(index, "ingredient_name", e.target.value)}
                      className="h-9"
                    />
                  </div>
                  
                  {/* Количество */}
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Кол-во"
                      value={ingredient.amount || ""}
                      onChange={(e) => updateIngredient(index, "amount", parseFloat(e.target.value) || 0)}
                      className="h-9"
                      step="0.1"
                    />
                  </div>
                  
                  {/* Единица */}
                  <div className="col-span-3 relative">
                    <select
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      style={{
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                    >
                      {commonUnits.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.value}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  </div>
                  
                  {/* Удалить */}
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => removeIngredient(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Примечание (опционально) */}
                <Input
                  placeholder="Примечание (свежий, мелко нарезать...)"
                  value={ingredient.note || ""}
                  onChange={(e) => updateIngredient(index, "note", e.target.value)}
                  className="h-8 text-xs"
                />
                
                {/* Опционально */}
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={ingredient.optional || false}
                    onChange={(e) => updateIngredient(index, "optional", e.target.checked)}
                    className="rounded"
                  />
                  Опционально
                </label>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}