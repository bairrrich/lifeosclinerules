"use client"

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import type { StrengthSubcategory, CardioSubcategory, YogaSubcategory, WorkoutGoal } from "@/types"
import { workoutColors } from "@/lib/theme-colors"

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

export function getGoalOptions(
  t: any
): Record<string, { value: string; label: string; emoji: string }[]> {
  return {
    strength: [
      { value: "mass", label: t("workout.goals.mass"), emoji: "💪" },
      { value: "relief", label: t("workout.goals.relief"), emoji: "🔥" },
      { value: "strength", label: t("workout.goals.strength"), emoji: "🏋️" },
      { value: "endurance", label: t("workout.goals.endurance"), emoji: "⏱️" },
    ],
    cardio: [
      { value: "endurance", label: t("workout.goals.endurance"), emoji: "⏱️" },
      { value: "fat_loss", label: t("workout.goals.fatLoss"), emoji: "🔥" },
      { value: "recovery", label: t("workout.goals.recovery"), emoji: "🧘" },
    ],
    yoga: [
      { value: "flexibility", label: t("workout.goals.flexibility"), emoji: "🤸" },
      { value: "strength", label: t("workout.goals.strength"), emoji: "🏋️" },
      { value: "relaxation", label: t("workout.goals.relaxation"), emoji: "🧘" },
      { value: "balance", label: t("workout.goals.balance"), emoji: "⚖️" },
    ],
    stretching: [
      { value: "flexibility", label: t("workout.goals.flexibility"), emoji: "🤸" },
      { value: "mobility", label: t("workout.goals.mobility"), emoji: "🏃" },
      { value: "recovery", label: t("workout.goals.recovery"), emoji: "🧘" },
      { value: "relaxation", label: t("workout.goals.relaxation"), emoji: "🧘" },
    ],
  }
}

// Emoji для интенсивности
export function getIntensityEmoji(intensity: string): string {
  const emojis: Record<string, string> = {
    low: "🟢",
    medium: "🟡",
    high: "🔴",
  }
  return emojis[intensity] || ""
}

// Emoji для оборудования
export function getEquipmentEmoji(equipment: string): string {
  const emojis: Record<string, string> = {
    // Strength
    Dumbbels: "🏋️",
    Barbell: "🏋️",
    Kettlebell: "🔔",
    Bench: "🪑",
    "Pull-up Bar": "🤸",
    "Parallel Bars": "🤸",
    "Cable Crossover": "🔗",
    "Smith Machine": "🏗️",
    "Resistance Bands": "🎯",
    "Medicine Ball": "⚽",
    TRX: "🔗",
    "No Equipment": "🙅",
    // Cardio
    Treadmill: "🏃",
    Elliptical: "🚴",
    "Exercise Bike": "🚲",
    "Rowing Machine": "🚣",
    "Jump Rope": "🪢",
    Stepper: "🪜",
    // Yoga
    Mat: "🧘",
    Blocks: "🧱",
    Strap: "🎯",
    Bolster: "🛋️",
    Blanket: "🛏️",
    Chair: "🪑",
    Wall: "🧱",
    // Stretching
    "Foam Roller": "🌀",
    Ball: "⚽",
  }
  // Поиск по ключу (частичное совпадение)
  for (const [key, emoji] of Object.entries(emojis)) {
    if (equipment.toLowerCase().includes(key.toLowerCase())) {
      return emoji
    }
  }
  return "🏋️" // Default
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
  workoutIntensity: string
  setWorkoutIntensity: (value: string) => void
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
  workoutIntensity,
  setWorkoutIntensity,
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
                            ? `${workoutColors.strength.DEFAULT} text-white ${workoutColors.strength.border}`
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
                            ? `${workoutColors.strength.DEFAULT} text-white ${workoutColors.strength.border}`
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
                            ? `${workoutColors.cardio.DEFAULT} text-white ${workoutColors.cardio.border}`
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
                            ? `${workoutColors.cardio.DEFAULT} text-white ${workoutColors.cardio.border}`
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
                            ? `${workoutColors.yoga.DEFAULT} text-white ${workoutColors.yoga.border}`
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
                            ? `${workoutColors.yoga.DEFAULT} text-white ${workoutColors.yoga.border}`
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
                            ? `${workoutColors.yoga.DEFAULT} text-white ${workoutColors.yoga.border}`
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
                            ? `${workoutColors.stretching.DEFAULT} text-white ${workoutColors.stretching.border}`
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
                            ? `${workoutColors.stretching.DEFAULT} text-white ${workoutColors.stretching.border}`
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
              <Combobox
                options={[
                  {
                    id: "low",
                    label: `${getIntensityEmoji("low")} ${t("workout.intensityLevels.low")}`,
                  },
                  {
                    id: "medium",
                    label: `${getIntensityEmoji("medium")} ${t("workout.intensityLevels.medium")}`,
                  },
                  {
                    id: "high",
                    label: `${getIntensityEmoji("high")} ${t("workout.intensityLevels.high")}`,
                  },
                ]}
                value={workoutIntensity}
                onChange={(value) => {
                  setWorkoutIntensity(value as string)
                  setValue("intensity", value as "low" | "medium" | "high")
                }}
                placeholder={t("workout.intensity")}
                allowCustom={false}
                searchable={false}
                className="emoji"
              />
            </div>
          </div>

          {/* Инвентарь и Цель тренировки - в одну строку */}
          <div className="grid grid-cols-2 gap-4">
            {/* Инвентарь */}
            {currentEquipment.length > 0 && (
              <div className="space-y-2">
                <Label>{t("workout.equipment")}</Label>
                <Combobox
                  options={currentEquipment.map((opt) => ({
                    id: opt,
                    label: `${getEquipmentEmoji(opt)} ${opt}`,
                  }))}
                  value={workoutEquipment}
                  onChange={(value) => setWorkoutEquipment(value as string)}
                  placeholder={t("workout.equipment")}
                  allowCustom={true}
                  searchable={false}
                  className="emoji"
                />
              </div>
            )}

            {/* Цель тренировки */}
            {currentGoals.length > 0 && (
              <div className="space-y-2">
                <Label>{t("workout.goal")}</Label>
                <Combobox
                  options={currentGoals.map((g) => ({
                    id: g.value,
                    label: `${g.emoji} ${g.label}`,
                  }))}
                  value={workoutGoal}
                  onChange={(value) => setWorkoutGoal(value as string)}
                  placeholder={t("workout.goal")}
                  allowCustom={false}
                  searchable={false}
                  className="emoji"
                />
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
                <Combobox
                  options={[
                    { id: "beginner", label: t("workout.yogaSubcategories.beginner") },
                    { id: "intermediate", label: t("workout.yogaSubcategories.intermediate") },
                    { id: "advanced", label: t("workout.yogaSubcategories.advanced") },
                  ]}
                  value={yogaLevel}
                  onChange={(value) => setYogaLevel(value as string)}
                  placeholder={t("workout.level")}
                  allowCustom={false}
                  searchable={false}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("workout.focus")}</Label>
                <Combobox
                  options={[
                    { id: "flexibility", label: t("workout.goals.flexibility") },
                    { id: "strength", label: t("workout.goals.strength") },
                    { id: "relaxation", label: t("workout.goals.relaxation") },
                    { id: "meditation", label: t("workout.yogaSubcategories.meditation") },
                    { id: "breathing", label: t("workout.yogaSubcategories.breathing") },
                  ]}
                  value={yogaFocus}
                  onChange={(value) => setYogaFocus(value as string)}
                  placeholder={t("workout.focus")}
                  allowCustom={false}
                  searchable={false}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
