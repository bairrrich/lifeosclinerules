"use client"

import { Plus, X, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUnits } from "@/hooks/use-units"
import type { RecipeIngredientItem } from "@/types"

export interface IngredientItem extends Omit<RecipeIngredientItem, 'id' | 'recipe_id' | 'created_at' | 'updated_at'> {
  id?: string
  isNew?: boolean
  // Пищевая ценность на 100г/мл
  calories_per_100?: number
  protein_per_100?: number
  fat_per_100?: number
  carbs_per_100?: number
}

interface RecipeIngredientsProps {
  ingredients: IngredientItem[]
  onChange: (ingredients: IngredientItem[]) => void
}

export function RecipeIngredients({ ingredients, onChange }: RecipeIngredientsProps) {
  const { units, isLoading, unitOptions } = useUnits()

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

  // Фильтруем единицы для рецептов (вес, объём, штуки)
  const recipeUnitOptions = unitOptions.filter(
    u => u.type === "weight" || u.type === "volume" || u.type === "count"
  )

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
            Нет ингредиентов. Нажмите &laquo;Добавить&raquo; для создания.
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
                      {isLoading ? (
                        <option value={ingredient.unit}>{ingredient.unit}</option>
                      ) : recipeUnitOptions.length > 0 ? (
                        recipeUnitOptions.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.abbreviation}
                          </option>
                        ))
                      ) : (
                        // Fallback если БД пуста
                        <>
                          <option value="г">г</option>
                          <option value="кг">кг</option>
                          <option value="мл">мл</option>
                          <option value="л">л</option>
                          <option value="шт">шт</option>
                          <option value="ст.л.">ст.л.</option>
                          <option value="ч.л.">ч.л.</option>
                          <option value="стакан">стакан</option>
                          <option value="по вкусу">по вкусу</option>
                          <option value="щепотка">щепотка</option>
                        </>
                      )}
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
                
                {/* КБЖУ на 100г (раскрывающийся блок) */}
                <details className="group">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
                    <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                    Пищевая ценность на 100г
                  </summary>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <div>
                      <Input
                        type="number"
                        placeholder="Ккал"
                        value={ingredient.calories_per_100 || ""}
                        onChange={(e) => updateIngredient(index, "calories_per_100", parseFloat(e.target.value) || undefined)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Белки"
                        value={ingredient.protein_per_100 || ""}
                        onChange={(e) => updateIngredient(index, "protein_per_100", parseFloat(e.target.value) || undefined)}
                        className="h-8 text-xs"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Жиры"
                        value={ingredient.fat_per_100 || ""}
                        onChange={(e) => updateIngredient(index, "fat_per_100", parseFloat(e.target.value) || undefined)}
                        className="h-8 text-xs"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Угл."
                        value={ingredient.carbs_per_100 || ""}
                        onChange={(e) => updateIngredient(index, "carbs_per_100", parseFloat(e.target.value) || undefined)}
                        className="h-8 text-xs"
                        step="0.1"
                      />
                    </div>
                  </div>
                </details>
                
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