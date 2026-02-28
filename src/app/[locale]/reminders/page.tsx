"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "@/lib/navigation"
import {
  Plus,
  Bell,
  Trash2,
  Clock,
  CheckCircle2,
  Filter,
  BarChart3,
  X,
  Check,
  AlertTriangle,
} from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FormActions,
  CreateFormActions,
  DeleteConfirmActions,
} from "@/components/shared/form-actions"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import {
  ReminderForm,
  ReminderCard,
  reminderTypesConfig,
  getDefaultFormData,
  type ReminderFormData,
} from "@/components/reminders"
import { toast } from "@/components/ui/toast"
import { useTranslations, useLocale } from "next-intl"
import type { Reminder, ReminderType, ReminderPriority, ReminderLog } from "@/types"

type SmartFilter = "all" | "today" | "active" | "completed" | "inactive" | "overdue"

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

export default function RemindersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <RemindersContent />
    </Suspense>
  )
}

function RemindersContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("reminders")
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [selectedReminderForStats, setSelectedReminderForStats] = useState<Reminder | null>(null)
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([])

  const [formData, setFormData] = useState(getDefaultFormData())

  useEffect(() => {
    loadData()
  }, [])

  // Открыть диалог добавления если передан параметр add=true
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsAddDialogOpen(true)
    }
  }, [searchParams])

  async function loadData() {
    try {
      await initializeDatabase()
      const data = await db.reminders.orderBy("time").toArray()
      setReminders(data)
    } catch (error) {
      console.error("Failed to load reminders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function addReminder() {
    if (!formData.title.trim()) return

    await createEntity(db.reminders, {
      type: formData.type,
      title: formData.title.trim(),
      message: formData.message || undefined,
      time: formData.time,
      date: formData.date, // Дата напоминания
      days: formData.days,
      priority: formData.priority,
      advance_minutes: formData.advance_minutes || undefined,
      repeat_type: formData.repeat_type,
      repeat_interval: formData.repeat_interval,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      is_active: true,
      sound: formData.sound,
      vibration: formData.vibration,
      persistent: formData.persistent,
      related_id: formData.related_id,
      related_type: formData.related_type,
      custom_unit: formData.custom_unit,
      monthly_day: formData.monthly_day,
      times: formData.times,
      streak: 0,
      longest_streak: 0,
      total_completed: 0,
    })

    setIsAddDialogOpen(false)
    resetForm()
    loadData()
  }

  async function updateReminder() {
    if (!editingReminder || !formData.title.trim()) return

    await updateEntity(db.reminders, editingReminder.id, {
      type: formData.type,
      title: formData.title.trim(),
      message: formData.message || undefined,
      time: formData.time,
      date: formData.date, // Дата напоминания
      days: formData.days,
      priority: formData.priority,
      advance_minutes: formData.advance_minutes || undefined,
      repeat_type: formData.repeat_type,
      repeat_interval: formData.repeat_interval,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      sound: formData.sound,
      vibration: formData.vibration,
      persistent: formData.persistent,
      related_id: formData.related_id,
      related_type: formData.related_type,
      custom_unit: formData.custom_unit,
      monthly_day: formData.monthly_day,
      times: formData.times,
    })

    setIsEditDialogOpen(false)
    setEditingReminder(null)
    resetForm()
    loadData()
  }

  async function deleteReminder() {
    if (!editingReminder) return

    await deleteEntity(db.reminders, editingReminder.id)

    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingReminder(null)
    resetForm()
    loadData()
  }

  async function completeReminder(reminder: Reminder) {
    const now = new Date().toISOString()
    const today = now.split("T")[0]

    // Проверяем лимит выполнений на сегодня
    const todayLogs = await db.reminderLogs
      .where("reminder_id")
      .equals(reminder.id)
      .filter((log) => {
        const logDate = log.triggered_at.split("T")[0]
        return logDate === today && log.action === "completed"
      })
      .toArray()

    // Максимальное количество выполнений = основное время + дополнительные времена
    const maxCompletionsPerDay = 1 + ((reminder as any).times?.length || 0)

    if (todayLogs.length >= maxCompletionsPerDay) {
      // Лимит достигнут - показываем уведомление
      toast.info(`Уже выполнено ${maxCompletionsPerDay}/${maxCompletionsPerDay} раз(а) сегодня`)
      return
    }

    // Создаём лог выполнения
    await createEntity(db.reminderLogs, {
      reminder_id: reminder.id,
      triggered_at: now,
      scheduled_at: `${today}T${reminder.time}:00`,
      action: "completed",
    })

    // Обновляем серию
    let newStreak = (reminder.streak || 0) + 1
    let newLongestStreak = Math.max(reminder.longest_streak || 0, newStreak)

    await updateEntity(db.reminders, reminder.id, {
      last_completed_at: now,
      streak: newStreak,
      longest_streak: newLongestStreak,
      total_completed: (reminder.total_completed || 0) + 1,
    })

    // Показываем уведомление об успехе
    const completedCount = todayLogs.length + 1
    if (completedCount >= maxCompletionsPerDay) {
      toast.success(`${reminder.title} — выполнено! Все ${maxCompletionsPerDay} на сегодня ✅`)
    } else {
      toast.success(`${reminder.title} — выполнено (${completedCount}/${maxCompletionsPerDay})`)
    }

    loadData()
  }

  async function showReminderStats(reminder: Reminder) {
    const logs = await db.reminderLogs.where("reminder_id").equals(reminder.id).toArray()

    setSelectedReminderForStats(reminder)
    setReminderLogs(logs.sort((a, b) => b.triggered_at.localeCompare(a.triggered_at)))
    setIsStatsDialogOpen(true)
  }

  function resetForm() {
    setFormData(getDefaultFormData())
  }

  function openEditDialog(reminder: Reminder) {
    setEditingReminder(reminder)
    setFormData({
      title: reminder.title,
      message: reminder.message || "",
      type: reminder.type,
      time: reminder.time,
      date: (reminder as any).date || new Date().toISOString().split("T")[0],
      days: reminder.days,
      priority: reminder.priority,
      advance_minutes: reminder.advance_minutes || 0,
      repeat_type: reminder.repeat_type || "none",
      repeat_interval: reminder.repeat_interval || 1,
      start_date: reminder.start_date || "",
      end_date: reminder.end_date || "",
      sound: reminder.sound ?? true,
      vibration: reminder.vibration ?? true,
      persistent: reminder.persistent ?? false,
      related_id: reminder.related_id || undefined,
      related_type: reminder.related_type || undefined,
      custom_unit: (reminder as any).custom_unit || "days",
      monthly_day: (reminder as any).monthly_day || new Date().getDate(),
      times: (reminder as any).times || [],
    })
    setIsEditDialogOpen(true)
  }

  // Проверка, просрочено ли напоминание
  function isOverdue(reminder: Reminder): boolean {
    if (!reminder.is_active) return false

    const now = new Date()
    const todayStr = now.toISOString().split("T")[0]
    const currentTime = now.toTimeString().slice(0, 5)

    // Для одиночных напоминаний (без повтора)
    if (reminder.repeat_type === "none" && (reminder as any).date) {
      const reminderDate = (reminder as any).date
      // Если дата прошла или сегодня но время прошло
      if (reminderDate < todayStr) return true
      if (reminderDate === todayStr && reminder.time < currentTime) {
        // Проверяем, было ли выполнено сегодня
        if (!reminder.last_completed_at?.startsWith(todayStr)) return true
      }
      return false
    }

    // Для повторяющихся напоминаний - проверяем было ли выполнено сегодня
    if (reminder.days.includes(now.getDay())) {
      // Если время уже прошло и не выполнено сегодня
      if (reminder.time < currentTime && !reminder.last_completed_at?.startsWith(todayStr)) {
        return true
      }
    }

    return false
  }

  // Фильтрация напоминаний
  const filteredReminders = reminders.filter((reminder) => {
    const today = new Date()
    const todayDay = today.getDay()
    const todayStr = today.toISOString().split("T")[0]

    switch (smartFilter) {
      case "today":
        // Активные напоминания на сегодня (по дню недели или дате)
        if (!reminder.is_active) return false
        if (reminder.repeat_type === "none" && (reminder as any).date) {
          return (reminder as any).date === todayStr
        }
        return reminder.days.includes(todayDay)
      case "active":
        return reminder.is_active
      case "inactive":
        return !reminder.is_active
      case "completed":
        // Показываем напоминания, которые были выполнены сегодня
        return reminder.last_completed_at?.startsWith(todayStr)
      case "overdue":
        // Просроченные напоминания
        return isOverdue(reminder)
      default:
        return true
    }
  })

  // Группировка по типу
  const groupedReminders = filteredReminders.reduce(
    (acc, reminder) => {
      const type = reminder.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(reminder)
      return acc
    },
    {} as Record<ReminderType, Reminder[]>
  )

  // Статистика
  const stats = {
    total: reminders.length,
    active: reminders.filter((r) => r.is_active).length,
    today: reminders.filter((r) => {
      const todayStr = new Date().toISOString().split("T")[0]
      if (!r.is_active) return false
      if (r.repeat_type === "none" && (r as any).date) {
        return (r as any).date === todayStr
      }
      return r.days.includes(new Date().getDay())
    }).length,
    completedToday: reminders.filter((r) => {
      const todayStr = new Date().toISOString().split("T")[0]
      return r.last_completed_at?.startsWith(todayStr)
    }).length,
    overdue: reminders.filter((r) => isOverdue(r)).length,
    inactive: reminders.filter((r) => !r.is_active).length,
  }

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.active")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.today}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.today")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.completedToday}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.completed")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card
            className={stats.overdue > 0 ? "border-red-500 cursor-pointer" : ""}
            onClick={() => stats.overdue > 0 && setSmartFilter("overdue")}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.overdue")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">{t("stats.total")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={smartFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("all")}
          >
            {t("filters.all")} ({stats.total})
          </Button>
          <Button
            variant={smartFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("today")}
          >
            {t("filters.today")} ({stats.today})
          </Button>
          <Button
            variant={smartFilter === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("active")}
          >
            {t("filters.active")} ({stats.active})
          </Button>
          <Button
            variant={smartFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("completed")}
          >
            {t("filters.completed")} ({stats.completedToday})
          </Button>
          <Button
            variant={smartFilter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("overdue")}
            className={smartFilter === "overdue" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            {t("filters.overdue")} ({stats.overdue})
          </Button>
          <Button
            variant={smartFilter === "inactive" ? "default" : "outline"}
            size="sm"
            onClick={() => setSmartFilter("inactive")}
          >
            {t("filters.inactive")} ({stats.inactive})
          </Button>
        </div>

        {/* Reminders List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("empty.loading")}
            </CardContent>
          </Card>
        ) : filteredReminders.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {smartFilter === "all" ? t("empty.noReminders") : t("empty.noCategory")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedReminders).map(([type, typeReminders]) => (
              <div key={type}>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>{reminderTypesConfig(t).find((t) => t.type === type)?.icon}</span>
                  <span>{t(`types.${type}`)}</span>
                  <Badge variant="secondary" className="ml-2">
                    {typeReminders.length}
                  </Badge>
                </h2>
                <div className="flex flex-col gap-2">
                  {typeReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onEdit={openEditDialog}
                      onComplete={completeReminder}
                      onRefresh={loadData}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{t("dialogs.newTitle")}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 overflow-x-hidden">
              <ReminderForm formData={formData} setFormData={setFormData} />
            </div>
            <CreateFormActions
              onCancel={() => setIsAddDialogOpen(false)}
              onSave={addReminder}
              saveText={t("add")}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">{t("dialogs.editTitle")}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 overflow-x-hidden">
              <ReminderForm formData={formData} setFormData={setFormData} />
            </div>
            <FormActions
              type="dialog"
              showDelete
              onDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSave={updateReminder}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.deleteTitle")}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              {t.rich("dialogs.deleteConfirm", { title: editingReminder?.title || "" })}
            </p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteReminder}
            />
          </DialogContent>
        </Dialog>

        {/* Stats Dialog */}
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t.rich("dialogs.statsTitle", { title: selectedReminderForStats?.title || "" })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReminderForStats && (
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {selectedReminderForStats.streak || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("statsLabels.streak")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {selectedReminderForStats.longest_streak || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("statsLabels.best")}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {selectedReminderForStats.total_completed || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">{t("statsLabels.total")}</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {reminderLogs.length > 0 ? (
                <div>
                  <h3 className="font-medium mb-2">{t("history")}</h3>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {reminderLogs.slice(0, 20).map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between text-sm p-2 rounded bg-muted"
                      >
                        <span>
                          {new Date(log.triggered_at).toLocaleDateString(locale, {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge variant={log.action === "completed" ? "default" : "secondary"}>
                          {log.action === "completed" ? t("completed") : log.action}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("historyEmpty")}</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
