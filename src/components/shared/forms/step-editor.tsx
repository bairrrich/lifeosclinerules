"use client"

import { useTranslations } from "next-intl"
import { Plus, X, Clock } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ArrayManager } from "./array-manager"

export interface StepData {
  id?: string | number
  text: string
  timer_min?: number
}

export interface StepEditorProps {
  steps: StepData[]
  onChange: (steps: StepData[]) => void
  addButtonText?: string
  emptyMessage?: string
  showTimer?: boolean
}

/**
 * Универсальный редактор шагов
 * Используется для рецептов, тренировок, чек-листов и других последовательностей
 */
export function StepEditor({
  steps,
  onChange,
  addButtonText,
  emptyMessage,
  showTimer = true,
}: StepEditorProps) {
  const t = useTranslations("recipes")

  const handleAdd = (): StepData => ({
    id: Date.now(),
    text: "",
    timer_min: undefined,
  })

  const renderStep = (
    step: StepData,
    index: number,
    onUpdate: (field: keyof StepData, value: any) => void,
    onRemove: () => void,
    canMoveUp: boolean,
    canMoveDown: boolean
  ) => {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
            {index + 1}
          </div>
          <Textarea
            placeholder={t("forms.steps.stepText")}
            value={step.text}
            onChange={(e) => onUpdate("text", e.target.value)}
            className="flex-1 min-h-[60px] resize-none"
          />
        </div>

        {showTimer && (
          <div className="flex items-center gap-2 pl-8">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder={t("forms.steps.timer")}
              value={step.timer_min || ""}
              onChange={(e) => onUpdate("timer_min", parseInt(e.target.value) || undefined)}
              className="w-24 h-8 text-xs"
              min={0}
            />
            <span className="text-xs text-muted-foreground">{t("forms.steps.minutes")}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <ArrayManager
      items={steps}
      onChange={onChange}
      renderItem={renderStep}
      onAdd={handleAdd}
      emptyMessage={emptyMessage || t("forms.steps.empty")}
      addButtonText={addButtonText || t("forms.steps.addStep")}
      showDragHandle
      allowReorder
    />
  )
}
