"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { TimePicker } from "@/components/ui/time-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Combobox } from "@/components/ui/combobox"
import { Plus, X, Bell, Calendar as CalendarIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { db } from "@/lib/db"
import { priorityColors } from "@/lib/theme-colors"
import type { ReminderType, ReminderPriority, ReminderRepeatType, Item } from "@/types"
import type { DateRange } from "react-day-picker"

// Функции для получения локализованных конфигураций
export function getReminderTypesConfig(
  t: any
): { type: ReminderType; label: string; icon: string }[] {
  return [
    { type: "habit", label: t("types.habit"), icon: "🎯" },
    { type: "medicine", label: t("types.medicine"), icon: "💊" },
    { type: "water", label: t("types.water"), icon: "💧" },
    { type: "workout", label: t("types.workout"), icon: "💪" },
    { type: "food", label: t("types.food"), icon: "🍽️" },
    { type: "item", label: t("types.item"), icon: "📦" },
    { type: "custom", label: t("types.custom"), icon: "🔔" },
  ]
}

export function getPriorityConfig(
  t: any
): { value: ReminderPriority; label: string; color: string }[] {
  return [
    { value: "low", label: t("priorities.low"), color: priorityColors.low.DEFAULT },
    { value: "medium", label: t("priorities.medium"), color: priorityColors.medium.DEFAULT },
    { value: "high", label: t("priorities.high"), color: priorityColors.high.DEFAULT },
    { value: "critical", label: t("priorities.critical"), color: priorityColors.critical.DEFAULT },
  ]
}

// Опции упреждения
export function getAdvanceOptions(t: any) {
  return [
    { value: 0, label: t("advance.onTime") },
    { value: 5, label: t("advance.5minBefore") },
    { value: 10, label: t("advance.10minBefore") },
    { value: 15, label: t("advance.15minBefore") },
    { value: 30, label: t("advance.30minBefore") },
    { value: 60, label: t("advance.1hourBefore") },
    { value: 1440, label: t("advance.1dayBefore") },
  ]
}

// Опции для кастомного интервала
export function getCustomIntervalUnits(t: any) {
  return [
    { value: "hours", label: t("form.hours") },
    { value: "days", label: t("form.days") },
    { value: "weeks", label: t("form.weeks") },
    { value: "months", label: t("form.months") },
  ]
}

// Опции для времени суток (быстрый выбор)
export function getTimeOfDayOptions(t: any) {
  return [
    { time: "07:00", label: t("form.timeOfDay.morning") },
    { time: "12:00", label: t("form.timeOfDay.lunch") },
    { time: "18:00", label: t("form.timeOfDay.evening") },
    { time: "21:00", label: t("form.timeOfDay.bedtime") },
  ]
}

export function getDayNames(t: any) {
  return [
    t("daysOfWeek.su"),
    t("daysOfWeek.mo"),
    t("daysOfWeek.tu"),
    t("daysOfWeek.we"),
    t("daysOfWeek.th"),
    t("daysOfWeek.fr"),
    t("daysOfWeek.sa"),
  ]
}

interface ReminderFormProps {
  formData: {
    title: string
    message: string
    type: ReminderType
    time: string
    date: string // Дата напоминания (для одиночных)
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
  const t = useTranslations("reminders")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS

  useEffect(() => {
    if (formData.type === "item" || formData.type === "medicine") {
      loadItems()
    }
  }, [formData.type])

  useEffect(() => {
    if (formData.related_id && items.length > 0) {
      const item = items.find((i) => i.id === formData.related_id)
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
    const item = items.find((i) => i.id === itemId)
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
  const showDaysSelector =
    formData.repeat_type === "weekly" ||
    (formData.repeat_type === "custom" && formData.custom_unit === "weeks")

  // Проверяем, нужно ли показывать выбор числа месяца
  const showMonthlyDaySelector =
    formData.repeat_type === "monthly" ||
    (formData.repeat_type === "custom" && formData.custom_unit === "months")

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      {/* Тип напоминания */}
      <div className="space-y-2">
        <Label>{t("form.type")}</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {getReminderTypesConfig(t).map(({ type, label, icon }) => (
            <Button
              key={type}
              type="button"
              variant={formData.type === type ? "default" : "outline"}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs min-w-0"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  type,
                  related_id: undefined,
                  related_type: undefined,
                }))
              }
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs text-center leading-tight break-words">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Выбор элемента из каталога */}
      {(formData.type === "item" || formData.type === "medicine") && items.length > 0 && (
        <div className="space-y-2">
          <Label>
            {formData.type === "medicine" ? t("form.medicineSelect") : t("form.itemSelect")}
          </Label>
          <Combobox
            options={items.map((item) => ({
              id: item.id,
              label: `${item.name} ${item.form ? `(${item.form})` : ""}`,
            }))}
            value={formData.related_id || ""}
            onChange={(value) => handleItemSelect(value as string)}
            placeholder={t("form.selectPlaceholder")}
            allowCustom={false}
            searchable={true}
          />
        </div>
      )}

      {/* Название */}
      <div className="space-y-2">
        <Label htmlFor="title">{t("form.title")}</Label>
        <Input
          id="title"
          className="w-full"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder={t("form.titlePlaceholder")}
        />
      </div>

      {/* Сообщение */}
      <div className="space-y-2">
        <Label htmlFor="message">{t("form.message")}</Label>
        <Textarea
          id="message"
          className="w-full"
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          placeholder={t("form.messagePlaceholder")}
          rows={2}
        />
      </div>

      {/* Время напоминания */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t("form.time")}</Label>
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
                    times: [...times, currentTime].sort(),
                  }))
                } else {
                  // Добавляем инпут для нового времени
                  setFormData((prev) => ({
                    ...prev,
                    times: [...times, "12:00"].sort(),
                  }))
                }
              }}
              className="h-7 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              {t("form.addTime")}
            </Button>
          )}
        </div>

        {/* Дата и время */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label>{t("form.date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(new Date(formData.date), "LLL dd, y", { locale: dateFnsLocale })
                  ) : (
                    <span>{t("form.selectDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: date ? format(date, "yyyy-MM-dd") : "",
                    }))
                  }
                  initialFocus
                  locale={dateFnsLocale}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>{t("form.time")}</Label>
            <TimePicker
              value={formData.time}
              onChange={(time) => setFormData((prev) => ({ ...prev, time }))}
            />
          </div>
        </div>

        {/* Упреждение */}
        <div className="space-y-2">
          <Label>{t("form.advance")}</Label>
          <Combobox
            options={getAdvanceOptions(t).map((opt) => ({
              id: String(opt.value),
              label: opt.label,
            }))}
            value={String(formData.advance_minutes)}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, advance_minutes: Number(value) }))
            }
            allowCustom={false}
            searchable={false}
          />
        </div>

        {/* Быстрый выбор времени суток */}
        {(formData.repeat_type === "daily" ||
          formData.repeat_type === "weekly" ||
          formData.repeat_type === "none") && (
          <div className="grid grid-cols-4 gap-1">
            {getTimeOfDayOptions(t).map(({ time, label }) => (
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
        {(formData.repeat_type === "daily" || formData.repeat_type === "weekly") &&
          formData.times &&
          formData.times.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-muted-foreground">{t("form.alsoRemindAt")}</p>
              <div className="flex flex-wrap gap-2">
                {formData.times.map((t, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
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
                          times: prev.times?.filter((_, i) => i !== idx),
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
        <Label>{t("form.repeatType")}</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant={formData.repeat_type === "none" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("none")}
          >
            {t("form.repeatTypes.none")}
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "daily" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("daily")}
          >
            {t("form.repeatTypes.daily")}
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "weekly" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("weekly")}
          >
            {t("form.repeatTypes.weekly")}
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "monthly" ? "default" : "outline"}
            size="sm"
            onClick={() => handleRepeatTypeChange("monthly")}
          >
            {t("form.repeatTypes.monthly")}
          </Button>
          <Button
            type="button"
            variant={formData.repeat_type === "custom" ? "default" : "outline"}
            size="sm"
            className="col-span-2"
            onClick={() => handleRepeatTypeChange("custom")}
          >
            {t("form.repeatTypes.custom")}
          </Button>
        </div>
      </div>

      {/* Дополнительные настройки в зависимости от типа повторения */}

      {/* Ежедневно - пояснение */}
      {formData.repeat_type === "daily" && (
        <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          {t("form.dailyHint")}
        </div>
      )}

      {/* Еженедельно - выбор дней недели */}
      {formData.repeat_type === "weekly" && (
        <div className="space-y-2">
          <Label>{t("form.daysOfWeek")}</Label>
          <div className="grid grid-cols-7 gap-1">
            {getDayNames(t).map((day, i) => (
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
              {t("form.everyDay")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, days: [1, 2, 3, 4, 5] }))}
            >
              {t("form.weekdays")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((prev) => ({ ...prev, days: [0, 6] }))}
            >
              {t("form.weekends")}
            </Button>
          </div>
        </div>
      )}

      {/* Ежемесячно - выбор числа */}
      {formData.repeat_type === "monthly" && (
        <div className="space-y-2">
          <Label>{t("form.monthDay")}</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("form.monthDayLabel")}</span>
            <Input
              type="number"
              min={1}
              max={31}
              className="w-20"
              value={formData.monthly_day || new Date().getDate()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthly_day: Math.min(31, Math.max(1, Number(e.target.value))),
                }))
              }
            />
            <span className="text-sm text-muted-foreground">{t("form.monthDaySuffix")}</span>
          </div>
          <p className="text-xs text-muted-foreground">{t("form.monthDayHint")}</p>
        </div>
      )}

      {/* Кастомный интервал - расширенные настройки */}
      {formData.repeat_type === "custom" && (
        <div className="space-y-4 p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm">{t("form.customInterval")}</span>
            <Input
              type="number"
              min={1}
              max={365}
              className="w-20"
              value={formData.repeat_interval}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  repeat_interval: Math.max(1, Number(e.target.value)),
                }))
              }
            />
            <Combobox
              options={getCustomIntervalUnits(t).map((unit) => ({
                id: unit.value,
                label: t(`form.${unit.value}`),
              }))}
              value={formData.custom_unit || "days"}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  custom_unit: value as "days" | "weeks" | "months",
                }))
              }
              allowCustom={false}
              searchable={false}
              className="flex-1"
            />
          </div>

          {/* Если выбраны недели - показать выбор дней */}
          {formData.custom_unit === "weeks" && (
            <div className="space-y-2">
              <Label className="text-sm">{t("form.onDays")}</Label>
              <div className="grid grid-cols-7 gap-1">
                {getDayNames(t).map((day, i) => (
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
                  {t("form.everyDay")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, days: [1, 2, 3, 4, 5] }))}
                >
                  {t("form.weekdays")}
                </Button>
              </div>
            </div>
          )}

          {/* Если выбраны месяцы - показать выбор числа */}
          {formData.custom_unit === "months" && (
            <div className="space-y-2">
              <Label className="text-sm">{t("form.monthDay")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={31}
                  className="w-20"
                  value={formData.monthly_day || new Date().getDate()}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthly_day: Math.min(31, Math.max(1, Number(e.target.value))),
                    }))
                  }
                />
                <span className="text-sm text-muted-foreground">{t("form.monthDaySuffix")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Приоритет */}
      <div className="space-y-2">
        <Label>{t("form.priority")}</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            style={
              formData.priority === "low"
                ? { backgroundColor: "#6b7280", color: "white", borderColor: "#6b7280" }
                : {}
            }
            onClick={() => setFormData((prev) => ({ ...prev, priority: "low" }))}
          >
            {t("form.priorities.low")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            style={
              formData.priority === "medium"
                ? { backgroundColor: "#3b82f6", color: "white", borderColor: "#3b82f6" }
                : {}
            }
            onClick={() => setFormData((prev) => ({ ...prev, priority: "medium" }))}
          >
            {t("form.priorities.medium")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            style={
              formData.priority === "high"
                ? { backgroundColor: "#f97316", color: "white", borderColor: "#f97316" }
                : {}
            }
            onClick={() => setFormData((prev) => ({ ...prev, priority: "high" }))}
          >
            {t("form.priorities.high")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-xs"
            style={
              formData.priority === "critical"
                ? { backgroundColor: "#ef4444", color: "white", borderColor: "#ef4444" }
                : {}
            }
            onClick={() => setFormData((prev) => ({ ...prev, priority: "critical" }))}
          >
            {t("form.priorities.critical")}
          </Button>
        </div>
      </div>

      {/* Даты курса */}
      <div className="space-y-2">
        <Label>{t("form.courseDates")}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!formData.start_date || !formData.end_date) && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.start_date && formData.end_date ? (
                <>
                  {format(new Date(formData.start_date), "LLL dd, y", { locale: dateFnsLocale })} -{" "}
                  {format(new Date(formData.end_date), "LLL dd, y", { locale: dateFnsLocale })}
                </>
              ) : (
                <span>{t("form.selectDateRange")}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" side="bottom" align="start">
            <Calendar
              mode="range"
              selected={{
                from: formData.start_date ? new Date(formData.start_date) : undefined,
                to: formData.end_date ? new Date(formData.end_date) : undefined,
              }}
              onSelect={(range: DateRange | undefined) => {
                if (range) {
                  setFormData((prev) => ({
                    ...prev,
                    start_date: range.from ? format(range.from, "yyyy-MM-dd") : "",
                    end_date: range.to ? format(range.to, "yyyy-MM-dd") : "",
                  }))
                }
              }}
              initialFocus
              locale={dateFnsLocale}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Настройки уведомлений */}
      <div className="space-y-3">
        <Label>{t("form.notificationSettings")}</Label>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.sound}
              onChange={(e) => setFormData((prev) => ({ ...prev, sound: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">{t("form.sound")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.vibration}
              onChange={(e) => setFormData((prev) => ({ ...prev, vibration: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">{t("form.vibration")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.persistent}
              onChange={(e) => setFormData((prev) => ({ ...prev, persistent: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm">{t("form.persistent")}</span>
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
  date: string // Дата напоминания (для одиночных)
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
  const now = new Date()
  return {
    title: "",
    message: "",
    type: "custom",
    time: now.toTimeString().slice(0, 5), // Текущее время
    date: now.toISOString().split("T")[0], // Текущая дата
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
    monthly_day: now.getDate(),
    times: [],
  }
}
