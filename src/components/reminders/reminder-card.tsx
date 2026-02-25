"use client"

import { useRouter } from "next/navigation"
import { Bell, BellOff, Clock, Calendar, Settings, Check, X, ChevronRight, Flame } from "lucide-react"
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
  
  const typeConfig = reminderTypesConfig.find((t) => t.type === reminder.type)
  const priorityConf = priorityConfig.find((p) => p.value === reminder.priority)

  const daysDisplay = reminder.days.length === 7
    ? "Каждый день"
    : reminder.days.length === 5 && !reminder.days.includes(0) && !reminder.days.includes(6)
    ? "По будням"
    : reminder.days.length === 2 && reminder.days.includes(0) && reminder.days.includes(6)
    ? "По выходным"
    : reminder.days.map((d) => dayNames[d]).join(", ")

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
            
            {/* Время и дни */}
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3" />
              <span>{reminder.time}</span>
              {reminder.advance_minutes && reminder.advance_minutes > 0 && (
                <span className="text-xs">
                  (за {reminder.advance_minutes >= 60 
                    ? `${reminder.advance_minutes / 60} ч` 
                    : `${reminder.advance_minutes} мин`})
                </span>
              )}
              <span className="text-xs">• {daysDisplay}</span>
            </div>

            {/* Сообщение */}
            {reminder.message && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {reminder.message}
              </p>
            )}

            {/* Даты курса */}
            {(reminder.start_date || reminder.end_date) && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {reminder.start_date && (
                  <span>с {new Date(reminder.start_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                )}
                {reminder.end_date && (
                  <span>по {new Date(reminder.end_date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                )}
              </div>
            )}

            {/* Статистика */}
            {(reminder.streak !== undefined && reminder.streak > 0) && (
              <div className="flex items-center gap-1 mt-2">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">
                  {reminder.streak} дней подряд
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
            </div>
          </div>

          {/* Действия */}
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComplete(reminder)}
              title="Выполнено"
            >
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleActive}
              title={reminder.is_active ? "Отключить" : "Включить"}
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
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}