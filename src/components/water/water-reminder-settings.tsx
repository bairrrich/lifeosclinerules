"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Bell, BellOff, Clock, Droplet } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db } from "@/lib/db"
import type { Reminder } from "@/types"
import { useNotifications } from "@/hooks/use-notifications"

interface WaterReminderSettingsProps {
  onReminderChange?: () => void
}

export function WaterReminderSettings({ onReminderChange }: WaterReminderSettingsProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [interval, setInterval] = useState(60) // минут
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("22:00")
  const [reminder, setReminder] = useState<Reminder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { hasPermission, requestPermission } = useNotifications()
  const t = useTranslations("water")

  useEffect(() => {
    loadReminder()
  }, [])

  async function loadReminder() {
    try {
      const existing = await db.reminders
        .where("type")
        .equals("water")
        .filter((r) => r.title === t("reminder.waterReminderTitle"))
        .first()

      if (existing) {
        setReminder(existing)
        setIsEnabled(existing.is_active)
        // Парсим интервал из сообщения
        const match = existing.message?.match(/(\d+)/)
        if (match) {
          setInterval(parseInt(match[1]))
        }
      }
    } catch (error) {
      console.error("Failed to load water reminder:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function toggleReminder() {
    if (!hasPermission) {
      const granted = await requestPermission()
      if (!granted) {
        alert(t("reminder.permissionRequired"))
        return
      }
    }

    const newState = !isEnabled
    setIsEnabled(newState)

    if (newState) {
      await createReminder()
    } else if (reminder) {
      await db.reminders.update(reminder.id, { is_active: false })
    }

    onReminderChange?.()
  }

  async function createReminder() {
    const reminderData: Omit<Reminder, "id" | "created_at" | "updated_at"> = {
      title: t("reminder.waterReminderTitle"),
      message: t("reminder.waterReminderMessage", { interval }),
      type: "water",
      time: startTime,
      days: [0, 1, 2, 3, 4, 5, 6], // Все дни недели
      start_date: new Date().toISOString().split("T")[0],
      is_active: true,
      advance_minutes: 0,
      persistent: false,
      priority: "medium",
      sound: true,
      vibration: true,
      repeat_type: "daily",
      repeat_interval: interval, // Интервал в минутах
    }

    if (reminder) {
      await db.reminders.update(reminder.id, {
        ...reminderData,
        updated_at: new Date().toISOString(),
      })
    } else {
      const id = crypto.randomUUID()
      await db.reminders.add({
        ...reminderData,
        id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      setReminder({ ...reminderData, id } as Reminder)
    }
  }

  function generateTimes(): string[] {
    const times: string[] = []
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60)
      const mins = currentMinutes % 60
      times.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`)
      currentMinutes += interval
    }

    return times
  }

  async function updateInterval(newInterval: number) {
    setInterval(newInterval)
    if (isEnabled && reminder) {
      await db.reminders.update(reminder.id, {
        message: t("reminder.waterReminderMessage", { interval: newInterval }),
        repeat_interval: newInterval,
        updated_at: new Date().toISOString(),
      })
    }
  }

  async function updateTime(field: "start" | "end", value: string) {
    if (field === "start") {
      setStartTime(value)
    } else {
      setEndTime(value)
    }

    if (isEnabled && reminder) {
      await db.reminders.update(reminder.id, {
        time: field === "start" ? value : reminder.time,
        updated_at: new Date().toISOString(),
      })
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplet className="h-4 w-4 text-blue-500" />
          {t("reminder.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <Bell className="h-4 w-4 text-green-500" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {isEnabled ? t("reminder.enabled") : t("reminder.disabled")}
            </span>
          </div>
          <Button variant={isEnabled ? "default" : "outline"} size="sm" onClick={toggleReminder}>
            {isEnabled ? t("reminder.disable") : t("reminder.enable")}
          </Button>
        </div>

        {/* Settings */}
        {isEnabled && (
          <>
            {/* Interval */}
            <div className="space-y-2">
              <Label>{t("reminder.interval")}</Label>
              <div className="flex gap-2">
                {[30, 60, 90, 120].map((mins) => (
                  <Button
                    key={mins}
                    variant={interval === mins ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateInterval(mins)}
                  >
                    {mins}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">{t("reminder.from")}</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => updateTime("start", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">{t("reminder.to")}</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => updateTime("end", e.target.value)}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              {t("reminder.reminders")} {generateTimes().slice(0, 5).join(", ")}
              {generateTimes().length > 5 &&
                ` ${t("reminder.andMore", { count: generateTimes().length - 5 })}`}
            </div>
          </>
        )}

        {/* Permission warning */}
        {!hasPermission && (
          <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-2 rounded">
            {t("reminder.permissionWarning")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
