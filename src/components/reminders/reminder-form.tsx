"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"
import { db } from "@/lib/db"
import type { ReminderType, ReminderPriority, ReminderRepeatType, Item } from "@/types"

// Конфигурация типов напоминаний
export const reminderTypesConfig: { type: ReminderType; label: string; icon: string }[] = [
  { type: "habit", label: "Привычка", icon: "🎯" },
  { type: "medicine", label: "Лекарство", icon: "💊" },
  { type: "water", label: "Вода", icon: "💧" },
  { type: "workout", label: "Тренировка", icon: "💪" },
  { type: "food", label: "Питание", icon: "🍽️" },
  { type: "item", label: "Из каталога", icon: "📦" },
  { type: "custom", label: "Другое", icon: "🔔" },
]

// Конфигурация приоритетов
export const priorityConfig: { value: ReminderPriority; label: string; color: string }[] = [
  { value: "low", label: "Низкий", color: "bg-gray-500" },
  { value: "medium", label: "Средний", color: "bg-blue-500" },
  { value: "high", label: "Высокий", color: "bg-orange-500" },
  { value: "critical", label: "Критичный", color: "bg-red-500" },
]

// Опции упреждения
export const advanceOptions = [
  { value: 0, label: "Вовремя" },
  { value: 5, label: "За 5 мин" },
  { value: 10, label: "За 10 мин" },
  { value: 15, label: "За 15 мин" },
  { value: 30, label: "За 30 мин" },
  { value: 60, label: "За 1 час" },
  { value: 1440, label: "За 1 день" },
]

// Опции для кастомного интервала
const customIntervalUnits = [
  { value: "hours", label: "часов" },
  { value: "days", label: "дней" },
  { value: "weeks", label: "недель" },
  { value: "months", label: "месяцев" },
]

// Опции для времени суток (быстрый выбор)
const timeOfDayOptions = [
  { time: "07:00", label: "Утро" },
  { time: "12:00", label: "Обед" },
  { time: "18:00", label: "Вечер" },
  { time: "21:00", label: "Перед сном" },
]

const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

interface ReminderFormProps {
  formData: {
    title: string
    message: string
    type: ReminderType
    time: string
    days: number[]
    priority: ReminderPriority
    advance_minutes: number
    repeat_type: ReminderRepeatType
    repeat_interval: number
    start_date: string
    end_date: string
    sound: boolean
    vibration: boolean
    persistent: boolean
    related_id: string | undefined
    related_type: string | undefined
    // Дополнительные поля для расширенного кастомного режима
    custom_unit?: "days" | "weeks" | "months" | "hours"
    monthly_day?: number
    // Несколько времён в течение дня
    times: string[]
  }
  setFormData: React.Dispatch<React.SetStateAction<ReminderFormProps["formData"]>>
}

export function ReminderForm({ formData, setFormData }: ReminderFormProps) {
  const [items, setItems] = useState<Item[]>([])
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    if (formData.type === "item" || formData.type === "medicine") {
      loadItems()
    }
  }, [formData.type])

  useEffect(() => {
    if (formData.related_id && items.length > 0) {
      const item = items.find(i => i.id === formData.related_id)
      setSelectedItem(item || null)
    }
  }, [formData.related_id, items])

  async function loadItems() {
    const itemType = formData.type === "medicine" ? "medicine" : undefined
    let data: Item[]
    if (itemType) {
      data = await db.items.where("type").equals(itemType).toArray()
    } else {
      data = await db.items.toArray()
    }
    setItems(data)
  }

  function toggleDay(day: number) {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(),
    }))
  }

  function handleRepeatTypeChange(repeatType: ReminderRepeatType) {
    setFormData((prev) => {
      const updates: Partial<ReminderFormProps["formData"]> = { repeat_type: repeatType }
      
      // Автоматически настраиваем дни в зависимости от типа
      if (repeatType === "daily") {
        // Ежедневно - все дни
        updates.days = [0, 1, 2, 3, 4, 5, 6]
      } else if (repeatType === "weekly") {
        // Еженедельно - по умолчанию текущий день или будни
        if (prev.days.length === 7) {
          updates.days = [1, 2, 3, 4, 5] // Будни по умолчанию
        }
      } else if (repeatType === "monthly") {
        // Ежемесячно - текущее число
        updates.monthly_day = prev.monthly_day || new Date().getDate()
      }
      
      return { ...prev, ...updates }
    })
  }

  function handleItemSelect(itemId: string) {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setSelectedItem(item)
      setFormData((prev) => ({
        ...prev,
        related_id: item.id,
        related_type: "item",
        title: item.name,
        message: item.dosage || item.usage || "",
      }))
    }
  }

  // Проверяем, нужно ли показывать выбор дней
  const showDaysSelector = formData.repeat_type === "weekly" || 
    (formData.repeat_type === "custom" && formData.custom_unit === "weeks")

  // Проверяем, нужно ли показывать выбор числа месяца
  const showMonthlyDaySelector = formData.repeat_type === "monthly" ||
    (formData.repeat_type === "custom" && formData.custom_unit === "months")

  return (
    <div className="space-y-4">
      {/* Тип напоминания */}
      <div className="space-y-2">
        <Label>Тип</Label>
        <div className="grid grid-cols-3 gap-2">
          {reminderTypesConfig.map(({ type, label, icon }) => (
            <Button
              key={type}
              type="button"
              variant={formData.type === type ? "default" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={() => setFormData((prev) => ({ ...prev, type, related_id: undefined, related_type: undefined }))}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Выбор элемента из каталога */}
      {(formData.type === "item" || formData.type === "medicine") && items.length > 0 && (
        <div className="space-y-2">
          <Label>{formData.type === "medicine" ? "Лекарство/Витамин" : "Элемент каталога"}</Label>
          <select
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            value={formData.related_id || ""}
            onChange={(e) => handleItemSelect(e.target.value)}
          >
            <option value="">Выберите...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.form ? `(${item.form})` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Название */}
      <div className="space-y-2">
        <Label htmlFor="title">Название</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Название напоминания"
        />
      </div>

      {/* Сообщение */}
      <div className="space-y-2">
        <Label htmlFor="message">Сообщение (опц.)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder="Дополнительная информация"
          rows={2}
        />
      </div>

      {/* Время напоминания */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Время напоминания</Label>
          {(formData.repeat_type === "daily" || formData.repeat_type === "weekly") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const currentTime = formData.time
                const times = formData.times || [currentTime]
                if (!times.includes(currentTime)) {
                  setFormData((prev) => ({ 
                    ...prev, 
                    times: [...times, currentTime].sort() 
                  }))
                } else {
                  // Добавляем инпут для нового времени
                  setFormData((prev) => ({ 
                    ...prev, 
                    times: [...times, "12:00"].sort() 
                  }))
                }
              }}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Добавить время
            </Button>
          )}
        </div>
        
        {/* Основное время */}
        <div className="flex gap-2">
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
            className="flex-1"
          />
          <select
            className="h-10 px-3 rounded-md border border-input bg-background"
            value={formData.advance_minutes}
            onChange={(e) => setFormData((prev) => ({ ...prev, advance_minutes: Number(e.target.value) }))}
          >
            {advanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Быстрый выбор времени суток */}
        {(formData.repeat_type === "daily" || formData.repeat_type === "weekly" || formData.repeat_type === "none") && (
          <div className="flex flex-wrap gap-1">
            {timeOfDayOptions.map(({ time, label }) => (
              <Button
                key={time}
                type="button"
                variant={formData.time === time ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setFormData((prev) => ({ ...prev, time }))}
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* Дополнительные времена (для ежедневного/еженедельного режима) */}
        {(formData.repeat_type === "daily" || formData.repeat_type === "weekly") && formData.times && formData.times.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-xs text-muted-foreground">
              Также напомнить в:
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.times.map((t, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                  <Input
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const newTimes = [...formData.times]
                      newTimes[idx] = e.target.value
                      setFormData((prev) => ({ ...prev, times: newTimes.sort() }))
                    }}
                    className="w-24 h-6 text-xs border-0 p-0 bg-transparent"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => {
                      setFormData((prev) => ({ 
                        ...prev, 
                        times: prev.times?.filter((_, i) => i !== idx) 
                      }))
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Повторяемость - основной переключатель */}
      <div className="space-y-2">
        <Label>Повторяемость</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={formData.repeat_type === "none" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("none")}
          >
            Без повтора
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("daily")}
          >
            Ежедневно
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("weekly")}
          >
            Еженедельно
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("monthly")}
          >
            Ежемесячно
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "custom" ? "default" : "outline"}
            size="sm"
            className="col-span-2"
            onClick={() => handleRepeatTypeChange("custom")}
          >
            Кастомный интервал
          </Button>
        </div>
      </div>

      {/* Дополнительные настройки в зависимости от типа повторения */}
      
      {/* Ежедневно - пояснение */}
      {formData.repeat_type === "daily" && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          📅 Напоминание будет повторяться каждый день
        </div>
      )}

      {/* Еженедельно - выбор дней недели */}
      {formData.repeat_type === "weekly" && (
        <div className="space-y-2">
          <Label>Дни недели</Label>
          <div className="grid grid-cols-7 gap-1">
            {dayNames.map((day, i) => (
              <Button
                key={i}
                type="button"
                variant={formData.days.includes(i) ? "default" : "outline"}
                size="sm"
                className="px-0"
                onClick={() => toggleDay(i)}
              >
                {day}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, days: [0, 1, 2, 3, 4, 5, 6] }))}
            >
              Каждый день
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, days: [1, 2, 3, 4, 5] }))}
            >
              По будням
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, days: [0, 6] }))}
            >
              Выходные
            </Button>
          </div>
        </div>
      )}

      {/* Ежемесячно - выбор числа */}
      {formData.repeat_type === "monthly" && (
        <div className="space-y-2">
          <Label>Число месяца</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Каждое</span>
            <Input
              type="number"
              min={1}
              max={31}
              className="w-20"
              value={formData.monthly_day || new Date().getDate()}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                monthly_day: Math.min(31, Math.max(1, Number(e.target.value))) 
              }))}
            />
            <span className="text-sm text-muted-foreground">число</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Если в месяце меньше дней, напоминание сработает в последний день месяца
          </p>
        </div>
      )}

      {/* Кастомный интервал - расширенные настройки */}
      {formData.repeat_type === "custom" && (
        <div className="space-y-4 p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm">Каждые</span>
            <Input
              type="number"
              min={1}
              max={365}
              className="w-20"
              value={formData.repeat_interval}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                repeat_interval: Math.max(1, Number(e.target.value)) 
              }))}
            />
            <select
              className="h-10 px-3 rounded-md border border-input bg-background"
              value={formData.custom_unit || "days"}
              onChange={(e) => setFormData((prev) => ({ 
                ...prev, 
                custom_unit: e.target.value as "days" | "weeks" | "months"
              }))}
            >
              {customIntervalUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          {/* Если выбраны недели - показать выбор дней */}
          {formData.custom_unit === "weeks" && (
            <div className="space-y-2">
              <Label className="text-sm">В какие дни</Label>
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant={formData.days.includes(i) ? "default" : "outline"}
                    size="sm"
                    className="px-0"
                    onClick={() => toggleDay(i)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, days: [0, 1, 2, 3, 4, 5, 6] }))}
                >
                  Каждый день
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, days: [1, 2, 3, 4, 5] }))}
                >
                  По будням
                </Button>
              </div>
            </div>
          )}

          {/* Если выбраны месяцы - показать выбор числа */}
          {formData.custom_unit === "months" && (
            <div className="space-y-2">
              <Label className="text-sm">Число месяца</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={31}
                  className="w-20"
                  value={formData.monthly_day || new Date().getDate()}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    monthly_day: Math.min(31, Math.max(1, Number(e.target.value))) 
                  }))}
                />
                <span className="text-sm text-muted-foreground">число</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Приоритет */}
      <div className="space-y-2">
        <Label>Приоритет</Label>
        <div className="grid grid-cols-4 gap-2">
          {priorityConfig.map(({ value, label, color }) => (
            <Button
              key={value}
              type="button"
              variant={formData.priority === value ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => setFormData((prev) => ({ ...prev, priority: value }))}
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Даты курса */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Начало курса</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Окончание курса</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
          />
        </div>
      </div>

      {/* Настройки уведомлений */}
      <div className="space-y-3">
        <Label>Настройки уведомлений</Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sound}
              onChange={(e) => setFormData((prev) => ({ ...prev, sound: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">Звук</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vibration}
              onChange={(e) => setFormData((prev) => ({ ...prev, vibration: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">Вибрация</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.persistent}
              onChange={(e) => setFormData((prev) => ({ ...prev, persistent: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">Назойливый режим (повторять пока не подтвердит)</span>
          </label>
        </div>
      </div>
    </div>
  )
}

// Тип для формы напоминания
export type ReminderFormData = {
  title: string
  message: string
  type: ReminderType
  time: string
  days: number[]
  priority: ReminderPriority
  advance_minutes: number
  repeat_type: ReminderRepeatType
  repeat_interval: number
  start_date: string
  end_date: string
  sound: boolean
  vibration: boolean
  persistent: boolean
  related_id: string | undefined
  related_type: string | undefined
  custom_unit?: "days" | "weeks" | "months" | "hours"
  monthly_day?: number
  times: string[]
}

// Функция для получения дефолтных значений формы
export function getDefaultFormData(): ReminderFormData {
  return {
    title: "",
    message: "",
    type: "custom",
    time: "09:00",
    days: [0, 1, 2, 3, 4, 5, 6],
    priority: "medium",
    advance_minutes: 0,
    repeat_type: "none",
    repeat_interval: 1,
    start_date: "",
    end_date: "",
    sound: true,
    vibration: true,
    persistent: false,
    related_id: undefined,
    related_type: undefined,
    custom_unit: "days",
    monthly_day: new Date().getDate(),
    times: [],
  }
}
