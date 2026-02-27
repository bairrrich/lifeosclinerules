"use client"

import { ChevronDown } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FoodRecipeMetadata, CourseType, CookingMethod, ServingTemperature } from "@/types"

// ============================================
// Константы
// ============================================

export const courseTypes: { value: CourseType; label: string }[] = [
  { value: "breakfast", label: "Завтрак" },
  { value: "lunch", label: "Обед" },
  { value: "dinner", label: "Ужин" },
  { value: "soup", label: "Суп" },
  { value: "salad", label: "Салат" },
  { value: "dessert", label: "Десерт" },
  { value: "snack", label: "Перекус" },
  { value: "sauce", label: "Соус" },
  { value: "appetizer", label: "Закуска" },
]

export const cookingMethods: { value: CookingMethod; label: string }[] = [
  { value: "bake", label: "Запекать" },
  { value: "fry", label: "Жарить" },
  { value: "boil", label: "Варить" },
  { value: "steam", label: "На пару" },
  { value: "grill", label: "Гриль" },
  { value: "raw", label: "Без обработки" },
  { value: "stew", label: "Тушить" },
  { value: "roast", label: "Обжаривать" },
]

export const servingTemperatures: { value: ServingTemperature; label: string }[] = [
  { value: "hot", label: "Горячее" },
  { value: "warm", label: "Тёплое" },
  { value: "room", label: "Комнатной температуры" },
  { value: "cold", label: "Холодное" },
]

export const cuisines = [
  "Русская",
  "Итальянская",
  "Французская",
  "Японская",
  "Китайская",
  "Корейская",
  "Тайская",
  "Индийская",
  "Мексиканская",
  "Грузинская",
  "Узбекская",
  "Арабская",
  "Средиземноморская",
  "Американская",
  "Другая",
]

export const dietaryOptions = [
  { value: "vegan", label: "Веган" },
  { value: "vegetarian", label: "Вегетарианское" },
  { value: "gluten-free", label: "Без глютена" },
  { value: "keto", label: "Кето" },
  { value: "low-carb", label: "Низкоуглеводное" },
  { value: "dairy-free", label: "Без молока" },
  { value: "nut-free", label: "Без орехов" },
  { value: "diabetic", label: "Диабетическое" },
]

// ============================================
// Интерфейсы
// ============================================

interface FoodRecipeFormProps {
  metadata: FoodRecipeMetadata
  onChange: (metadata: FoodRecipeMetadata) => void
}

// ============================================
// Компонент
// ============================================

export function FoodRecipeForm({ metadata, onChange }: FoodRecipeFormProps) {
  const updateField = <K extends keyof FoodRecipeMetadata>(
    field: K,
    value: FoodRecipeMetadata[K]
  ) => {
    onChange({ ...metadata, [field]: value })
  }

  const toggleCookingMethod = (method: CookingMethod) => {
    const current = metadata.cooking_method || []
    if (current.includes(method)) {
      updateField(
        "cooking_method",
        current.filter((m) => m !== method)
      )
    } else {
      updateField("cooking_method", [...current, method])
    }
  }

  const toggleDietary = (option: string) => {
    const current = metadata.dietary || []
    if (current.includes(option)) {
      updateField(
        "dietary",
        current.filter((d) => d !== option)
      )
    } else {
      updateField("dietary", [...current, option])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Параметры блюда</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тип блюда */}
        <div className="space-y-2">
          <Label>Тип блюда</Label>
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={metadata.course_type || ""}
              onChange={(e) =>
                updateField("course_type", (e.target.value as CourseType) || undefined)
              }
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="" disabled>
                Выберите тип
              </option>
              {courseTypes.map((ct) => (
                <option key={ct.value} value={ct.value}>
                  {ct.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        {/* Кухня */}
        <div className="space-y-2">
          <Label>Кухня</Label>
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={metadata.cuisine || ""}
              onChange={(e) => updateField("cuisine", e.target.value || undefined)}
              style={{
                backgroundImage: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="">Не указана</option>
              {cuisines.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        {/* Метод приготовления */}
        <div className="space-y-2">
          <Label>Способ приготовления</Label>
          <div className="grid grid-cols-4 gap-2">
            {cookingMethods.map((cm) => (
              <button
                key={cm.value}
                type="button"
                onClick={() => toggleCookingMethod(cm.value)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.cooking_method?.includes(cm.value)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Температура подачи */}
        <div className="space-y-2">
          <Label>Температура подачи</Label>
          <div className="grid grid-cols-4 gap-2">
            {servingTemperatures.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => updateField("serving_temperature", st.value)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.serving_temperature === st.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Острота */}
        <div className="space-y-2">
          <Label>Острота</Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 0, label: "Нет" },
              { value: 1, label: "Слабо" },
              { value: 2, label: "Средне" },
              { value: 3, label: "Остро" },
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField("spicy_level", level.value as 0 | 1 | 2 | 3)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.spicy_level === level.value
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Диетические особенности */}
        <div className="space-y-2">
          <Label>Диетические особенности</Label>
          <div className="grid grid-cols-2 gap-2">
            {dietaryOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={metadata.dietary?.includes(opt.value) || false}
                  onChange={() => toggleDietary(opt.value)}
                  className="rounded"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
