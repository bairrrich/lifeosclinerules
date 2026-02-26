"use client"

import { useEffect, useRef, useCallback } from "react"
import { db } from "@/lib/db"
import type { Reminder } from "@/types"

const CHECK_INTERVAL = 30000 // Проверка каждые 30 секунд
const NOTIFICATION_TAG_PREFIX = "reminder-"

export function useNotifications() {
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastCheckedMinuteRef = useRef<string>("")

  // Запрос разрешения на уведомления
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.log("Браузер не поддерживает уведомления")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }

    return false
  }, [])

  // Показать уведомление
  const showNotification = useCallback(
    async (reminder: Reminder, timeLabel: string) => {
      const hasPermission = await requestPermission()
      if (!hasPermission) return

      const typeConfig: Record<string, string> = {
        habit: "🎯",
        medicine: "💊",
        water: "💧",
        workout: "💪",
        food: "🍽️",
        item: "📦",
        custom: "🔔",
      }

      const notification = new Notification(
        `${typeConfig[reminder.type] || "🔔"} ${reminder.title}`,
        {
          body: reminder.message || `Напоминание на ${timeLabel}`,
          icon: "/icons/icon-192.svg",
          badge: "/icons/icon-192.svg",
          tag: `${NOTIFICATION_TAG_PREFIX}${reminder.id}-${timeLabel}`,
          requireInteraction: reminder.persistent, // Не исчезает пока пользователь не взаимодействует
          vibrate: reminder.vibration ? [200, 100, 200] : undefined,
          data: {
            reminderId: reminder.id,
            url: "/reminders",
          },
        }
      )

      notification.onclick = () => {
        window.focus()
        window.location.href = "/reminders"
        notification.close()
      }

      // Записываем лог срабатывания
      await db.reminderLogs.add({
        id: crypto.randomUUID(),
        reminder_id: reminder.id,
        triggered_at: new Date().toISOString(),
        scheduled_at: `${new Date().toISOString().split("T")[0]}T${reminder.time}:00`,
        action: "triggered",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    },
    [requestPermission]
  )

  // Проверка, должно ли сработать напоминание сейчас
  const shouldTrigger = useCallback((reminder: Reminder, now: Date): { shouldShow: boolean; timeLabel: string } | null => {
    // Проверяем активность
    if (!reminder.is_active) return null

    // Проверяем дни недели
    const currentDay = now.getDay()
    if (!reminder.days.includes(currentDay)) return null

    // Проверяем даты курса
    const today = now.toISOString().split("T")[0]
    if (reminder.start_date && today < reminder.start_date) return null
    if (reminder.end_date && today > reminder.end_date) return null

    // Текущее время в минутах от полуночи
    const currentHours = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTimeInMinutes = currentHours * 60 + currentMinutes

    // Функция для проверки времени
    const checkTime = (timeStr: string, label: string): boolean => {
      const [hours, minutes] = timeStr.split(":").map(Number)
      const reminderTimeInMinutes = hours * 60 + minutes - (reminder.advance_minutes || 0)

      // Проверяем совпадение с точностью до минуты
      return currentTimeInMinutes === reminderTimeInMinutes
    }

    // Проверяем основное время
    if (checkTime(reminder.time, reminder.time)) {
      return { shouldShow: true, timeLabel: reminder.time }
    }

    // Проверяем дополнительные времена
    const additionalTimes = (reminder as any).times as string[] | undefined
    if (additionalTimes) {
      for (const time of additionalTimes) {
        if (checkTime(time, time)) {
          return { shouldShow: true, timeLabel: time }
        }
      }
    }

    return null
  }, [])

  // Основная функция проверки напоминаний
  const checkReminders = useCallback(async () => {
    const now = new Date()
    
    // Проверяем каждую минуту только один раз
    const currentMinute = `${now.getHours()}:${now.getMinutes()}`
    if (lastCheckedMinuteRef.current === currentMinute) {
      return
    }
    lastCheckedMinuteRef.current = currentMinute

    // Загружаем активные напоминания
    const reminders = await db.reminders
      .where("is_active")
      .equals(1)
      .toArray() as Reminder[]

    for (const reminder of reminders) {
      const trigger = shouldTrigger(reminder, now)
      if (trigger) {
        // Проверяем, не показывали ли уже уведомление для этого времени сегодня
        const today = now.toISOString().split("T")[0]
        const existingLogs = await db.reminderLogs
          .where("reminder_id")
          .equals(reminder.id)
          .filter((log) => {
            const logDate = log.triggered_at.split("T")[0]
            return logDate === today && log.action === "triggered"
          })
          .toArray()

        // Проверяем, было ли уже уведомление для этого конкретного времени
        const alreadyTriggeredForTime = existingLogs.some((log) => {
          return log.scheduled_at.includes(trigger.timeLabel)
        })

        if (!alreadyTriggeredForTime) {
          await showNotification(reminder, trigger.timeLabel)
        }
      }
    }
  }, [shouldTrigger, showNotification])

  // Запуск периодической проверки
  const startChecking = useCallback(() => {
    if (checkIntervalRef.current) return

    // Первая проверка сразу
    checkReminders()

    // Периодическая проверка
    checkIntervalRef.current = setInterval(checkReminders, CHECK_INTERVAL)
  }, [checkReminders])

  // Остановка проверки
  const stopChecking = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
      checkIntervalRef.current = null
    }
  }, [])

  // Автозапуск при монтировании
  useEffect(() => {
    requestPermission()
    startChecking()

    return () => {
      stopChecking()
    }
  }, [requestPermission, startChecking, stopChecking])

  return {
    requestPermission,
    showNotification,
    checkReminders,
    startChecking,
    stopChecking,
    hasPermission: typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted",
  }
}