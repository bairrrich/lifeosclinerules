"use client"

import { useEffect, useState } from "react"
import { Plus, Flame, Check, X, Settings, Trash2, Calendar } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity, updateStreak } from "@/lib/db"
import type { Habit, HabitLog, Streak } from "@/types"

const habitColors = [
  { bg: "bg-red-500/10", text: "text-red-500", name: "Красный" },
  { bg: "bg-orange-500/10", text: "text-orange-500", name: "Оранжевый" },
  { bg: "bg-amber-500/10", text: "text-amber-500", name: "Жёлтый" },
  { bg: "bg-green-500/10", text: "text-green-500", name: "Зелёный" },
  { bg: "bg-blue-500/10", text: "text-blue-500", name: "Синий" },
  { bg: "bg-purple-500/10", text: "text-purple-500", name: "Фиолетовый" },
  { bg: "bg-pink-500/10", text: "text-pink-500", name: "Розовый" },
]

// Дни недели начиная с понедельника
const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

export default function HabitsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [newHabitName, setNewHabitName] = useState("")
  const [selectedColor, setSelectedColor] = useState(0)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState("")

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
      frequency: "daily",
      is_active: true,
      color: `${color.bg} ${color.text}`,
      start_date: startDate,
      end_date: endDate || undefined,
    })

    setNewHabitName("")
    setSelectedColor(0)
    setStartDate(new Date().toISOString().split("T")[0])
    setEndDate("")
    setIsAddDialogOpen(false)
    loadData()
  }

  async function updateHabit() {
    if (!editingHabit || !newHabitName.trim()) return

    const color = habitColors[selectedColor]
    await updateEntity(db.habits, editingHabit.id, {
      name: newHabitName.trim(),
      color: `${color.bg} ${color.text}`,
      start_date: startDate,
      end_date: endDate || undefined,
    })

    setNewHabitName("")
    setEditingHabit(null)
    setIsEditDialogOpen(false)
    loadData()
  }

  async function deleteHabit() {
    if (!editingHabit) return
    
    await deleteEntity(db.habits, editingHabit.id)
    
    // Удаляем связанные логи и streaks
    const relatedLogs = habitLogs.filter(l => l.habit_id === editingHabit.id)
    for (const log of relatedLogs) {
      await db.habitLogs.delete(log.id)
    }
    
    const relatedStreaks = streaks.filter(s => s.habit_id === editingHabit.id)
    for (const streak of relatedStreaks) {
      await db.streaks.delete(streak.id)
    }

    setNewHabitName("")
    setEditingHabit(null)
    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    loadData()
  }

  function openEditDialog(habit: Habit) {
    setEditingHabit(habit)
    setNewHabitName(habit.name)
    // Найти индекс цвета
    const colorIndex = habitColors.findIndex(c => habit.color?.includes(c.bg))
    setSelectedColor(colorIndex >= 0 ? colorIndex : 0)
    setStartDate(habit.start_date || new Date().toISOString().split("T")[0])
    setEndDate(habit.end_date || "")
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
      })
    } else {
      await createEntity(db.habitLogs, {
        habit_id: habitId,
        date: today,
        completed: true,
      })
    }

    await updateStreak(habitId, !existingLog?.completed)
    loadData()
  }

  function getStreak(habitId: string): Streak | undefined {
    return streaks.find((s) => s.habit_id === habitId)
  }

  function isHabitCompletedToday(habitId: string): boolean {
    const today = new Date().toISOString().split("T")[0]
    return habitLogs.some(
      (l) => l.habit_id === habitId && l.date.startsWith(today) && l.completed
    )
  }

  function getWeekCompletion(habitId: string): { date: string; completed: boolean; isToday: boolean; isWeekend: boolean }[] {
    const result: { date: string; completed: boolean; isToday: boolean; isWeekend: boolean }[] = []
    const today = new Date()
    const dayOfWeek = (today.getDay() + 6) % 7 // Понедельник = 0, Воскресенье = 6
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - dayOfWeek + i) // Начинаем с понедельника
      const dateStr = date.toISOString().split("T")[0]
      const completed = habitLogs.some(
        (l) => l.habit_id === habitId && l.date.startsWith(dateStr) && l.completed
      )
      result.push({
        date: dateStr,
        completed,
        isToday: i === dayOfWeek,
        isWeekend: i >= 5, // Сб и Вс
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
        {/* Summary */}
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

        {/* Habits List */}
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
              const weekCompletion = getWeekCompletion(habit.id)
              const daysSinceStart = getDaysSinceStart(habit)
              const daysUntilEnd = getDaysUntilEnd(habit)

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
                        ) : (
                          <X className="h-6 w-6 text-muted-foreground" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <h3 className="font-medium">{habit.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {streak && streak.current_streak > 0 && (
                            <>
                              <Flame className="h-4 w-4 text-orange-500" />
                              <span>{streak.current_streak} дней</span>
                            </>
                          )}
                          <span className="text-xs">
                            {daysSinceStart} день
                          </span>
                          {daysUntilEnd !== null && (
                            <span className={`text-xs ${daysUntilEnd <= 7 ? "text-orange-500" : ""}`}>
                              • {daysUntilEnd > 0 ? `${daysUntilEnd} дн. осталось` : "Завершена"}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(habit)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Week view - starting from Monday */}
                    <div className="flex justify-between">
                      {weekCompletion.map((day, i) => (
                        <div
                          key={i}
                          className="flex flex-col items-center gap-1"
                        >
                          <span className={`text-xs ${day.isWeekend ? "text-orange-500/70" : "text-muted-foreground"}`}>
                            {dayNames[i]}
                          </span>
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              day.completed
                                ? "bg-green-500 text-white"
                                : day.isToday
                                ? "border-2 border-dashed border-muted-foreground/30"
                                : day.isWeekend
                                ? "bg-orange-500/10"
                                : "bg-muted"
                            }`}
                          >
                            {day.completed && <Check className="h-4 w-4" />}
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
                  setNewHabitName("")
                  setSelectedColor(0)
                  setStartDate(new Date().toISOString().split("T")[0])
                  setEndDate("")
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая привычка</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder="Например: Утренняя зарядка"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addHabit()}
                />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={addHabit}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
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
                  onKeyDown={(e) => e.key === "Enter" && updateHabit()}
                />
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={updateHabit}>Сохранить</Button>
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
              <DialogTitle>Удалить привычку?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              Вы уверены, что хотите удалить привычку "{editingHabit?.name}"? Это действие нельзя отменить.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={deleteHabit}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}