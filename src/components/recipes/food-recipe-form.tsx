"use client"

import { useTranslations } from "next-intl"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { recipeColors } from "@/lib/theme-colors"
import type { FoodRecipeMetadata, CourseType, CookingMethod, ServingTemperature } from "@/types"

// ============================================
// Функции для получения локализованных конфигураций
// ============================================

export function getCourseTypes(t: any) {
  return [
    { value: "breakfast", label: t("courseTypes.breakfast") },
    { value: "lunch", label: t("courseTypes.lunch") },
    { value: "dinner", label: t("courseTypes.dinner") },
    { value: "soup", label: t("courseTypes.soup") },
    { value: "salad", label: t("courseTypes.salad") },
    { value: "dessert", label: t("courseTypes.dessert") },
    { value: "snack", label: t("courseTypes.snack") },
    { value: "sauce", label: t("courseTypes.sauce") },
    { value: "appetizer", label: t("courseTypes.appetizer") },
  ]
}

export function getCookingMethods(t: any) {
  return [
    { value: "bake" as CookingMethod, label: t("cookingMethods.bake") },
    { value: "fry" as CookingMethod, label: t("cookingMethods.fry") },
    { value: "boil" as CookingMethod, label: t("cookingMethods.boil") },
    { value: "steam" as CookingMethod, label: t("cookingMethods.steam") },
    { value: "grill" as CookingMethod, label: t("cookingMethods.grill") },
    { value: "raw" as CookingMethod, label: t("cookingMethods.raw") },
    { value: "stew" as CookingMethod, label: t("cookingMethods.stew") },
    { value: "roast" as CookingMethod, label: t("cookingMethods.roast") },
  ]
}

export function getServingTemperatures(t: any) {
  return [
    { value: "hot" as ServingTemperature, label: t("servingTemperatures.hot") },
    { value: "warm" as ServingTemperature, label: t("servingTemperatures.warm") },
    { value: "room" as ServingTemperature, label: t("servingTemperatures.room") },
    { value: "cold" as ServingTemperature, label: t("servingTemperatures.cold") },
  ]
}

export function getCuisines(t: any) {
  return [
    t("cuisines.russian"),
    t("cuisines.italian"),
    t("cuisines.french"),
    t("cuisines.japanese"),
    t("cuisines.chinese"),
    t("cuisines.korean"),
    t("cuisines.thai"),
    t("cuisines.indian"),
    t("cuisines.mexican"),
    t("cuisines.georgian"),
    t("cuisines.uzbek"),
    t("cuisines.arabic"),
    t("cuisines.mediterranean"),
    t("cuisines.american"),
    t("cuisines.other"),
  ]
}

export function getDietaryOptions(t: any) {
  return [
    { value: "vegan", label: t("dietaryOptions.vegan") },
    { value: "vegetarian", label: t("dietaryOptions.vegetarian") },
    { value: "gluten-free", label: t("dietaryOptions.glutenFree") },
    { value: "keto", label: t("dietaryOptions.keto") },
    { value: "low-carb", label: t("dietaryOptions.lowCarb") },
    { value: "dairy-free", label: t("dietaryOptions.dairyFree") },
    { value: "nut-free", label: t("dietaryOptions.nutFree") },
    { value: "diabetic", label: t("dietaryOptions.diabetic") },
  ]
}

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
  const t = useTranslations("recipes")

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
        <CardTitle className="text-base">{t("forms.dishParameters")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тип блюда и Кухня */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("fields.courseType")}</Label>
            <Combobox
              options={getCourseTypes(t).map((ct) => ({ id: ct.value, label: ct.label }))}
              value={metadata.course_type || ""}
              onChange={(value) => updateField("course_type", (value as CourseType) || undefined)}
              placeholder={t("forms.selectPlaceholder")}
              allowCustom={false}
              searchable={false}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.cuisine")}</Label>
            <Combobox
              options={getCuisines(t).map((c) => ({ id: c, label: c }))}
              value={metadata.cuisine || ""}
              onChange={(value) => updateField("cuisine", (value as string) || undefined)}
              placeholder={t("forms.notSpecified")}
              allowCustom={false}
              searchable={false}
            />
          </div>
        </div>

        {/* Метод приготовления */}
        <div className="space-y-2">
          <Label>{t("fields.cookingMethod")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {getCookingMethods(t).map((cm) => (
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
          <Label>{t("fields.servingTemperature")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {getServingTemperatures(t).map((st) => (
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
          <Label>{t("fields.spicyLevel")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 0, label: t("spicyLevels.none") },
              { value: 1, label: t("spicyLevels.mild") },
              { value: 2, label: t("spicyLevels.medium") },
              { value: 3, label: t("spicyLevels.hot") },
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => updateField("spicy_level", level.value as 0 | 1 | 2 | 3)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.spicy_level === level.value
                    ? recipeColors.food.DEFAULT
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
          <Label>{t("fields.dietary")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {getDietaryOptions(t).map((opt) => (
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
