"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Combobox } from "@/components/ui/combobox"
import type { Template } from "@/types"

// ============================================
// Типы данных для шаблонов
// ============================================

export interface FoodTemplateData {
  title: string
  calories?: number
  protein?: number
  fat?: number
  carbs?: number
  portion_size?: number
}

export interface WorkoutTemplateData {
  title: string
  duration?: number
  intensity?: "low" | "medium" | "high"
  subcategory?: string
  equipment?: string
  goal?: string
  calories_burned?: number
  exercises_count?: number
  sets_count?: number
  reps_count?: number
  total_weight?: number
}

export interface WaterTemplateData {
  amount_ml: number
  type?: "water" | "tea" | "coffee" | "other"
}

export interface SleepTemplateData {
  start_time: string
  end_time: string
  quality?: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface MoodTemplateData {
  mood: "great" | "good" | "okay" | "bad" | "terrible"
  energy?: 1 | 2 | 3 | 4 | 5
  stress?: 1 | 2 | 3 | 4 | 5
  activities?: string[]
  notes?: string
}

export type TemplateData =
  | FoodTemplateData
  | WorkoutTemplateData
  | WaterTemplateData
  | SleepTemplateData
  | MoodTemplateData

// ============================================
// Константы
// ============================================

export const intensityOptions = [
  { value: "low", label: "Низкая" },
  { value: "medium", label: "Средняя" },
  { value: "high", label: "Высокая" },
]

export const qualityOptions = [
  { value: 1, label: "Ужасно" },
  { value: 2, label: "Плохо" },
  { value: 3, label: "Нормально" },
  { value: 4, label: "Хорошо" },
  { value: 5, label: "Отлично" },
]

export const moodOptions = [
  { value: "great", label: "great", emoji: "😄" },
  { value: "good", label: "good", emoji: "🙂" },
  { value: "okay", label: "okay", emoji: "😐" },
  { value: "bad", label: "bad", emoji: "😕" },
  { value: "terrible", label: "terrible", emoji: "😢" },
]

export const drinkTypeOptions = [
  { value: "water", label: "Вода" },
  { value: "tea", label: "Чай" },
  { value: "coffee", label: "Кофе" },
  { value: "other", label: "Другое" },
]

export const activityOptions = [
  { value: "work", label: "Работа" },
  { value: "exercise", label: "Спорт" },
  { value: "social", label: "Общение" },
  { value: "hobby", label: "Хобби" },
  { value: "rest", label: "Отдых" },
  { value: "shopping", label: "Покупки" },
  { value: "reading", label: "Чтение" },
  { value: "gaming", label: "Игры" },
  { value: "cooking", label: "Готовка" },
  { value: "walk", label: "Прогулка" },
]

// ============================================
// Форма для еды
// ============================================

interface FoodTemplateFormProps {
  data: FoodTemplateData
  onChange: (data: FoodTemplateData) => void
}

export function FoodTemplateForm({ data, onChange }: FoodTemplateFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Название блюда</Label>
        <Input
          placeholder="Например: Овсянка с ягодами"
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Размер порции (г)</Label>
        <Input
          type="number"
          placeholder="граммы"
          value={data.portion_size ?? ""}
          onChange={(e) =>
            onChange({ ...data, portion_size: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Пищевая ценность (на 100г)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Ккал</Label>
              <Input
                type="number"
                placeholder="0"
                value={data.calories ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    calories: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Белки</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0"
                value={data.protein ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    protein: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Жиры</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0"
                value={data.fat ?? ""}
                onChange={(e) =>
                  onChange({ ...data, fat: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Углеводы</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0"
                value={data.carbs ?? ""}
                onChange={(e) =>
                  onChange({ ...data, carbs: e.target.value ? Number(e.target.value) : undefined })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Форма для тренировки
// ============================================

interface WorkoutTemplateFormProps {
  data: WorkoutTemplateData
  onChange: (data: WorkoutTemplateData) => void
}

export function WorkoutTemplateForm({ data, onChange }: WorkoutTemplateFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Название тренировки</Label>
        <Input
          placeholder="Например: Утренняя пробежка"
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Длительность (мин)</Label>
          <Input
            type="number"
            placeholder="мин"
            value={data.duration ?? ""}
            onChange={(e) =>
              onChange({ ...data, duration: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Интенсивность</Label>
          <Combobox
            options={intensityOptions.map((opt) => ({ id: opt.value, label: opt.label }))}
            value={data.intensity || ""}
            onChange={(value) =>
              onChange({
                ...data,
                intensity: (value as "low" | "medium" | "high") || undefined,
              })
            }
            placeholder="Выберите"
            allowCustom={false}
            searchable={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Сожжено калорий</Label>
          <Input
            type="number"
            placeholder="ккал"
            value={data.calories_burned ?? ""}
            onChange={(e) =>
              onChange({
                ...data,
                calories_burned: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Инвентарь</Label>
          <Input
            placeholder="Штанга, гантели..."
            value={data.equipment || ""}
            onChange={(e) => onChange({ ...data, equipment: e.target.value })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Дополнительно (для силовых)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Упражнений</Label>
              <Input
                type="number"
                placeholder="шт"
                value={data.exercises_count ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    exercises_count: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Подходов</Label>
              <Input
                type="number"
                placeholder="шт"
                value={data.sets_count ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    sets_count: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Повторений</Label>
              <Input
                type="number"
                placeholder="шт"
                value={data.reps_count ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    reps_count: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Общий вес (кг)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="кг"
                value={data.total_weight ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    total_weight: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Форма для воды
// ============================================

interface WaterTemplateFormProps {
  data: WaterTemplateData
  onChange: (data: WaterTemplateData) => void
}

export function WaterTemplateForm({ data, onChange }: WaterTemplateFormProps) {
  const waterAmounts = [150, 200, 250, 300, 500]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Количество (мл)</Label>
        <div className="flex gap-2 flex-wrap">
          {waterAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => onChange({ ...data, amount_ml: amount })}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                data.amount_ml === amount
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {amount} мл
            </button>
          ))}
        </div>
        <Input
          type="number"
          placeholder="Свое значение"
          value={!waterAmounts.includes(data.amount_ml) ? data.amount_ml : ""}
          onChange={(e) =>
            onChange({ ...data, amount_ml: e.target.value ? Number(e.target.value) : 250 })
          }
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <Label>Тип напитка</Label>
        <div className="flex gap-2 flex-wrap">
          {drinkTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...data, type: opt.value as WaterTemplateData["type"] })}
              className={`px-4 py-2 rounded-xl border transition-colors ${
                (data.type || "water") === opt.value
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Форма для сна
// ============================================

interface SleepTemplateFormProps {
  data: SleepTemplateData
  onChange: (data: SleepTemplateData) => void
}

export function SleepTemplateForm({ data, onChange }: SleepTemplateFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Время отхода ко сну</Label>
          <Input
            type="time"
            value={data.start_time || "23:00"}
            onChange={(e) => onChange({ ...data, start_time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Время пробуждения</Label>
          <Input
            type="time"
            value={data.end_time || "07:00"}
            onChange={(e) => onChange({ ...data, end_time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Качество сна по умолчанию</Label>
        <div className="flex gap-2">
          {qualityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...data, quality: opt.value as 1 | 2 | 3 | 4 | 5 })}
              className={`flex-1 px-3 py-2 rounded-xl border transition-colors ${
                (data.quality || 3) === opt.value
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {opt.value}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {qualityOptions.find((o) => o.value === (data.quality || 3))?.label}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Заметки</Label>
        <Input
          placeholder="Сны, пробуждения..."
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
        />
      </div>
    </div>
  )
}

// ============================================
// Форма для настроения
// ============================================

interface MoodTemplateFormProps {
  data: MoodTemplateData
  onChange: (data: MoodTemplateData) => void
}

export function MoodTemplateForm({ data, onChange }: MoodTemplateFormProps) {
  const toggleActivity = (activity: string) => {
    const activities = data.activities || []
    onChange({
      ...data,
      activities: activities.includes(activity)
        ? activities.filter((a) => a !== activity)
        : [...activities, activity],
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Настроение</Label>
        <div className="flex justify-between">
          {moodOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...data, mood: opt.value as MoodTemplateData["mood"] })}
              className={`flex flex-col items-center px-3 py-2 rounded-xl border transition-colors ${
                (data.mood || "good") === opt.value
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-xs mt-1">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Энергия</Label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onChange({ ...data, energy: e })}
              className={`flex-1 px-3 py-2 rounded-xl border transition-colors ${
                (data.energy || 3) === e
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Стресс (1 - низкий, 5 - высокий)</Label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ ...data, stress: s })}
              className={`flex-1 px-3 py-2 rounded-xl border transition-colors ${
                (data.stress || 3) === s
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Активности</Label>
        <div className="flex flex-wrap gap-2">
          {activityOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleActivity(opt.value)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                (data.activities || []).includes(opt.value)
                  ? "bg-primary text-white border-primary"
                  : "bg-background hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Заметки</Label>
        <Input
          placeholder="Что повлияло на настроение?"
          value={data.notes || ""}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
        />
      </div>
    </div>
  )
}
