"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  BellOff,
  Clock,
  Calendar,
  Settings,
  Check,
  X,
  ChevronRight,
  Flame,
  CheckCircle2,
} from "@/lib/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db, updateEntity } from "@/lib/db"
import { reminderTypesConfig, priorityConfig } from "./reminder-form"
import type { Reminder } from "@/types"

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

interface ReminderCardProps {
  reminder: Reminder
  onEdit: (reminder: Reminder) => void
  onComplete: (reminder: Reminder) => void
  onRefresh: () => void
}

export function ReminderCard({ reminder, onEdit, onComplete, onRefresh }: ReminderCardProps) {
  const router = useRouter()
  const [completedToday, setCompletedToday] = useState(0)

  // Максимальное количество выполнений = основное время + дополнительные времена
  const maxCompletionsPerDay = 1 + ((reminder as any).times?.length || 0)
  const isLimitReached = completedToday >= maxCompletionsPerDay

  // Загружаем количество выполнений за сегодня
  useEffect(() => {
    async function loadTodayCompletions() {
      const today = new Date().toISOString().split("T")[0]
      const logs = await db.reminderLogs
        .where("reminder_id")
        .equals(reminder.id)
        .filter((log) => {
          const logDate = log.triggered_at.split("T")[0]
          return logDate === today && log.action === "completed"
        })
        .toArray()
      setCompletedToday(logs.length)
    }
    loadTodayCompletions()
  }, [reminder.id, reminder.last_completed_at])

  const typeConfig = reminderTypesConfig.find((t) => t.type === reminder.type)
  const priorityConf = priorityConfig.find((p) => p.value === reminder.priority)

  // Формируем отображение повторяемости
  const getRepeatDisplay = () => {
    const repeatType = reminder.repeat_type || "none"

    switch (repeatType) {
      case "none":
        return "Один раз"
      case "daily":
        return "Каждый день"
      case "weekly":
        if (reminder.days.length === 7) return "Каждый день"
        if (reminder.days.length === 5 && !reminder.days.includes(0) && !reminder.days.includes(6))
          return "По будням"
        if (reminder.days.length === 2 && reminder.days.includes(0) && reminder.days.includes(6))
          return "По выходным"
        return reminder.days.map((d) => dayNames[d]).join(", ")
      case "monthly":
        return `Каждое ${(reminder as any).monthly_day || 1}-е число`
      case "custom":
        const interval = reminder.repeat_interval || 1
        const unit = (reminder as any).custom_unit || "days"
        const unitLabels: Record<string, string> = {
          hours: interval === 1 ? "час" : interval <= 4 ? "часа" : "часов",
          days: interval === 1 ? "день" : interval <= 4 ? "дня" : "дней",
          weeks: interval === 1 ? "неделю" : "недель",
          months: interval === 1 ? "месяц" : interval <= 4 ? "месяца" : "месяцев",
        }
        return `Каждые ${interval} ${unitLabels[unit]}`
      default:
        return reminder.days.map((d) => dayNames[d]).join(", ")
    }
  }

  const repeatDisplay = getRepeatDisplay()

  async function toggleActive() {
    await updateEntity(db.reminders, reminder.id, {
      is_active: !reminder.is_active,
    })
    onRefresh()
  }

  function handleClick() {
    // Если есть связь с элементом, переходим к нему
    if (reminder.related_type === "item" && reminder.related_id) {
      // Определяем тип элемента для роутинга
      router.push(`/items/vitamin/${reminder.related_id}`)
    }
  }

  const isOverdue = () => {
    if (!reminder.end_date) return false
    return new Date(reminder.end_date) < new Date()
  }

  return (
    <Card
      className={`group ${!reminder.is_active ? "opacity-60" : ""} ${
        isOverdue() ? "border-destructive" : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Иконка типа */}
          <div className="text-2xl mt-1">{typeConfig?.icon || "🔔"}</div>

          {/* Основной контент */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium truncate ${
                  reminder.related_id ? "cursor-pointer hover:text-primary" : ""
                }`}
                onClick={handleClick}
              >
                {reminder.title}
              </span>
              {/* Приоритет */}
              <span className={`w-2 h-2 rounded-full ${priorityConf?.color}`} />
            </div>

            {/* Время и повторяемость */}
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              <span>{reminder.time}</span>
              {reminder.advance_minutes && reminder.advance_minutes > 0 && (
                <span className="text-xs">
                  (за{" "}
                  {reminder.advance_minutes >= 60
                    ? `${reminder.advance_minutes / 60} ч`
                    : `${reminder.advance_minutes} мин`}
                  )
                </span>
              )}
              <span className="text-xs">• {repeatDisplay}</span>
            </div>

            {/* Сообщение */}
            {reminder.message && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{reminder.message}</p>
            )}

            {/* Даты курса */}
            {(reminder.start_date || reminder.end_date) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {reminder.start_date && (
                  <span>
                    с{" "}
                    {new Date(reminder.start_date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
                {reminder.end_date && (
                  <span>
                    по{" "}
                    {new Date(reminder.end_date).toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            )}

            {/* Статистика */}
            {reminder.streak !== undefined && reminder.streak > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">
                  {reminder.streak} дней подряд
                </span>
              </div>
            )}

            {/* Прогресс выполнения за сегодня */}
            {maxCompletionsPerDay > 1 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  {Array.from({ length: maxCompletionsPerDay }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < completedToday
                          ? "bg-green-500 border-green-500"
                          : "border-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {completedToday}/{maxCompletionsPerDay}
                </span>
              </div>
            )}

            {/* Метки */}
            <div className="flex flex-wrap gap-1 mt-2">
              {reminder.persistent && (
                <Badge variant="outline" className="text-xs">
                  Назойливый
                </Badge>
              )}
              {isOverdue() && (
                <Badge variant="destructive" className="text-xs">
                  Курс завершён
                </Badge>
              )}
              {isLimitReached && (
                <Badge variant="default" className="text-xs bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Выполнено
                </Badge>
              )}
            </div>
          </div>

          {/* Действия */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComplete(reminder)}
              disabled={isLimitReached}
              title={isLimitReached ? "Лимит выполнений достигнут" : "Выполнено"}
              aria-label={isLimitReached ? "Лимит выполнений достигнут" : "Выполнено"}
            >
              <Check
                className={`h-4 w-4 ${isLimitReached ? "text-muted-foreground" : "text-green-500"}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActive}
              title={reminder.is_active ? "Отключить" : "Включить"}
              aria-label={reminder.is_active ? "Отключить напоминание" : "Включить напоминание"}
            >
              {reminder.is_active ? (
                <Bell className="h-4 w-4 text-blue-500" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(reminder)}
              title="Настройки"
              aria-label="Настройки напоминания"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
