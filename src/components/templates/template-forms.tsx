"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
// Функции для получения опций с переводами
// ============================================

export function getIntensityOptions(t: any) {
  return [
    { value: "low", label: t("intensity.low") },
    { value: "medium", label: t("intensity.medium") },
    { value: "high", label: t("intensity.high") },
  ]
}

export function getQualityOptions(t: any) {
  return [
    { value: 1, label: t("quality.1") },
    { value: 2, label: t("quality.2") },
    { value: 3, label: t("quality.3") },
    { value: 4, label: t("quality.4") },
    { value: 5, label: t("quality.5") },
  ]
}

export function getMoodOptions(t: any) {
  return [
    { value: "great", label: t("mood.great"), emoji: "😄" },
    { value: "good", label: t("mood.good"), emoji: "🙂" },
    { value: "okay", label: t("mood.okay"), emoji: "😐" },
    { value: "bad", label: t("mood.bad"), emoji: "😕" },
    { value: "terrible", label: t("mood.terrible"), emoji: "😢" },
  ]
}

export function getDrinkTypeOptions(t: any) {
  return [
    { value: "water", label: t("drinkType.water") },
    { value: "tea", label: t("drinkType.tea") },
    { value: "coffee", label: t("drinkType.coffee") },
    { value: "other", label: t("drinkType.other") },
  ]
}

export function getActivityOptions(t: any) {
  return [
    { value: "work", label: t("activity.work") },
    { value: "exercise", label: t("activity.exercise") },
    { value: "social", label: t("activity.social") },
    { value: "hobby", label: t("activity.hobby") },
    { value: "rest", label: t("activity.rest") },
    { value: "shopping", label: t("activity.shopping") },
    { value: "reading", label: t("activity.reading") },
    { value: "gaming", label: t("activity.gaming") },
    { value: "cooking", label: t("activity.cooking") },
    { value: "walk", label: t("activity.walk") },
  ]
}

// ============================================
// Устаревшие константы (для обратной совместимости)
// ============================================

export const intensityOptions = getIntensityOptions((key: string) => key)
export const qualityOptions = getQualityOptions((key: string) => key)
export const moodOptions = getMoodOptions((key: string) => key)
export const drinkTypeOptions = getDrinkTypeOptions((key: string) => key)
export const activityOptions = getActivityOptions((key: string) => key)

// ============================================
// Форма для еды
// ============================================

interface FoodTemplateFormProps {
  data: FoodTemplateData
  onChange: (data: FoodTemplateData) => void
}

export function FoodTemplateForm({ data, onChange }: FoodTemplateFormProps) {
  const t = useTranslations("templates")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("food.title")}</Label>
        <Input
          placeholder={t("food.titlePlaceholder")}
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("food.servingSize")}</Label>
        <Input
          type="number"
          placeholder={t("common.grams")}
          value={data.portion_size ?? ""}
          onChange={(e) =>
            onChange({ ...data, portion_size: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("food.nutrition")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t("food.calories")}</Label>
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
              <Label className="text-xs">{t("food.protein")}</Label>
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
              <Label className="text-xs">{t("food.fat")}</Label>
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
              <Label className="text-xs">{t("food.carbs")}</Label>
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
  const t = useTranslations("templates")
  const tCommon = useTranslations("common")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("workout.title")}</Label>
        <Input
          placeholder={t("workout.titlePlaceholder")}
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("workout.duration")}</Label>
          <Input
            type="number"
            placeholder={tCommon("unit.min")}
            value={data.duration ?? ""}
            onChange={(e) =>
              onChange({ ...data, duration: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>{t("workout.intensity")}</Label>
          <Combobox
            options={getIntensityOptions(t).map((opt) => ({ id: opt.value, label: opt.label }))}
            value={data.intensity || ""}
            onChange={(value) =>
              onChange({
                ...data,
                intensity: (value as "low" | "medium" | "high") || undefined,
              })
            }
            placeholder={tCommon("select")}
            allowCustom={false}
            searchable={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("workout.caloriesBurned")}</Label>
          <Input
            type="number"
            placeholder={tCommon("unit.kcal")}
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
          <Label>{t("workout.equipment")}</Label>
          <Input
            placeholder={t("workout.equipmentPlaceholder")}
            value={data.equipment || ""}
            onChange={(e) => onChange({ ...data, equipment: e.target.value })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("workout.strengthAdditional")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">{t("workout.exercisesCount")}</Label>
              <Input
                type="number"
                placeholder={tCommon("unit.pcs")}
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
              <Label className="text-xs">{t("workout.setsCount")}</Label>
              <Input
                type="number"
                placeholder={tCommon("unit.pcs")}
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
              <Label className="text-xs">{t("workout.repsCount")}</Label>
              <Input
                type="number"
                placeholder={tCommon("unit.pcs")}
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
              <Label className="text-xs">{t("workout.totalWeight")}</Label>
              <Input
                type="number"
                step="0.1"
                placeholder={tCommon("unit.kg")}
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
  const t = useTranslations("templates")
  const tCommon = useTranslations("common")
  const waterAmounts = [150, 200, 250, 300, 500]

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>{t("water.amount")}</Label>
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
              {amount} {tCommon("unit.ml")}
            </button>
          ))}
        </div>
        <Input
          type="number"
          placeholder={t("water.customAmount")}
          value={!waterAmounts.includes(data.amount_ml) ? data.amount_ml : ""}
          onChange={(e) =>
            onChange({ ...data, amount_ml: e.target.value ? Number(e.target.value) : 250 })
          }
          className="mt-2"
        />
      </div>

      <div className="space-y-2">
        <Label>{t("water.type")}</Label>
        <div className="flex gap-2 flex-wrap">
          {getDrinkTypeOptions(t).map((opt) => (
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
  const t = useTranslations("templates")
  const tCommon = useTranslations("common")

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("sleep.startTime")}</Label>
          <Input
            type="time"
            value={data.start_time || "23:00"}
            onChange={(e) => onChange({ ...data, start_time: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("sleep.endTime")}</Label>
          <Input
            type="time"
            value={data.end_time || "07:00"}
            onChange={(e) => onChange({ ...data, end_time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("sleep.quality")}</Label>
        <div className="flex gap-2">
          {getQualityOptions(t).map((opt) => (
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
          {getQualityOptions(t).find((o) => o.value === (data.quality || 3))?.label}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{tCommon("notes")}</Label>
        <Input
          placeholder={t("sleep.notesPlaceholder")}
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
  const t = useTranslations("templates")
  const tCommon = useTranslations("common")

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
        <Label>{t("mood.mood")}</Label>
        <div className="flex justify-between">
          {getMoodOptions(t).map((opt) => (
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
        <Label>{t("mood.energy")}</Label>
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
        <Label>{t("mood.stress")}</Label>
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
        <Label>{t("mood.activities")}</Label>
        <div className="flex flex-wrap gap-2">
          {getActivityOptions(t).map((opt) => (
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
