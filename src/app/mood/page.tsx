"use client"

import { useEffect, useState } from "react"
import {
  Smile,
  Meh,
  Frown,
  Plus,
  Battery,
  Brain,
  Settings,
  Droplet,
  Moon,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
} from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FormActions,
  CreateFormActions,
  DeleteConfirmActions,
} from "@/components/shared/form-actions"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import type { MoodLog, MoodType } from "@/types"

const moodConfig: Record<
  MoodType,
  { label: string; icon: typeof Smile; color: string; emoji: string }
> = {
  great: { label: "Отлично", icon: Smile, color: "text-green-500", emoji: "😄" },
  good: { label: "Хорошо", icon: Smile, color: "text-lime-500", emoji: "🙂" },
  okay: { label: "Нормально", icon: Meh, color: "text-yellow-500", emoji: "😐" },
  bad: { label: "Плохо", icon: Frown, color: "text-orange-500", emoji: "😕" },
  terrible: { label: "Ужасно", icon: Frown, color: "text-red-500", emoji: "😢" },
}

const activityOptions = [
  "work",
  "exercise",
  "social",
  "hobby",
  "rest",
  "shopping",
  "reading",
  "gaming",
  "cooking",
  "walk",
]

const activityLabels: Record<string, string> = {
  work: "Работа",
  exercise: "Спорт",
  social: "Общение",
  hobby: "Хобби",
  rest: "Отдых",
  shopping: "Покупки",
  reading: "Чтение",
  gaming: "Игры",
  cooking: "Готовка",
  walk: "Прогулка",
}

export default function MoodPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([])
  const [correlations, setCorrelations] = useState<{
    sleep: { value: number; label: string; trend: "up" | "down" | "neutral" }
    water: { value: number; label: string; trend: "up" | "down" | "neutral" }
    workout: { value: number; label: string; trend: "up" | "down" | "neutral" }
  } | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<MoodLog | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString(),
    mood: "good" as MoodType,
    energy: 3 as 1 | 2 | 3 | 4 | 5,
    stress: 3 as 1 | 2 | 3 | 4 | 5,
    activities: [] as string[],
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const logs = await db.moodLogs.orderBy("date").reverse().limit(30).toArray()
      setMoodLogs(logs)

      await calculateCorrelations(logs)
    } catch (error) {
      console.error("Failed to load mood data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function calculateCorrelations(logs: MoodLog[]) {
    if (logs.length < 3) {
      setCorrelations(null)
      return
    }

    const moodValues: Record<MoodType, number> = {
      great: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    }

    const last14Days = logs.slice(0, 14)
    const [sleepLogs, waterLogs, workoutLogs] = await Promise.all([
      db.sleepLogs.toArray(),
      db.waterLogs.toArray(),
      db.logs.where("type").equals("workout").toArray(),
    ])

    function pearsonCorrelation(x: number[], y: number[]): number {
      const n = x.length
      if (n < 3) return 0

      const sumX = x.reduce((a, b) => a + b, 0)
      const sumY = y.reduce((a, b) => a + b, 0)
      const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
      const sumX2 = x.reduce((total, xi) => total + xi * xi, 0)
      const sumY2 = y.reduce((total, yi) => total + yi * yi, 0)

      const numerator = n * sumXY - sumX * sumY
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

      if (denominator === 0) return 0
      return numerator / denominator
    }

    const sleepData: { mood: number; sleep: number }[] = []
    for (const log of last14Days) {
      const date = log.date.split("T")[0]
      const prevDate = new Date(date)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevDateStr = prevDate.toISOString().split("T")[0]

      const sleep = sleepLogs.find((s) => s.date.startsWith(prevDateStr))
      if (sleep && sleep.duration_min) {
        sleepData.push({ mood: moodValues[log.mood], sleep: sleep.duration_min / 60 })
      }
    }

    const waterData: { mood: number; water: number }[] = []
    for (const log of last14Days) {
      const date = log.date.split("T")[0]
      const dayWater = waterLogs
        .filter((w) => w.date.startsWith(date))
        .reduce((sum, w) => sum + w.amount_ml, 0)
      if (dayWater > 0) {
        waterData.push({ mood: moodValues[log.mood], water: dayWater / 1000 })
      }
    }

    const workoutData: { mood: number; workout: number }[] = []
    for (const log of last14Days) {
      const date = log.date.split("T")[0]
      const dayWorkouts = workoutLogs.filter((w) => w.date.startsWith(date))
      const workoutMin = dayWorkouts.reduce((sum, w) => {
        const metadata = w.metadata as { duration?: number } | undefined
        return sum + (metadata?.duration || 0)
      }, 0)
      workoutData.push({ mood: moodValues[log.mood], workout: workoutMin })
    }

    const sleepCorr =
      sleepData.length >= 3
        ? pearsonCorrelation(
            sleepData.map((d) => d.sleep),
            sleepData.map((d) => d.mood)
          )
        : 0
    const waterCorr =
      waterData.length >= 3
        ? pearsonCorrelation(
            waterData.map((d) => d.water),
            waterData.map((d) => d.mood)
          )
        : 0
    const workoutCorr =
      workoutData.length >= 3
        ? pearsonCorrelation(
            workoutData.map((d) => d.workout),
            workoutData.map((d) => d.mood)
          )
        : 0

    function formatCorrelation(value: number): { label: string; trend: "up" | "down" | "neutral" } {
      const absValue = Math.abs(value)
      if (absValue < 0.3) {
        return { label: "Нет связи", trend: "neutral" }
      } else if (value > 0) {
        if (absValue >= 0.7) return { label: "Сильная +", trend: "up" }
        if (absValue >= 0.5) return { label: "Средняя +", trend: "up" }
        return { label: "Слабая +", trend: "up" }
      } else {
        if (absValue >= 0.7) return { label: "Сильная −", trend: "down" }
        if (absValue >= 0.5) return { label: "Средняя −", trend: "down" }
        return { label: "Слабая −", trend: "down" }
      }
    }

    setCorrelations({
      sleep: { value: sleepCorr, ...formatCorrelation(sleepCorr) },
      water: { value: waterCorr, ...formatCorrelation(waterCorr) },
      workout: { value: workoutCorr, ...formatCorrelation(workoutCorr) },
    })
  }

  async function addMoodLog() {
    await createEntity(db.moodLogs, {
      date: formData.date,
      mood: formData.mood,
      energy: formData.energy,
      stress: formData.stress,
      activities: formData.activities.length > 0 ? formData.activities : undefined,
      notes: formData.notes || undefined,
    })

    setIsAddDialogOpen(false)
    resetForm()
    loadData()
  }

  async function updateMoodLog() {
    if (!editingLog) return

    await updateEntity(db.moodLogs, editingLog.id, {
      date: formData.date,
      mood: formData.mood,
      energy: formData.energy,
      stress: formData.stress,
      activities: formData.activities.length > 0 ? formData.activities : undefined,
      notes: formData.notes || undefined,
    })

    setIsEditDialogOpen(false)
    setEditingLog(null)
    resetForm()
    loadData()
  }

  async function deleteMoodLog() {
    if (!editingLog) return

    await deleteEntity(db.moodLogs, editingLog.id)

    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingLog(null)
    resetForm()
    loadData()
  }

  function resetForm() {
    setFormData({
      date: new Date().toISOString(),
      mood: "good",
      energy: 3,
      stress: 3,
      activities: [],
      notes: "",
    })
  }

  function openEditDialog(log: MoodLog) {
    setEditingLog(log)
    setFormData({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress,
      activities: log.activities || [],
      notes: log.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  function toggleActivity(activity: string) {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  const getMoodAverage = (logs: MoodLog[]): string => {
    if (logs.length === 0) return "-"
    const moodValues: Record<MoodType, number> = {
      great: 5,
      good: 4,
      okay: 3,
      bad: 2,
      terrible: 1,
    }
    const avg = logs.reduce((sum, log) => sum + moodValues[log.mood], 0) / logs.length
    if (avg >= 4.5) return "😄"
    if (avg >= 3.5) return "🙂"
    if (avg >= 2.5) return "😐"
    if (avg >= 1.5) return "😕"
    return "😢"
  }

  const todayMood = moodLogs[0]
  const weekMoods = moodLogs.slice(0, 7)

  return (
    <AppLayout title="Настроение">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Mood */}
        <Card>
          <CardContent className="p-6">
            {todayMood ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{moodConfig[todayMood.mood].emoji}</div>
                  <div>
                    <div className="text-2xl font-bold">{moodConfig[todayMood.mood].label}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(todayMood.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <Battery
                      className={`h-5 w-5 mx-auto mb-1 ${todayMood.energy >= 3 ? "text-green-500" : "text-orange-500"}`}
                    />
                    <span className="text-sm">{todayMood.energy}/5</span>
                  </div>
                  <div className="text-center">
                    <Brain
                      className={`h-5 w-5 mx-auto mb-1 ${todayMood.stress <= 3 ? "text-green-500" : "text-red-500"}`}
                    />
                    <span className="text-sm">{todayMood.stress}/5</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Smile className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Как ваше настроение сегодня?</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Week Overview */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Последние 7 дней</h3>
            <div className="flex justify-between">
              {weekMoods.map((log, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{moodConfig[log.mood].emoji}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.date).toLocaleDateString("ru-RU", { weekday: "short" })}
                  </span>
                </div>
              ))}
              {Array.from({ length: 7 - weekMoods.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
                  <span className="text-2xl opacity-30">○</span>
                  <span className="text-xs text-muted-foreground">-</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-1">{getMoodAverage(weekMoods)}</div>
              <div className="text-sm text-muted-foreground">Среднее за неделю</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{moodLogs.length}</div>
              <div className="text-sm text-muted-foreground">Записей</div>
            </CardContent>
          </Card>
        </div>

        {/* Correlations */}
        {correlations && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Корреляции с настроением</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Как различные факторы влияют на ваше настроение (на основе последних 14 дней)
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    <span className="text-sm">Сон</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{correlations.sleep.label}</span>
                    {correlations.sleep.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {correlations.sleep.trend === "down" && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {correlations.sleep.trend === "neutral" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    <span className="text-sm">Вода</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{correlations.water.label}</span>
                    {correlations.water.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {correlations.water.trend === "down" && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {correlations.water.trend === "neutral" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-orange-500" />
                    <span className="text-sm">Тренировки</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{correlations.workout.label}</span>
                    {correlations.workout.trend === "up" && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    {correlations.workout.trend === "down" && (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    {correlations.workout.trend === "neutral" && (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                💡 Положительная корреляция означает, что больше/лучше → лучше настроение
              </p>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold mb-3">История</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Загрузка...
              </CardContent>
            </Card>
          ) : moodLogs.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Нет записей
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {moodLogs.slice(0, 10).map((log) => (
                <Card key={log.id} className="group">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{moodConfig[log.mood].emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{moodConfig[log.mood].label}</span>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Battery className="h-3 w-3" /> {log.energy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Brain className="h-3 w-3" /> {log.stress}
                            </span>
                          </div>
                        </div>
                        {log.activities && log.activities.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {log.activities.map((a) => activityLabels[a] || a).join(", ")}
                          </div>
                        )}
                        {log.notes && (
                          <div className="text-sm text-muted-foreground mt-1">{log.notes}</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.date).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(log)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Как вы себя чувствуете?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Настроение</Label>
                <div className="flex justify-between">
                  {(Object.keys(moodConfig) as MoodType[]).map((mood) => (
                    <Button
                      key={mood}
                      variant={formData.mood === mood ? "default" : "outline"}
                      className="flex flex-col items-center px-3 py-2 h-auto"
                      onClick={() => setFormData({ ...formData, mood })}
                    >
                      <span className="text-2xl">{moodConfig[mood].emoji}</span>
                      <span className="text-xs mt-1">{moodConfig[mood].label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Battery className="h-4 w-4" /> Энергия
                </Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((e) => (
                    <Button
                      key={e}
                      variant={formData.energy === e ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, energy: e })}
                      className="flex-1"
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Стресс (1 - низкий, 5 - высокий)
                </Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((s) => (
                    <Button
                      key={s}
                      variant={formData.stress === s ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, stress: s })}
                      className="flex-1"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Активности</Label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((activity) => (
                    <Button
                      key={activity}
                      variant={formData.activities.includes(activity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleActivity(activity)}
                    >
                      {activityLabels[activity]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Что повлияло на настроение?"
                />
              </div>
            </div>
            <CreateFormActions
              onCancel={() => setIsAddDialogOpen(false)}
              onSave={addMoodLog}
              saveText="Сохранить"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать запись</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Настроение</Label>
                <div className="flex justify-between">
                  {(Object.keys(moodConfig) as MoodType[]).map((mood) => (
                    <Button
                      key={mood}
                      variant={formData.mood === mood ? "default" : "outline"}
                      className="flex flex-col items-center px-3 py-2 h-auto"
                      onClick={() => setFormData({ ...formData, mood })}
                    >
                      <span className="text-2xl">{moodConfig[mood].emoji}</span>
                      <span className="text-xs mt-1">{moodConfig[mood].label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Battery className="h-4 w-4" /> Энергия
                </Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((e) => (
                    <Button
                      key={e}
                      variant={formData.energy === e ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, energy: e })}
                      className="flex-1"
                    >
                      {e}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Brain className="h-4 w-4" /> Стресс (1 - низкий, 5 - высокий)
                </Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((s) => (
                    <Button
                      key={s}
                      variant={formData.stress === s ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, stress: s })}
                      className="flex-1"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Активности</Label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((activity) => (
                    <Button
                      key={activity}
                      variant={formData.activities.includes(activity) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleActivity(activity)}
                    >
                      {activityLabels[activity]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Заметки</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Что повлияло на настроение?"
                />
              </div>
            </div>
            <FormActions
              type="dialog"
              showDelete
              onDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSave={updateMoodLog}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить запись?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              Вы уверены, что хотите удалить запись о настроении? Это действие нельзя отменить.
            </p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteMoodLog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
