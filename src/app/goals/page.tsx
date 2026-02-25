"use client"

import { useEffect, useState } from "react"
import { Plus, Target, Check, Settings, Trash2, ChevronDown } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import type { Goal, GoalType, GoalPeriod } from "@/types"

const goalTypeConfig: Record<GoalType, { label: string; icon: string; defaultTarget: number; units: string[] }> = {
  calories: { label: "Калории", icon: "🔥", defaultTarget: 2000, units: ["ккал"] },
  workout: { label: "Тренировки", icon: "💪", defaultTarget: 30, units: ["мин", "ч", "шт"] },
  water: { label: "Вода", icon: "💧", defaultTarget: 2000, units: ["мл", "л"] },
  sleep: { label: "Сон", icon: "😴", defaultTarget: 480, units: ["мин", "ч"] },
  steps: { label: "Шаги", icon: "👟", defaultTarget: 10000, units: ["шт"] },
  weight: { label: "Вес", icon: "⚖️", defaultTarget: 70, units: ["кг", "г"] },
  finance: { label: "Финансы", icon: "💰", defaultTarget: 50000, units: ["₽"] },
}

const periodLabels: Record<GoalPeriod, string> = {
  daily: "В день",
  weekly: "В неделю",
  monthly: "В месяц",
}

const allGoalTypes: GoalType[] = ["calories", "workout", "water", "sleep", "steps", "weight", "finance"]

export default function GoalsPage() {
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
    unit: "ккал",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const goalsData = await db.goals.toArray().then(g => g.filter(goal => goal.is_active))
      setGoals(goalsData)
    } catch (error) {
      console.error("Failed to load goals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function openAddDialog() {
    const defaultType = "calories"
    const config = goalTypeConfig[defaultType]
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
      unit: goal.unit || goalTypeConfig[goal.type]?.units[0] || "",
    })
    setEditingGoal(goal)
    setIsEditDialogOpen(true)
  }

  function handleTypeChange(newType: GoalType) {
    const config = goalTypeConfig[newType]
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
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-yellow-500"
    if (progress >= 50) return "bg-orange-500"
    return "bg-blue-500"
  }

  const availableUnits = goalTypeConfig[formData.type]?.units || []

  return (
    <AppLayout title="Цели">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{goals.length}</div>
              <div className="text-sm text-muted-foreground">Активных целей</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-green-500">
                {goals.filter((g) => getProgress(g) >= 100).length}
              </div>
              <div className="text-sm text-muted-foreground">Достигнуто сегодня</div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Нет целей. Добавьте первую!
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {goals.map((goal) => {
              const progress = getProgress(goal)
              const isCompleted = progress >= 100
              const config = goalTypeConfig[goal.type]

              return (
                <Card
                  key={goal.id}
                  className={isCompleted ? "border-green-500/30" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{config?.icon || "🎯"}</div>
                        <div>
                          <h3 className="font-medium">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {periodLabels[goal.period]}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(goal)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {isCompleted && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
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
                          className={`h-full transition-all ${getProgressColor(progress)}`}
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

        {/* FAB */}
        <div className="fixed bottom-24 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex justify-end pointer-events-auto">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={openAddDialog}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Новая цель</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Тип цели</Label>
                <Tabs
                  value={formData.type}
                  onValueChange={(v) => handleTypeChange(v as GoalType)}
                >
                  <TabsList className="grid grid-cols-4 h-auto">
                    {allGoalTypes.map((type) => (
                      <TabsTrigger key={type} value={type} className="text-lg py-2">
                        {goalTypeConfig[type]?.icon}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-sm text-muted-foreground text-center">
                  {goalTypeConfig[formData.type]?.label}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Калории в день"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target">Целевое значение</Label>
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
                  <Label>Единица</Label>
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
                <Label>Период</Label>
                <Tabs
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v as GoalPeriod })}
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="daily">День</TabsTrigger>
                    <TabsTrigger value="weekly">Неделя</TabsTrigger>
                    <TabsTrigger value="monthly">Месяц</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveGoal}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать цель</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Тип цели</Label>
                <Tabs
                  value={formData.type}
                  onValueChange={(v) => handleTypeChange(v as GoalType)}
                >
                  <TabsList className="grid grid-cols-4 h-auto">
                    {allGoalTypes.map((type) => (
                      <TabsTrigger key={type} value={type} className="text-lg py-2">
                        {goalTypeConfig[type]?.icon}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <p className="text-sm text-muted-foreground text-center">
                  {goalTypeConfig[formData.type]?.label}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target">Целевое значение</Label>
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
                  <Label>Единица</Label>
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
                <Label>Период</Label>
                <Tabs
                  value={formData.period}
                  onValueChange={(v) => setFormData({ ...formData, period: v as GoalPeriod })}
                >
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="daily">День</TabsTrigger>
                    <TabsTrigger value="weekly">Неделя</TabsTrigger>
                    <TabsTrigger value="monthly">Месяц</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={saveGoal}>Сохранить</Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить цель?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              Вы уверены, что хотите удалить цель "{editingGoal?.name}"? Это действие нельзя отменить.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={deleteGoal}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}