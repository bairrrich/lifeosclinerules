"use client"

import { useEffect, useState } from "react"
import { Plus, Flame, Check, X, Settings, Clock, AlertCircle, ListChecks } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormActions, CreateFormActions, DeleteConfirmActions } from "@/components/shared/form-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity, updateStreak } from "@/lib/db"
import type { Habit, HabitLog, Streak, HabitSubtask } from "@/types"

const habitColors = [
  { bg: "bg-red-500/10", text: "text-red-500", name: "Красный" },
  { bg: "bg-orange-500/10", text: "text-orange-500", name: "Оранжевый" },
  { bg: "bg-amber-500/10", text: "text-amber-500", name: "Жёлтый" },
  { bg: "bg-green-500/10", text: "text-green-500", name: "Зелёный" },
  { bg: "bg-blue-500/10", text: "text-blue-500", name: "Синий" },
  { bg: "bg-purple-500/10", text: "text-purple-500", name: "Фиолетовый" },
  { bg: "bg-pink-500/10", text: "text-pink-500", name: "Розовый" },
]

const habitTypes = [
  { value: "positive", label: "Делать", description: "Привычка что-то делать", icon: "✓" },
  { value: "negative", label: "Не делать", description: "Привычка чего-то избегать", icon: "✗" },
]

const skipReasons = [
  "Забыл",
  "Не было времени",
  "Болезнь",
  "Отпуск",
  "Погода",
  "Другое",
]

const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export default function HabitsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSkipDialogOpen, setIsSkipDialogOpen] = useState(false)
  const [isSubtaskDialogOpen, setIsSubtaskDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [skippingHabit, setSkippingHabit] = useState<Habit | null>(null)
  const [viewingSubtasks, setViewingSubtasks] = useState<Habit | null>(null)
  const [newHabitName, setNewHabitName] = useState("")
  const [selectedColor, setSelectedColor] = useState(0)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")
  const [subtasks, setSubtasks] = useState<HabitSubtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [skipReason, setSkipReason] = useState("")
  const [habitType, setHabitType] = useState<"positive" | "negative">("positive")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const [habitsData, logsData, streaksData] = await Promise.all([
        db.habits.toArray().then(h => h.filter(habit => habit.is_active)),
        db.habitLogs.toArray(),
        db.streaks.toArray(),
      ])
      setHabits(habitsData)
      setHabitLogs(logsData)
      setStreaks(streaksData)
    } catch (error) {
      console.error("Failed to load habits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function addHabit() {
    if (!newHabitName.trim()) return

    const color = habitColors[selectedColor]
    await createEntity(db.habits, {
      name: newHabitName.trim(),
      habit_type: habitType,
      frequency: "daily",
      is_active: true,
      color: `${color.bg} ${color.text}`,
      start_date: startDate,
      end_date: endDate || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    })

    resetForm()
    setIsAddDialogOpen(false)
    loadData()
  }

  async function updateHabit() {
    if (!editingHabit || !newHabitName.trim()) return

    const color = habitColors[selectedColor]
    await updateEntity(db.habits, editingHabit.id, {
      name: newHabitName.trim(),
      habit_type: habitType,
      color: `${color.bg} ${color.text}`,
      start_date: startDate,
      end_date: endDate || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
    })

    resetForm()
    setEditingHabit(null)
    setIsEditDialogOpen(false)
    loadData()
  }

  async function deleteHabit() {
    if (!editingHabit) return
    
    await deleteEntity(db.habits, editingHabit.id)
    
    const relatedLogs = habitLogs.filter(l => l.habit_id === editingHabit.id)
    for (const log of relatedLogs) {
      await db.habitLogs.delete(log.id)
    }
    
    const relatedStreaks = streaks.filter(s => s.habit_id === editingHabit.id)
    for (const streak of relatedStreaks) {
      await db.streaks.delete(streak.id)
    }

    resetForm()
    setEditingHabit(null)
    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    loadData()
  }

  function resetForm() {
    setNewHabitName("")
    setSelectedColor(0)
    setStartDate(new Date().toISOString().split("T")[0])
    setEndDate("")
    setSubtasks([])
    setNewSubtaskTitle("")
    setSkipReason("")
    setHabitType("positive")
  }

  function openEditDialog(habit: Habit) {
    setEditingHabit(habit)
    setNewHabitName(habit.name)
    const colorIndex = habitColors.findIndex(c => habit.color?.includes(c.bg))
    setSelectedColor(colorIndex >= 0 ? colorIndex : 0)
    setStartDate(habit.start_date || new Date().toISOString().split("T")[0])
    setEndDate(habit.end_date || "")
    setSubtasks(habit.subtasks || [])
    setHabitType(habit.habit_type || "positive")
    setIsEditDialogOpen(true)
  }

  async function toggleHabit(habitId: string) {
    const today = new Date().toISOString().split("T")[0]
    const existingLog = habitLogs.find(
      (l) => l.habit_id === habitId && l.date.startsWith(today)
    )

    if (existingLog) {
      await db.habitLogs.update(existingLog.id, {
        completed: !existingLog.completed,
        completed_at: !existingLog.completed ? new Date().toTimeString().slice(0, 5) : undefined,
        skipped_reason: undefined,
      })
    } else {
      await createEntity(db.habitLogs, {
        habit_id: habitId,
        date: today,
        completed: true,
        completed_at: new Date().toTimeString().slice(0, 5),
      })
    }

    await updateStreak(habitId, !existingLog?.completed)
    loadData()
  }

  async function skipHabit() {
    if (!skippingHabit || !skipReason) return

    const today = new Date().toISOString().split("T")[0]
    const existingLog = habitLogs.find(
      (l) => l.habit_id === skippingHabit.id && l.date.startsWith(today)
    )

    if (existingLog) {
      await db.habitLogs.update(existingLog.id, {
        completed: false,
        skipped_reason: skipReason,
      })
    } else {
      await createEntity(db.habitLogs, {
        habit_id: skippingHabit.id,
        date: today,
        completed: false,
        skipped_reason: skipReason,
      })
    }

    setSkippingHabit(null)
    setIsSkipDialogOpen(false)
    setSkipReason("")
    loadData()
  }

  async function toggleSubtask(habitId: string, subtaskId: string) {
    const habit = habits.find(h => h.id === habitId)
    if (!habit || !habit.subtasks) return

    const updatedSubtasks = habit.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    )

    await updateEntity(db.habits, habitId, {
      subtasks: updatedSubtasks,
    })

    loadData()
  }

  function addSubtask() {
    if (!newSubtaskTitle.trim()) return
    setSubtasks([...subtasks, { id: generateId(), title: newSubtaskTitle.trim(), completed: false }])
    setNewSubtaskTitle("")
  }

  function removeSubtask(id: string) {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  function getStreak(habitId: string): Streak | undefined {
    return streaks.find((s) => s.habit_id === habitId)
  }

  function getTodayLog(habitId: string): HabitLog | undefined {
    const today = new Date().toISOString().split("T")[0]
    return habitLogs.find(l => l.habit_id === habitId && l.date.startsWith(today))
  }

  function isHabitCompletedToday(habitId: string): boolean {
    const log = getTodayLog(habitId)
    return log?.completed ?? false
  }

  function getWeekCompletion(habitId: string): { date: string; completed: boolean; skipped: boolean; isToday: boolean; isWeekend: boolean }[] {
    const result: { date: string; completed: boolean; skipped: boolean; isToday: boolean; isWeekend: boolean }[] = []
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i)
      const dateStr = date.toISOString().split("T")[0]
      const log = habitLogs.find(l => l.habit_id === habitId && l.date.startsWith(dateStr))
      result.push({
        date: dateStr,
        completed: log?.completed ?? false,
        skipped: !!log?.skipped_reason,
        isToday: i === dayOfWeek,
        isWeekend: i >= 5,
      })
    }
    return result
  }

  function getDaysSinceStart(habit: Habit): number {
    if (!habit.start_date) return 0
    const start = new Date(habit.start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    start.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - start.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  function getDaysUntilEnd(habit: Habit): number | null {
    if (!habit.end_date) return null
    const end = new Date(habit.end_date)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <AppLayout title="Привычки">
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{habits.length}</div>
                <div className="text-sm text-muted-foreground">Активных привычек</div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.max(...streaks.map((s) => s.current_streak), 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Лучшая серия</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : habits.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Нет привычек. Добавьте первую!
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => {
              const streak = getStreak(habit.id)
              const isCompleted = isHabitCompletedToday(habit.id)
              const todayLog = getTodayLog(habit.id)
              const weekCompletion = getWeekCompletion(habit.id)
              const daysSinceStart = getDaysSinceStart(habit)
              const daysUntilEnd = getDaysUntilEnd(habit)
              const completedSubtasks = habit.subtasks?.filter(st => st.completed).length || 0
              const totalSubtasks = habit.subtasks?.length || 0
              const isNegativeHabit = habit.habit_type === "negative"

              return (
                <Card key={habit.id} className={isCompleted ? "border-green-500/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Button
                        variant={isCompleted ? "default" : "outline"}
                        size="icon"
                        className={`h-12 w-12 rounded-full ${isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : todayLog?.skipped_reason ? (
                          <AlertCircle className="h-6 w-6 text-orange-500" />
                        ) : (
                          <X className="h-6 w-6 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{habit.name}</h3>
                          {isNegativeHabit && (
                            <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
                              Не делать
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          {streak && streak.current_streak > 0 && (
                            <>
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span>{streak.current_streak} дней</span>
                            </>
                          )}
                          <span className="text-xs">{daysSinceStart} день</span>
                          {todayLog?.completed_at && (
                            <span className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {todayLog.completed_at}
                            </span>
                          )}
                          {todayLog?.skipped_reason && (
                            <span className="text-xs text-orange-500">
                              {isNegativeHabit ? "Нарушение" : "Пропуск"}: {todayLog.skipped_reason}
                            </span>
                          )}
                          {daysUntilEnd !== null && (
                            <span className={`text-xs ${daysUntilEnd <= 7 ? "text-orange-500" : ""}`}>
                              • {daysUntilEnd > 0 ? `${daysUntilEnd} дн. осталось` : "Завершена"}
                            </span>
                          )}
                        </div>
                        {totalSubtasks > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {completedSubtasks}/{totalSubtasks} подпривычек
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {totalSubtasks > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingSubtasks(habit)}
                          >
                            <ListChecks className="h-4 w-4" />
                          </Button>
                        )}
                        {!isCompleted && !todayLog?.skipped_reason && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSkippingHabit(habit)
                              setIsSkipDialogOpen(true)
                            }}
                          >
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(habit)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Week view */}
                    <div className="flex justify-between">
                      {weekCompletion.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <span className={`text-xs ${day.isWeekend ? "text-orange-500/70" : "text-muted-foreground"}`}>
                            {dayNames[i]}
                          </span>
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              day.completed
                                ? "bg-green-500 text-white"
                                : day.skipped
                                ? "bg-orange-500/30 text-orange-500"
                                : day.isToday
                                ? "border-2 border-dashed border-muted-foreground/30"
                                : day.isWeekend
                                ? "bg-orange-500/10"
                                : "bg-muted"
                            }`}
                          >
                            {day.completed && <Check className="h-4 w-4" />}
                            {day.skipped && <AlertCircle className="h-4 w-4" />}
                          </div>
                        </div>
                      ))}
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
                onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }}
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
              <DialogTitle>Новая привычка</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder={habitType === "positive" ? "Например: Утренняя зарядка" : "Например: Не есть сладкое"}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Тип привычки</Label>
                <div className="grid grid-cols-2 gap-2">
                  {habitTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setHabitType(type.value as "positive" | "negative")}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        habitType === type.value 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цвет</Label>
                <div className="flex gap-2">
                  {habitColors.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      className={`h-8 w-8 rounded-full ${color.bg} ${color.text} ${selectedColor === i ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Дата начала</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">Дата конца (опц.)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Subtasks */}
              <div className="space-y-2">
                <Label>Подпривычки (чек-лист)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить шаг..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  />
                  <Button type="button" onClick={addSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {subtasks.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1 text-sm">{st.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeSubtask(st.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <CreateFormActions
              onCancel={() => setIsAddDialogOpen(false)}
              onSave={addHabit}
              saveText="Добавить"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Редактировать привычку</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Название</Label>
                <Input
                  id="edit-name"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Тип привычки</Label>
                <div className="grid grid-cols-2 gap-2">
                  {habitTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setHabitType(type.value as "positive" | "negative")}
                      className={`p-3 rounded-lg border-2 text-left transition-colors ${
                        habitType === type.value 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Цвет</Label>
                <div className="flex gap-2">
                  {habitColors.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      className={`h-8 w-8 rounded-full ${color.bg} ${color.text} ${selectedColor === i ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                    />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-date">Дата начала</Label>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-date">Дата конца (опц.)</Label>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Subtasks */}
              <div className="space-y-2">
                <Label>Подпривычки</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Добавить шаг..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  />
                  <Button type="button" onClick={addSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {subtasks.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {subtasks.map((st) => (
                      <div key={st.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <span className="flex-1 text-sm">{st.title}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeSubtask(st.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <FormActions
              type="dialog"
              showDelete
              onDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSave={updateHabit}
            />
          </DialogContent>
        </Dialog>

        {/* Skip Dialog */}
        <Dialog open={isSkipDialogOpen} onOpenChange={setIsSkipDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Пропустить сегодня?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Причина пропуска</Label>
                <div className="grid grid-cols-2 gap-2">
                  {skipReasons.map((reason) => (
                    <Button
                      key={reason}
                      variant={skipReason === reason ? "default" : "outline"}
                      onClick={() => setSkipReason(reason)}
                    >
                      {reason}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <CreateFormActions
              onCancel={() => setIsSkipDialogOpen(false)}
              onSave={skipHabit}
              saveText="Пропустить"
            />
          </DialogContent>
        </Dialog>

        {/* Subtasks Dialog */}
        <Dialog open={!!viewingSubtasks} onOpenChange={() => setViewingSubtasks(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{viewingSubtasks?.name} — Подпривычки</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 py-4">
              {viewingSubtasks?.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    st.completed ? "bg-green-500/10" : "bg-muted"
                  }`}
                  onClick={() => toggleSubtask(viewingSubtasks.id, st.id)}
                >
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    st.completed ? "border-green-500 bg-green-500" : "border-muted-foreground"
                  }`}>
                    {st.completed && <Check className="h-4 w-4 text-white" />}
                  </div>
                  <span className={st.completed ? "line-through text-muted-foreground" : ""}>
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить привычку?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              Вы уверены, что хотите удалить привычку "{editingHabit?.name}"? Это действие нельзя отменить.
            </p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteHabit}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}