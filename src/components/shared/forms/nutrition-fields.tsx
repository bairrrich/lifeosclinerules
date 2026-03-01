"use client"

import { UseFormRegister } from "react-hook-form"
import { useTranslations } from "next-intl"
import { FormField } from "./form-field"
import { Input } from "@/components/ui/input"

export interface NutritionFieldsProps {
  register: UseFormRegister<any>
  errors: Record<string, { message?: string }>
  labels?: {
    calories?: string
    protein?: string
    fat?: string
    carbs?: string
  }
  prefixes?: {
    calories?: string
    protein?: string
    fat?: string
    carbs?: string
  }
}

/**
 * Универсальный компонент полей КБЖУ (калории, белки, жиры, углеводы)
 * Используется в формах еды, рецептов и других пищевых продуктах
 */
export function NutritionFields({ register, errors, labels, prefixes }: NutritionFieldsProps) {
  const t = useTranslations("logs")

  const defaultLabels = {
    calories: labels?.calories || t("food.calories"),
    protein: labels?.protein || t("food.protein"),
    fat: labels?.fat || t("food.fat"),
    carbs: labels?.carbs || t("food.carbs"),
  }

  const defaultPrefixes = {
    calories: prefixes?.calories || "",
    protein: prefixes?.protein || t("common.grams"),
    fat: prefixes?.fat || t("common.grams"),
    carbs: prefixes?.carbs || t("common.grams"),
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <FormField label={defaultLabels.calories} error={errors.calories?.message}>
        <Input
          type="number"
          step="1"
          placeholder="0"
          {...register("calories", { valueAsNumber: true })}
        />
      </FormField>

      <FormField label={defaultLabels.protein} error={errors.protein?.message}>
        <Input
          type="number"
          step="0.1"
          placeholder="0"
          {...register("protein", { valueAsNumber: true })}
        />
      </FormField>

      <FormField label={defaultLabels.fat} error={errors.fat?.message}>
        <Input
          type="number"
          step="0.1"
          placeholder="0"
          {...register("fat", { valueAsNumber: true })}
        />
      </FormField>

      <FormField label={defaultLabels.carbs} error={errors.carbs?.message}>
        <Input
          type="number"
          step="0.1"
          placeholder="0"
          {...register("carbs", { valueAsNumber: true })}
        />
      </FormField>
    </div>
  )
}
