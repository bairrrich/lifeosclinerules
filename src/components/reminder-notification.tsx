"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, X, Check, Clock } from "@/lib/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db, updateEntity, createEntity } from "@/lib/db"
import type { Reminder } from "@/types"

interface ActiveNotification {
  reminder: Reminder
  timeLabel: string
  id: string
}

export function ReminderNotification() {
  const [notifications, setNotifications] = useState<ActiveNotification[]>([])
  const lastCheckedMinuteRef = useRef<string>("")
  const isMountedRef = useRef(true)

  // Удалить уведомление
  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Отметить как выполненное
  const handleComplete = useCallback(
    async (notification: ActiveNotification) => {
      const now = new Date().toISOString()
      const today = now.split("T")[0]
      const reminder = notification.reminder
      const maxCompletionsPerDay = 1 + ((reminder as any).times?.length || 0)

      // Проверяем, сколько раз уже выполнено сегодня
      const todayCompletedLogs = await db.reminderLogs
        .where("reminder_id")
        .equals(reminder.id)
        .filter((log) => {
          const logDate = log.triggered_at.split("T")[0]
          return logDate === today && log.action === "completed"
        })
        .toArray()

      // Если лимит достигнут - просто закрываем уведомление
      if (todayCompletedLogs.length >= maxCompletionsPerDay) {
        console.log(`[ReminderNotification] ${reminder.title}: already completed, not creating log`)
        dismissNotification(notification.id)
        return
      }

      // Создаём лог выполнения
      await createEntity(db.reminderLogs, {
        reminder_id: reminder.id,
        triggered_at: now,
        scheduled_at: `${today}T${reminder.time}:00`,
        action: "completed",
      })

      // Обновляем статистику
      const newStreak = (reminder.streak || 0) + 1
      const newLongestStreak = Math.max(reminder.longest_streak || 0, newStreak)

      await updateEntity(db.reminders, reminder.id, {
        last_completed_at: now,
        streak: newStreak,
        longest_streak: newLongestStreak,
        total_completed: (reminder.total_completed || 0) + 1,
      })

      dismissNotification(notification.id)
    },
    [dismissNotification]
  )

  // Отложить на 5 минут
  const handleSnooze = useCallback(
    async (notification: ActiveNotification) => {
      const now = new Date()
      now.setMinutes(now.getMinutes() + 5)
      const snoozeTime = now.toISOString()

      await createEntity(db.reminderLogs, {
        reminder_id: notification.reminder.id,
        triggered_at: new Date().toISOString(),
        scheduled_at: snoozeTime,
        action: "snoozed",
        snooze_duration: 5,
      })

      dismissNotification(notification.id)
    },
    [dismissNotification]
  )

  // Проверка напоминаний
  const checkReminders = useCallback(async () => {
    const now = new Date()
    const currentMinute = `${now.getHours()}:${now.getMinutes()}`

    // Проверяем каждую минуту только один раз
    if (lastCheckedMinuteRef.current === currentMinute) return
    lastCheckedMinuteRef.current = currentMinute

    try {
      // Загружаем все напоминания и фильтруем вручную
      const allReminders = await db.reminders.toArray()
      const reminders = allReminders.filter((r) => r.is_active === true) as Reminder[]

      const today = now.toISOString().split("T")[0]
      const currentDay = now.getDay()
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeInMinutes = currentHours * 60 + currentMinutes

      console.log(
        `[ReminderNotification] Checking at ${currentHours}:${currentMinutes}, found ${reminders.length} active reminders`
      )

      for (const reminder of reminders) {
        // Проверяем день недели
        if (!reminder.days.includes(currentDay)) {
          console.log(`[ReminderNotification] ${reminder.title}: wrong day`)
          continue
        }
        // Проверяем даты курса
        if (reminder.start_date && today < reminder.start_date) {
          console.log(`[ReminderNotification] ${reminder.title}: before start date`)
          continue
        }
        if (reminder.end_date && today > reminder.end_date) {
          console.log(`[ReminderNotification] ${reminder.title}: after end date`)
          continue
        }

        const checkTime = (timeStr: string): boolean => {
          const [hours, minutes] = timeStr.split(":").map(Number)
          const reminderTimeInMinutes = hours * 60 + minutes - (reminder.advance_minutes || 0)
          return currentTimeInMinutes === reminderTimeInMinutes
        }

        const times = [reminder.time, ...((reminder as any).times || [])]
        const maxCompletionsPerDay = 1 + ((reminder as any).times?.length || 0)

        // Проверяем, сколько раз уже выполнено сегодня
        const todayCompletedLogs = await db.reminderLogs
          .where("reminder_id")
          .equals(reminder.id)
          .filter((log) => {
            const logDate = log.triggered_at.split("T")[0]
            return logDate === today && log.action === "completed"
          })
          .toArray()

        // Если лимит выполнений достигнут - не показываем уведомление
        if (todayCompletedLogs.length >= maxCompletionsPerDay) {
          console.log(
            `[ReminderNotification] ${reminder.title}: already completed ${todayCompletedLogs.length}/${maxCompletionsPerDay} times today`
          )
          continue
        }

        for (const time of times) {
          if (checkTime(time)) {
            const notificationId = `${reminder.id}-${time}-${today}`

            console.log(`[ReminderNotification] TRIGGER: ${reminder.title} at ${time}`)

            // Проверяем, не показано ли уже
            setNotifications((prev) => {
              if (prev.some((n) => n.id === notificationId)) return prev
              return [...prev, { reminder, timeLabel: time, id: notificationId }]
            })

            // Логируем срабатывание
            const existingLogs = await db.reminderLogs
              .where("reminder_id")
              .equals(reminder.id)
              .filter((log) => log.action === "triggered" && log.triggered_at.startsWith(today))
              .toArray()

            if (!existingLogs.some((l) => l.scheduled_at.includes(time))) {
              await createEntity(db.reminderLogs, {
                reminder_id: reminder.id,
                triggered_at: new Date().toISOString(),
                scheduled_at: `${today}T${time}:00`,
                action: "triggered",
              })
            }
          }
        }
      }
    } catch (error) {
      console.error("[ReminderNotification] Error checking reminders:", error)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true

    // Первая проверка сразу
    checkReminders()

    // Периодическая проверка каждые 10 секунд для более точного срабатывания
    const interval = setInterval(checkReminders, 10000)

    return () => {
      isMountedRef.current = false
      clearInterval(interval)
    }
  }, [checkReminders])

  if (notifications.length === 0) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => {
        const reminder = notification.reminder
        const typeIcons: Record<string, string> = {
          habit: "🎯",
          medicine: "💊",
          water: "💧",
          workout: "💪",
          food: "🍽️",
          item: "📦",
          custom: "🔔",
        }

        return (
          <Card
            key={notification.id}
            className="bg-background/95 backdrop-blur shadow-lg border-primary/20 animate-in slide-in-from-right-2 fade-in duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{typeIcons[reminder.type] || "🔔"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{reminder.title}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-auto"
                      onClick={() => dismissNotification(notification.id)}
                      aria-label="Закрыть уведомление"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  {reminder.message && (
                    <p className="text-xs text-muted-foreground mt-1">{reminder.message}</p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{notification.timeLabel}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="flex-1" onClick={() => handleComplete(notification)}>
                  <Check className="h-4 w-4 mr-1" />
                  Выполнено
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSnooze(notification)}>
                  <Clock className="h-4 w-4 mr-1" />
                  Через 5 мин
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
