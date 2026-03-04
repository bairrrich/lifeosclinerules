"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Target, TrendingUp } from "@/lib/icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageActions } from "@/components/shared/page-actions"
import { db, createEntity } from "@/lib/db"
import type { Goal, GoalType, GoalPeriod } from "@/types"

interface AddGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function getGoalTypeConfig(
  t: any
): Record<GoalType, { label: string; icon: string; defaultTarget: number; units: string[] }> {
  return {
    calories: { label: t("types.calories"), icon: "🔥", defaultTarget: 2000, units: ["ккал"] },
    workout: { label: t("types.workout"), icon: "💪", defaultTarget: 3, units: ["раз/нед"] },
    water: { label: t("types.water"), icon: "💧", defaultTarget: 2000, units: ["мл"] },
    sleep: { label: t("types.sleep"), icon: "😴", defaultTarget: 8, units: ["часов"] },
    steps: { label: t("types.steps"), icon: "👣", defaultTarget: 10000, units: ["шагов"] },
    weight: { label: t("types.weight"), icon: "⚖️", defaultTarget: 70, units: ["кг"] },
    finance: {
      label: t("types.finance"),
      icon: "💰",
      defaultTarget: 50000,
      units: ["₽", "$", "€"],
    },
  }
}

export function AddGoalDialog({ open, onOpenChange, onSuccess }: AddGoalDialogProps) {
  const t = useTranslations("goals")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedType, setSelectedType] = useState<GoalType>("calories")
  const [formData, setFormData] = useState({
    target_value: 2000,
    period: "daily" as GoalPeriod,
  })

  const goalConfig = getGoalTypeConfig(t)

  async function handleSave() {
    setIsSaving(true)
    try {
      await createEntity(db.goals, {
        type: selectedType,
        name: goalConfig[selectedType].label,
        target_value: formData.target_value,
        period: formData.period,
        is_active: true,
        icon: goalConfig[selectedType].icon,
      } as Omit<Goal, "id" | "created_at" | "updated_at">)

      setFormData({
        target_value: goalConfig[selectedType].defaultTarget,
        period: "daily",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save goal:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("dialogs.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("dialogs.typeLabel")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(goalConfig) as GoalType[]).map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  className="flex items-center gap-2 justify-start"
                  onClick={() => {
                    setSelectedType(type)
                    setFormData({ ...formData, target_value: goalConfig[type].defaultTarget })
                  }}
                >
                  <span>{goalConfig[type].icon}</span>
                  <span className="text-sm">{goalConfig[type].label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">{t("dialogs.targetLabel")}</Label>
            <Input
              id="target"
              type="number"
              value={formData.target_value}
              onChange={(e) =>
                setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-xs text-muted-foreground">
              {goalConfig[selectedType].units.join(" / ")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("dialogs.periodLabel")}</Label>
            <div className="flex gap-2">
              <Button
                variant={formData.period === "daily" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, period: "daily" })}
                className="flex-1"
              >
                {t("periods.daily")}
              </Button>
              <Button
                variant={formData.period === "weekly" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, period: "weekly" })}
                className="flex-1"
              >
                {t("periods.weekly")}
              </Button>
              <Button
                variant={formData.period === "monthly" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, period: "monthly" })}
                className="flex-1"
              >
                {t("periods.monthly")}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-center sm:justify-center">
          <PageActions
            variant="dialog"
            onCancel={() => {
              onOpenChange(false)
            }}
            onSimpleSave={handleSave}
            isSaving={isSaving}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
