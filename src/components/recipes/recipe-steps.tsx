"use client"

import { Plus, X, Clock } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { RecipeStep } from "@/types"

interface StepItem extends Omit<RecipeStep, "id" | "recipe_id" | "created_at" | "updated_at"> {
  id?: string
  isNew?: boolean
}

interface RecipeStepsProps {
  steps: StepItem[]
  onChange: (steps: StepItem[]) => void
}

export function RecipeSteps({ steps, onChange }: RecipeStepsProps) {
  const addStep = () => {
    const newStep: StepItem = {
      id: `temp-${Date.now()}`,
      order: steps.length + 1,
      text: "",
      isNew: true,
    }
    onChange([...steps, newStep])
  }

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index)
    // Перенумеруем шаги
    updated.forEach((step, i) => {
      step.order = i + 1
    })
    onChange(updated)
  }

  const updateStep = (index: number, field: keyof StepItem, value: string | number | undefined) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= steps.length) return

    const updated = [...steps]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    // Перенумеруем шаги
    updated.forEach((step, i) => {
      step.order = i + 1
    })

    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Приготовление</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-4 w-4 mr-1" />
            Добавить шаг
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Нет шагов. Нажмите &laquo;Добавить шаг&raquo; для создания.
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.id || index} className="flex gap-2 p-3 rounded-lg bg-muted/30 border">
              {/* Номер шага */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                  {step.order}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, "down")}
                    disabled={index === steps.length - 1}
                    className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Содержимое шага */}
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Описание шага..."
                  value={step.text}
                  onChange={(e) => updateStep(index, "text", e.target.value)}
                  className="min-h-[60px] resize-none"
                />

                {/* Таймер (опционально) */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Время (мин)"
                    value={step.timer_min || ""}
                    onChange={(e) =>
                      updateStep(index, "timer_min", parseInt(e.target.value) || undefined)
                    }
                    className="w-24 h-8 text-xs"
                    min={0}
                  />
                  <span className="text-xs text-muted-foreground">минут</span>
                </div>
              </div>

              {/* Удалить */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeStep(index)}
                aria-label="Удалить шаг"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
