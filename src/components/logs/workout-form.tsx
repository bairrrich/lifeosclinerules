"use client"

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { ChevronDown } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxSelect } from "./combobox-select"
import { useTranslations } from "next-intl"
import type { StrengthSubcategory, CardioSubcategory, YogaSubcategory, WorkoutGoal } from "@/types"

// ============================================
// Схема валидации
// ============================================

const baseLogSchema = z.object({
  date: z.string().min(1, "Date required"),
  time: z.string().min(1, "Time required"),
  title: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const workoutSchema = baseLogSchema.extend({
  title: z.string().min(1, "Title required"),
  duration: z.number().optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
})

export type WorkoutFormData = z.infer<typeof workoutSchema>

// ============================================
// Константы
// ============================================

// Функции для получения локализованных конфигураций
export function getStrengthSubcategories(t: any) {
  return {
    anatomical: {
      label: t("workout.strengthSubcategories.anatomical"),
      options: [
        { value: "chest", label: t("workout.strengthSubcategories.chest") },
        { value: "back", label: t("workout.strengthSubcategories.back") },
        { value: "legs", label: t("workout.strengthSubcategories.legs") },
        { value: "shoulders", label: t("workout.strengthSubcategories.shoulders") },
        { value: "arms", label: t("workout.strengthSubcategories.arms") },
        { value: "core", label: t("workout.strengthSubcategories.core") },
      ],
    },
    equipment: {
      label: t("workout.strengthSubcategories.equipment"),
      options: [
        { value: "free_weights", label: t("workout.strengthSubcategories.freeWeights") },
        { value: "machines", label: t("workout.strengthSubcategories.machines") },
        { value: "bodyweight", label: t("workout.strengthSubcategories.bodyweight") },
        { value: "functional", label: t("workout.strengthSubcategories.functional") },
      ],
    },
  }
}

export function getCardioSubcategories(t: any) {
  return {
    activity: {
      label: t("workout.cardioSubcategories.activity"),
      options: [
        { value: "running", label: t("workout.cardioSubcategories.running") },
        { value: "walking", label: t("workout.cardioSubcategories.walking") },
        { value: "cycling", label: t("workout.cardioSubcategories.cycling") },
        { value: "rowing", label: t("workout.cardioSubcategories.rowing") },
        { value: "jumping", label: t("workout.cardioSubcategories.jumping") },
      ],
    },
    intensity: {
      label: t("workout.cardioSubcategories.byIntensity"),
      options: [
        { value: "liss", label: t("workout.cardioSubcategories.liss") },
        { value: "hiit", label: t("workout.cardioSubcategories.hiit") },
        { value: "tabata", label: t("workout.cardioSubcategories.tabata") },
      ],
    },
  }
}

export function getYogaSubcategories(t: any) {
  return {
    style: {
      label: t("workout.yogaSubcategories.style"),
      options: [
        { value: "hatha", label: t("workout.yogaSubcategories.hatha") },
        { value: "vinyasa", label: t("workout.yogaSubcategories.vinyasa") },
        { value: "ashtanga", label: t("workout.yogaSubcategories.ashtanga") },
        { value: "kundalini", label: t("workout.yogaSubcategories.kundalini") },
        { value: "iyengar", label: t("workout.yogaSubcategories.iyengar") },
      ],
    },
    goal: {
      label: t("workout.yogaSubcategories.byGoal"),
      options: [
        { value: "stretching", label: t("workout.yogaSubcategories.stretching") },
        { value: "power", label: t("workout.yogaSubcategories.power") },
        { value: "relax", label: t("workout.yogaSubcategories.relax") },
        { value: "breathing", label: t("workout.yogaSubcategories.breathing") },
      ],
    },
    level: {
      label: t("workout.yogaSubcategories.byLevel"),
      options: [
        { value: "beginner", label: t("workout.yogaSubcategories.beginner") },
        { value: "intermediate", label: t("workout.yogaSubcategories.intermediate") },
        { value: "advanced", label: t("workout.yogaSubcategories.advanced") },
      ],
    },
  }
}

export function getStretchingSubcategories(t: any) {
  return {
    type: {
      label: t("workout.stretchingSubcategories.byType"),
      options: [
        { value: "static", label: t("workout.stretchingSubcategories.static") },
        { value: "dynamic", label: t("workout.stretchingSubcategories.dynamic") },
        { value: "ballistic", label: t("workout.stretchingSubcategories.ballistic") },
        { value: "pnf", label: t("workout.stretchingSubcategories.pnf") },
      ],
    },
    focus: {
      label: t("workout.stretchingSubcategories.byFocus"),
      options: [
        { value: "full_body", label: t("workout.stretchingSubcategories.fullBody") },
        { value: "upper_body", label: t("workout.stretchingSubcategories.upperBody") },
        { value: "lower_body", label: t("workout.stretchingSubcategories.lowerBody") },
        { value: "back", label: t("workout.stretchingSubcategories.back") },
        { value: "hips", label: t("workout.stretchingSubcategories.hips") },
      ],
    },
  }
}

export function getEquipmentOptions(t: any): Record<string, string[]> {
  return {
    strength: [
      t("workout.strengthSubcategories.chest"),
      t("workout.strengthSubcategories.back"),
      t("workout.strengthSubcategories.legs"),
      t("workout.strengthSubcategories.shoulders"),
      t("workout.strengthSubcategories.arms"),
      t("workout.strengthSubcategories.core"),
      t("workout.strengthSubcategories.freeWeights"),
      t("workout.strengthSubcategories.machines"),
      t("workout.strengthSubcategories.bodyweight"),
      t("workout.strengthSubcategories.functional"),
      t("workout.equipmentOptions.Bench"),
      t("workout.equipmentOptions.PullUpBar"),
      t("workout.equipmentOptions.ParallelBars"),
      t("workout.equipmentOptions.CableCrossover"),
      t("workout.equipmentOptions.SmithMachine"),
      t("workout.equipmentOptions.ResistanceBands"),
      t("workout.equipmentOptions.MedicineBall"),
      t("workout.equipmentOptions.TRX"),
      t("workout.equipmentOptions.NoEquipment"),
    ],
    cardio: [
      t("workout.equipmentOptions.Treadmill"),
      t("workout.equipmentOptions.Elliptical"),
      t("workout.equipmentOptions.ExerciseBike"),
      t("workout.equipmentOptions.RowingMachine"),
      t("workout.equipmentOptions.JumpRope"),
      t("workout.equipmentOptions.Stepper"),
      t("workout.equipmentOptions.NoEquipment"),
    ],
    yoga: [
      t("workout.equipmentOptions.Mat"),
      t("workout.equipmentOptions.Blocks"),
      t("workout.equipmentOptions.Strap"),
      t("workout.equipmentOptions.Bolster"),
      t("workout.equipmentOptions.Blanket"),
      t("workout.equipmentOptions.Chair"),
      t("workout.equipmentOptions.Wall"),
      t("workout.equipmentOptions.NoEquipment"),
    ],
    stretching: [
      t("workout.equipmentOptions.Mat"),
      t("workout.equipmentOptions.Strap"),
      t("workout.equipmentOptions.Blocks"),
      t("workout.equipmentOptions.FoamRoller"),
      t("workout.equipmentOptions.Ball"),
      t("workout.equipmentOptions.Wall"),
      t("workout.equipmentOptions.NoEquipment"),
    ],
  }
}

export function getGoalOptions(t: any): Record<string, { value: string; label: string }[]> {
  return {
    strength: [
      { value: "mass", label: t("workout.goals.mass") },
      { value: "relief", label: t("workout.goals.relief") },
      { value: "strength", label: t("workout.goals.strength") },
      { value: "endurance", label: t("workout.goals.endurance") },
    ],
    cardio: [
      { value: "endurance", label: t("workout.goals.endurance") },
      { value: "fat_loss", label: t("workout.goals.fatLoss") },
      { value: "recovery", label: t("workout.goals.recovery") },
    ],
    yoga: [
      { value: "flexibility", label: t("workout.goals.flexibility") },
      { value: "strength", label: t("workout.goals.strength") },
      { value: "relaxation", label: t("workout.goals.relaxation") },
      { value: "balance", label: t("workout.goals.balance") },
    ],
    stretching: [
      { value: "flexibility", label: t("workout.goals.flexibility") },
      { value: "mobility", label: t("workout.goals.mobility") },
      { value: "recovery", label: t("workout.goals.recovery") },
      { value: "relaxation", label: t("workout.goals.relaxation") },
    ],
  }
}

// Функция для получения метки подкатегории
export function getSubcategoryLabel(t: any, category: string, value: string): string {
  if (category === "Strength") {
    const allOptions = [
      ...getStrengthSubcategories(t).anatomical.options,
      ...getStrengthSubcategories(t).equipment.options,
    ]
    const found = allOptions.find((opt) => opt.value === value)
    return found?.label || ""
  }
  if (category === "Cardio") {
    const allOptions = [
      ...getCardioSubcategories(t).activity.options,
      ...getCardioSubcategories(t).intensity.options,
    ]
    const found = allOptions.find((opt) => opt.value === value)
    return found?.label || ""
  }
  if (category === "Yoga") {
    const allOptions = [
      ...getYogaSubcategories(t).style.options,
      ...getYogaSubcategories(t).goal.options,
      ...getYogaSubcategories(t).level.options,
    ]
    const found = allOptions.find((opt) => opt.value === value)
    return found?.label || ""
  }
  return ""
}

// ============================================
// Интерфейсы
// ============================================

interface WorkoutFormProps {
  register: UseFormRegister<WorkoutFormData>
  watch: UseFormWatch<WorkoutFormData>
  setValue: UseFormSetValue<WorkoutFormData>
  selectedCategory: string
  // Workout-specific state
  workoutSubcategory: string
  setWorkoutSubcategory: (value: string) => void
  workoutEquipment: string
  setWorkoutEquipment: (value: string) => void
  workoutGoal: string
  setWorkoutGoal: (value: string) => void
  caloriesBurned?: number
  setCaloriesBurned: (value: number | undefined) => void
  distance?: number
  setDistance: (value: number | undefined) => void
  heartRateAvg?: number
  setHeartRateAvg: (value: number | undefined) => void
  heartRateMax?: number
  setHeartRateMax: (value: number | undefined) => void
  exercisesCount?: number
  setExercisesCount: (value: number | undefined) => void
  setsCount?: number
  setSetsCount: (value: number | undefined) => void
  repsCount?: number
  setRepsCount: (value: number | undefined) => void
  totalWeight?: number
  setTotalWeight: (value: number | undefined) => void
  averageSpeed?: number
  setAverageSpeed: (value: number | undefined) => void
  averagePace: string
  setAveragePace: (value: string) => void
  rounds?: number
  setRounds: (value: number | undefined) => void
  yogaLevel: string
  setYogaLevel: (value: string) => void
  yogaFocus: string
  setYogaFocus: (value: string) => void
}

// ============================================
// Компонент
// ============================================

export function WorkoutForm({
  register,
  watch,
  setValue,
  selectedCategory,
  workoutSubcategory,
  setWorkoutSubcategory,
  workoutEquipment,
  setWorkoutEquipment,
  workoutGoal,
  setWorkoutGoal,
  caloriesBurned,
  setCaloriesBurned,
  distance,
  setDistance,
  heartRateAvg,
  setHeartRateAvg,
  heartRateMax,
  setHeartRateMax,
  exercisesCount,
  setExercisesCount,
  setsCount,
  setSetsCount,
  repsCount,
  setRepsCount,
  totalWeight,
  setTotalWeight,
  averageSpeed,
  setAverageSpeed,
  averagePace,
  setAveragePace,
  rounds,
  setRounds,
  yogaLevel,
  setYogaLevel,
  yogaFocus,
  setYogaFocus,
}: WorkoutFormProps) {
  const t = useTranslations("logs")

  // Get subcategories for current workout type
  const currentWorkoutSubcategories =
    selectedCategory === "Strength"
      ? getStrengthSubcategories(t)
      : selectedCategory === "Cardio"
        ? getCardioSubcategories(t)
        : selectedCategory === "Yoga"
          ? getYogaSubcategories(t)
          : selectedCategory === "Stretching"
            ? getStretchingSubcategories(t)
            : null

  // Get equipment for current workout type
  const currentEquipment =
    selectedCategory === "Strength"
      ? getEquipmentOptions(t).strength
      : selectedCategory === "Cardio"
        ? getEquipmentOptions(t).cardio
        : selectedCategory === "Yoga"
          ? getEquipmentOptions(t).yoga
          : selectedCategory === "Stretching"
            ? getEquipmentOptions(t).stretching
            : []

  // Get goals for current workout type
  const currentGoals =
    selectedCategory === "Strength"
      ? getGoalOptions(t).strength
      : selectedCategory === "Cardio"
        ? getGoalOptions(t).cardio
        : selectedCategory === "Yoga"
          ? getGoalOptions(t).yoga
          : selectedCategory === "Stretching"
            ? getGoalOptions(t).stretching
            : []

  return (
    <>
      {/* Подкатегории для тренировок */}
      {currentWorkoutSubcategories && (
        <Card>
          <CardHeader>
            <CardTitle>{t("workout.subcategory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subcategories for Strength */}
            {selectedCategory === "Strength" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.strengthSubcategories.anatomical`)}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {getStrengthSubcategories(t).anatomical.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.strengthSubcategories.equipment`)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getStrengthSubcategories(t).equipment.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-red-500 text-white border-red-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Подкатегории для Cardio */}
            {selectedCategory === "Cardio" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.cardioSubcategories.activity`)}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {getCardioSubcategories(t).activity.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.cardioSubcategories.byIntensity`)}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {getCardioSubcategories(t).intensity.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Subcategories for Yoga */}
            {selectedCategory === "Yoga" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.yogaSubcategories.style`)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getYogaSubcategories(t).style.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.yogaSubcategories.byGoal`)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getYogaSubcategories(t).goal.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.yogaSubcategories.byLevel`)}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {getYogaSubcategories(t).level.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Subcategories for Stretching */}
            {selectedCategory === "Stretching" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.stretchingSubcategories.byType`)}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {getStretchingSubcategories(t).type.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t(`workout.stretchingSubcategories.byFocus`)}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {getStretchingSubcategories(t).focus.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setWorkoutSubcategory(opt.value)}
                        className={`px-3 py-2 text-sm rounded-xl border transition-colors ${
                          workoutSubcategory === opt.value
                            ? "bg-pink-500 text-white border-pink-500"
                            : "bg-background hover:bg-accent"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Параметры тренировки */}
      <Card>
        <CardHeader>
          <CardTitle>{t("workout.workoutType")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">{t("workout.duration")}</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("workout.intensity")}</Label>
              <div className="relative">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                  onChange={(e) =>
                    setValue("intensity", e.target.value as "low" | "medium" | "high")
                  }
                  defaultValue={watch("intensity") || ""}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  }}
                >
                  <option value="" disabled>
                    {t("workout.intensity")}
                  </option>
                  <option value="low">{t("workout.intensityLevels.low")}</option>
                  <option value="medium">{t("workout.intensityLevels.medium")}</option>
                  <option value="high">{t("workout.intensityLevels.high")}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
              </div>
            </div>
          </div>

          {/* Инвентарь и Цель тренировки - в одну строку */}
          <div className="grid grid-cols-2 gap-4">
            {/* Инвентарь */}
            {currentEquipment.length > 0 && (
              <ComboboxSelect
                label={t("workout.equipment")}
                options={currentEquipment.map((opt) => ({ value: opt, label: opt }))}
                value={workoutEquipment}
                onChange={setWorkoutEquipment}
                placeholder={t("workout.equipment")}
              />
            )}

            {/* Цель тренировки */}
            {currentGoals.length > 0 && (
              <div className="space-y-2">
                <Label>{t("workout.goal")}</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                    value={workoutGoal}
                    onChange={(e) => setWorkoutGoal(e.target.value)}
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="" disabled>
                      {t("workout.goal")}
                    </option>
                    {currentGoals.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные параметры */}
      <Card>
        <CardHeader>
          <CardTitle>{t("common.optional")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Калории и дистанция */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesBurned">{t("workout.caloriesBurned")}</Label>
              <Input
                id="caloriesBurned"
                type="number"
                placeholder={t("workout.placeholders.calories")}
                value={caloriesBurned ?? ""}
                onChange={(e) =>
                  setCaloriesBurned(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            {/* Distance - cardio only */}
            {selectedCategory === "Cardio" && (
              <div className="space-y-2">
                <Label htmlFor="distance">{t("workout.distance")}</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder={t("workout.placeholders.distance")}
                  value={distance ?? ""}
                  onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            )}
          </div>

          {/* Пульс */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heartRateAvg">{t("workout.heartRateAvg")}</Label>
              <Input
                id="heartRateAvg"
                type="number"
                placeholder={t("workout.placeholders.avgPulse")}
                value={heartRateAvg ?? ""}
                onChange={(e) =>
                  setHeartRateAvg(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heartRateMax">{t("workout.heartRateMax")}</Label>
              <Input
                id="heartRateMax"
                type="number"
                placeholder={t("workout.placeholders.maxPulse")}
                value={heartRateMax ?? ""}
                onChange={(e) =>
                  setHeartRateMax(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Exercises, sets, reps and weight - strength only */}
          {selectedCategory === "Strength" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercisesCount">{t("workout.exercisesCount")}</Label>
                  <Input
                    id="exercisesCount"
                    type="number"
                    placeholder={t("workout.placeholders.count")}
                    value={exercisesCount ?? ""}
                    onChange={(e) =>
                      setExercisesCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setsCount">{t("workout.setsCount")}</Label>
                  <Input
                    id="setsCount"
                    type="number"
                    placeholder={t("workout.placeholders.count")}
                    value={setsCount ?? ""}
                    onChange={(e) =>
                      setSetsCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repsCount">{t("workout.repsCount")}</Label>
                  <Input
                    id="repsCount"
                    type="number"
                    placeholder={t("workout.placeholders.count")}
                    value={repsCount ?? ""}
                    onChange={(e) =>
                      setRepsCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">{t("workout.totalWeight")}</Label>
                  <Input
                    id="totalWeight"
                    type="number"
                    step="0.1"
                    placeholder={t("workout.placeholders.weight")}
                    value={totalWeight ?? ""}
                    onChange={(e) =>
                      setTotalWeight(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Скорость, темп, раунды - только для cardio */}
          {selectedCategory === "Cardio" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageSpeed">{t("workout.averageSpeed")}</Label>
                  <Input
                    id="averageSpeed"
                    type="number"
                    step="0.1"
                    placeholder={t("workout.placeholders.speed")}
                    value={averageSpeed ?? ""}
                    onChange={(e) =>
                      setAverageSpeed(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averagePace">{t("workout.averagePace")}</Label>
                  <Input
                    id="averagePace"
                    type="text"
                    placeholder={t("workout.placeholders.pace")}
                    value={averagePace}
                    onChange={(e) => setAveragePace(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rounds">{t("workout.rounds")}</Label>
                  <Input
                    id="rounds"
                    type="number"
                    placeholder="шт"
                    value={rounds ?? ""}
                    onChange={(e) => setRounds(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Уровень и фокус - только для йоги */}
          {selectedCategory === "Yoga" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("workout.level")}</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                    value={yogaLevel}
                    onChange={(e) => setYogaLevel(e.target.value)}
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="" disabled>
                      {t("workout.level")}
                    </option>
                    <option value="beginner">{t("workout.yogaSubcategories.beginner")}</option>
                    <option value="intermediate">
                      {t("workout.yogaSubcategories.intermediate")}
                    </option>
                    <option value="advanced">{t("workout.yogaSubcategories.advanced")}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("workout.focus")}</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                    value={yogaFocus}
                    onChange={(e) => setYogaFocus(e.target.value)}
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="" disabled>
                      {t("workout.focus")}
                    </option>
                    <option value="flexibility">{t("workout.goals.flexibility")}</option>
                    <option value="strength">{t("workout.goals.strength")}</option>
                    <option value="relaxation">{t("workout.goals.relaxation")}</option>
                    <option value="meditation">{t("workout.yogaSubcategories.breathing")}</option>
                    <option value="breathing">{t("workout.yogaSubcategories.breathing")}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
