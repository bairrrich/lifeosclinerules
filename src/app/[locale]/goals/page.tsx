"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "@/lib/navigation"
import { Plus, Target, Check, Settings, Trash2, ChevronDown } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FormActions,
  CreateFormActions,
  DeleteConfirmActions,
} from "@/components/shared/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import { useTranslations } from "next-intl"
import type { Goal, GoalType, GoalPeriod } from "@/types"
import { progressColors } from "@/lib/theme-colors"

function getGoalTypeConfig(
  t: any
): Record<GoalType, { label: string; icon: string; defaultTarget: number; units: string[] }> {
  return {
    calories: {
      label: t("types.calories"),
      icon: "🔥",
      defaultTarget: 2000,
      units: [t("units.kcal")],
    },
    workout: {
      label: t("types.workout"),
      icon: "💪",
      defaultTarget: 30,
      units: [t("units.min"), t("units.hour"), t("units.count")],
    },
    water: {
      label: t("types.water"),
      icon: "💧",
      defaultTarget: 2000,
      units: [t("units.ml"), t("units.l")],
    },
    sleep: {
      label: t("types.sleep"),
      icon: "😴",
      defaultTarget: 480,
      units: [t("units.min"), t("units.hour")],
    },
    steps: { label: t("types.steps"), icon: "👟", defaultTarget: 10000, units: [t("units.count")] },
    weight: {
      label: t("types.weight"),
      icon: "⚖️",
      defaultTarget: 70,
      units: [t("units.kg"), t("units.g")],
    },
    finance: {
      label: t("types.finance"),
      icon: "💰",
      defaultTarget: 50000,
      units: [t("units.currency")],
    },
  }
}

const periodLabels: Record<GoalPeriod, string> = {
  daily: "В день",
  weekly: "В неделю",
  monthly: "В месяц",
}

const allGoalTypes: GoalType[] = [
  "calories",
  "workout",
  "water",
  "sleep",
  "steps",
  "weight",
  "finance",
]

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Загрузка...</div>}>
      <GoalsContent />
    </Suspense>
  )
}

function GoalsContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("goals")
  const goalConfig = getGoalTypeConfig(t)
  const [isLoading, setIsLoading] = useState(true)
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUnitSelectOpen, setIsUnitSelectOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "calories" as GoalType,
    target_value: 2000,
    period: "daily" as GoalPeriod,
    unit: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  // Открыть диалог добавления если передан параметр add=true
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      openAddDialog()
      // Clear the query parameter after opening to allow re-opening the dialog
      const url = new URL(window.location.href)
      url.searchParams.delete("add")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  async function loadData() {
    try {
      await initializeDatabase()
      const goalsData = await db.goals.toArray().then((g) => g.filter((goal) => goal.is_active))
      setGoals(goalsData)
    } catch (error) {
      console.error("Failed to load goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function openAddDialog() {
    const defaultType = "calories"
    const config = goalConfig[defaultType]
    setFormData({
      name: "",
      type: defaultType,
      target_value: config.defaultTarget,
      period: "daily",
      unit: config.units[0],
    })
    setEditingGoal(null)
    setIsAddDialogOpen(true)
  }

  function openEditDialog(goal: Goal) {
    setFormData({
      name: goal.name,
      type: goal.type,
      target_value: goal.target_value,
      period: goal.period,
      unit: goal.unit || goalConfig[goal.type]?.units[0] || "",
    })
    setEditingGoal(goal)
    setIsEditDialogOpen(true)
  }

  function handleTypeChange(newType: GoalType) {
    const config = goalConfig[newType]
    setFormData({
      ...formData,
      type: newType,
      target_value: config.defaultTarget,
      unit: config.units[0],
    })
  }

  async function saveGoal() {
    if (!formData.name.trim() || formData.target_value <= 0) return

    if (editingGoal) {
      await updateEntity(db.goals, editingGoal.id, {
        name: formData.name.trim(),
        type: formData.type,
        target_value: formData.target_value,
        period: formData.period,
        unit: formData.unit || undefined,
      })
    } else {
      await createEntity(db.goals, {
        name: formData.name.trim(),
        type: formData.type,
        target_value: formData.target_value,
        period: formData.period,
        unit: formData.unit || undefined,
        start_date: new Date().toISOString().split("T")[0],
        is_active: true,
        current_value: 0,
      })
    }

    setIsAddDialogOpen(false)
    setIsEditDialogOpen(false)
    loadData()
  }

  async function deleteGoal() {
    if (!editingGoal) return

    await deleteEntity(db.goals, editingGoal.id)
    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    loadData()
  }

  function getProgress(goal: Goal): number {
    if (!goal.current_value || !goal.target_value) return 0
    return Math.min(100, (goal.current_value / goal.target_value) * 100)
  }

  function getProgressColor(progress: number): string {
    if (progress >= 100) return progressColors.complete.DEFAULT
    if (progress >= 75) return progressColors.almost.DEFAULT
    if (progress >= 50) return progressColors.halfway.DEFAULT
    return progressColors.low.DEFAULT
  }

  const availableUnits = goalConfig[formData.type]?.units || []

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{goals.length}</div>
              <div className="text-sm text-muted-foreground">{t("fields.isActive")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">
                {goals.filter((g) => getProgress(g) >= 100).length}
              </div>
              <div className="text-sm text-muted-foreground">{t("completedToday")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("common.loading")}
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("noGoals")}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((goal) => {
              const progress = getProgress(goal)
              const isCompleted = progress >= 100
              const config = goalConfig[goal.type]

              return (
                <Card key={goal.id} className={isCompleted ? "border-green-500/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{config?.icon || "🎯"}</div>
                        <div>
                          <h3 className="font-medium">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t(`periods.${goal.period}`)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(goal)}
                          aria-label={t("editGoal")}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {isCompleted && <Check className="h-5 w-5 text-green-500" />}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {goal.current_value || 0} / {goal.target_value} {goal.unit || ""}
                        </span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full transition-[width,background-color] duration-300 ${getProgressColor(progress)}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent
            className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden"
            aria-label={t("addGoal")}
          >
            <DialogHeader>
              <DialogTitle>{t("addGoal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("fields.type")}</Label>
                <Tabs value={formData.type} onValueChange={(v) => handleTypeChange(v as GoalType)}>
                  <TabsList className="grid grid-cols-4 h-auto">
                    {allGoalTypes.map((type) => (
                      <TabsTrigger key={type} value={type} className="text-lg py-2">
                        {goalConfig[type]?.icon}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-sm text-muted-foreground text-center">
                  {t(`types.${formData.type}`)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t("fields.name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("placeholders.caloriesPerDay")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">{t("fields.targetValue")}</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target_value || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, target_value: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.unit")}</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setIsUnitSelectOpen(!isUnitSelectOpen)}
                    >
                      {formData.unit}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                    {isUnitSelectOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
                        {availableUnits.map((unit) => (
                          <button
                            key={unit}
                            className="w-full px-3 py-2 text-left hover:bg-accent"
                            onClick={() => {
                              setFormData({ ...formData, unit })
                              setIsUnitSelectOpen(false)
                            }}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("fields.period")}</Label>
                <Tabs
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v as GoalPeriod })}
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="daily">{t("periods.daily")}</TabsTrigger>
                    <TabsTrigger value="weekly">{t("periods.weekly")}</TabsTrigger>
                    <TabsTrigger value="monthly">{t("periods.monthly")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <CreateFormActions
              onCancel={() => setIsAddDialogOpen(false)}
              onSave={saveGoal}
              saveText={t("common.add")}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden"
            aria-label={t("editGoal")}
          >
            <DialogHeader>
              <DialogTitle>{t("editGoal")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("fields.type")}</Label>
                <Tabs value={formData.type} onValueChange={(v) => handleTypeChange(v as GoalType)}>
                  <TabsList className="grid grid-cols-4 h-auto">
                    {allGoalTypes.map((type) => (
                      <TabsTrigger key={type} value={type} className="text-lg py-2">
                        {goalConfig[type]?.icon}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-sm text-muted-foreground text-center">
                  {t(`types.${formData.type}`)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">{t("fields.name")}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target">{t("fields.targetValue")}</Label>
                  <Input
                    id="edit-target"
                    type="number"
                    value={formData.target_value || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, target_value: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("fields.unit")}</Label>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setIsUnitSelectOpen(!isUnitSelectOpen)}
                    >
                      {formData.unit}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                    {isUnitSelectOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
                        {availableUnits.map((unit) => (
                          <button
                            key={unit}
                            className="w-full px-3 py-2 text-left hover:bg-accent"
                            onClick={() => {
                              setFormData({ ...formData, unit })
                              setIsUnitSelectOpen(false)
                            }}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("fields.period")}</Label>
                <Tabs
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v as GoalPeriod })}
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="daily">{t("periods.daily")}</TabsTrigger>
                    <TabsTrigger value="weekly">{t("periods.weekly")}</TabsTrigger>
                    <TabsTrigger value="monthly">{t("periods.monthly")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <FormActions
              type="dialog"
              showDelete
              onDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSave={saveGoal}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent aria-label={t("deleteConfirm.title")}>
            <DialogHeader>
              <DialogTitle>{t("deleteConfirm.title")}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              {t("deleteConfirm.message", { name: editingGoal?.name || "" })}
            </p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteGoal}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
