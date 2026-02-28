"use client"

import { useTranslations } from "next-intl"
import { StepEditor as StepEditorComponent, type StepData } from "@/components/shared/forms"
import type { RecipeStep } from "@/types"

interface StepItem extends Omit<RecipeStep, "id" | "recipe_id" | "created_at" | "updated_at"> {
  id?: string
  isNew?: boolean
}

interface RecipeStepsProps {
  steps: StepItem[]
  onChange: (steps: StepItem[]) => void
}

/**
 * Обёртка над универсальным StepEditor для рецептов
 */
export function RecipeSteps({ steps, onChange }: RecipeStepsProps) {
  const t = useTranslations("recipes")

  const handleChange = (newSteps: StepData[]) => {
    // Преобразуем StepData обратно в StepItem с сохранением order
    const updatedSteps: StepItem[] = newSteps.map((step, index) => ({
      ...step,
      id: step.id?.toString(),
      order: index + 1,
      isNew: step.id?.toString().startsWith("temp-") ?? false,
    }))
    onChange(updatedSteps)
  }

  return (
    <StepEditorComponent
      steps={steps.map(({ text, timer_min }) => ({ text, timer_min }))}
      onChange={handleChange}
      addButtonText={t("steps.addStep")}
      emptyMessage={t("steps.empty")}
      showTimer={true}
    />
  )
}
