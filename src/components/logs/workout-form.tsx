"use client"

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { ChevronDown } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxSelect } from "./combobox-select"
import type { StrengthSubcategory, CardioSubcategory, YogaSubcategory, WorkoutGoal } from "@/types"

// ============================================
// Схема валидации
// ============================================

const baseLogSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  title: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const workoutSchema = baseLogSchema.extend({
  title: z.string().min(1, "Введите название"),
  duration: z.number().optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
})

export type WorkoutFormData = z.infer<typeof workoutSchema>

// ============================================
// Константы
// ============================================

// Силовые тренировки - подкатегории
export const strengthSubcategories = {
  anatomical: {
    label: "По анатомическому принципу",
    options: [
      { value: "chest", label: "Грудь" },
      { value: "back", label: "Спина" },
      { value: "legs", label: "Ноги" },
      { value: "shoulders", label: "Плечи" },
      { value: "arms", label: "Руки" },
      { value: "core", label: "Пресс (Кор)" },
    ],
  },
  equipment: {
    label: "По типу оборудования",
    options: [
      { value: "free_weights", label: "Свободные веса" },
      { value: "machines", label: "Тренажеры" },
      { value: "bodyweight", label: "С собственным весом" },
      { value: "functional", label: "Функциональный тренинг" },
    ],
  },
}

// Кардио - подкатегории
export const cardioSubcategories = {
  activity: {
    label: "По типу активности",
    options: [
      { value: "running", label: "Бег" },
      { value: "walking", label: "Ходьба" },
      { value: "cycling", label: "Велосипед" },
      { value: "rowing", label: "Гребля" },
      { value: "jumping", label: "Прыжки" },
    ],
  },
  intensity: {
    label: "По интенсивности",
    options: [
      { value: "liss", label: "LISS (низкоинтенсивное)" },
      { value: "hiit", label: "HIIT (интервальное)" },
      { value: "tabata", label: "Табата" },
    ],
  },
}

// Йога - подкатегории
export const yogaSubcategories = {
  style: {
    label: "По стилю",
    options: [
      { value: "hatha", label: "Хатха-йога" },
      { value: "vinyasa", label: "Виньяса-йога" },
      { value: "ashtanga", label: "Аштанга-йога" },
      { value: "kundalini", label: "Кундалини-йога" },
      { value: "iyengar", label: "Айенгар-йога" },
    ],
  },
  goal: {
    label: "По целям",
    options: [
      { value: "stretching", label: "Стретчинг / Гибкость" },
      { value: "power", label: "Силовая йога" },
      { value: "relax", label: "Релакс / Восстановление" },
      { value: "breathing", label: "Дыхание и медитация" },
    ],
  },
  level: {
    label: "По уровню",
    options: [
      { value: "beginner", label: "Для начинающих" },
      { value: "intermediate", label: "Для продолжающих" },
      { value: "advanced", label: "Для опытных" },
    ],
  },
}

// Инвентарь для тренировок
export const equipmentOptions: Record<string, string[]> = {
  strength: [
    "Штанга",
    "Гантели",
    "Гири",
    "Блочный тренажер",
    "Рычажный тренажер",
    "Скамья",
    "Турник",
    "Брусья",
    "Кроссовер",
    "Смит-машина",
    "Резинки",
    "Медбол",
    "TRX",
    "Без инвентаря",
  ],
  cardio: [
    "Беговая дорожка",
    "Эллипсоид",
    "Велотренажер",
    "Гребной тренажер",
    "Скакалка",
    "Степпер",
    "Без инвентаря",
  ],
  yoga: ["Коврик", "Кирпичи", "Ремень", "Болстер", "Одеяло", "Стул", "Стена", "Без инвентаря"],
}

// Цели тренировок
export const goalOptions: Record<string, { value: string; label: string }[]> = {
  strength: [
    { value: "mass", label: "Набор массы" },
    { value: "relief", label: "Рельеф" },
    { value: "strength", label: "Сила" },
    { value: "endurance", label: "Выносливость" },
  ],
  cardio: [
    { value: "endurance", label: "Выносливость" },
    { value: "fat_loss", label: "Сжигание жира" },
    { value: "recovery", label: "Восстановление" },
  ],
  yoga: [
    { value: "flexibility", label: "Гибкость" },
    { value: "strength", label: "Сила" },
    { value: "relaxation", label: "Расслабление" },
    { value: "balance", label: "Баланс" },
  ],
}

// Функция для получения метки подкатегории
export function getSubcategoryLabel(category: string, value: string): string {
  if (category === "Силовая") {
    const allOptions = [
      ...strengthSubcategories.anatomical.options,
      ...strengthSubcategories.equipment.options,
    ]
    const found = allOptions.find((opt) => opt.value === value)
    return found?.label || ""
  }
  if (category === "Кардио") {
    const allOptions = [
      ...cardioSubcategories.activity.options,
      ...cardioSubcategories.intensity.options,
    ]
    const found = allOptions.find((opt) => opt.value === value)
    return found?.label || ""
  }
  if (category === "Йога") {
    const allOptions = [
      ...yogaSubcategories.style.options,
      ...yogaSubcategories.goal.options,
      ...yogaSubcategories.level.options,
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
  // Получаем подкатегории для текущего типа тренировки
  const currentWorkoutSubcategories =
    selectedCategory === "Силовая"
      ? strengthSubcategories
      : selectedCategory === "Кардио"
        ? cardioSubcategories
        : selectedCategory === "Йога"
          ? yogaSubcategories
          : null

  // Получаем инвентарь для текущего типа тренировки
  const currentEquipment =
    selectedCategory === "Силовая"
      ? equipmentOptions.strength
      : selectedCategory === "Кардио"
        ? equipmentOptions.cardio
        : selectedCategory === "Йога"
          ? equipmentOptions.yoga
          : []

  // Получаем цели для текущего типа тренировки
  const currentGoals =
    selectedCategory === "Силовая"
      ? goalOptions.strength
      : selectedCategory === "Кардио"
        ? goalOptions.cardio
        : selectedCategory === "Йога"
          ? goalOptions.yoga
          : []

  return (
    <>
      {/* Подкатегории для тренировок */}
      {currentWorkoutSubcategories && (
        <Card>
          <CardHeader>
            <CardTitle>Подкатегория</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Подкатегории для Силовой тренировки */}
            {selectedCategory === "Силовая" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {strengthSubcategories.anatomical.label}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {strengthSubcategories.anatomical.options.map((opt) => (
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
                    {strengthSubcategories.equipment.label}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {strengthSubcategories.equipment.options.map((opt) => (
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

            {/* Подкатегории для Кардио */}
            {selectedCategory === "Кардио" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {cardioSubcategories.activity.label}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {cardioSubcategories.activity.options.map((opt) => (
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
                    {cardioSubcategories.intensity.label}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {cardioSubcategories.intensity.options.map((opt) => (
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

            {/* Подкатегории для Йоги */}
            {selectedCategory === "Йога" && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {yogaSubcategories.style.label}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {yogaSubcategories.style.options.map((opt) => (
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
                    {yogaSubcategories.goal.label}
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {yogaSubcategories.goal.options.map((opt) => (
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
                    {yogaSubcategories.level.label}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {yogaSubcategories.level.options.map((opt) => (
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
          </CardContent>
        </Card>
      )}

      {/* Параметры тренировки */}
      <Card>
        <CardHeader>
          <CardTitle>Параметры тренировки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Длительность (мин)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Интенсивность</Label>
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
                    Выберите
                  </option>
                  <option value="low">Низкая</option>
                  <option value="medium">Средняя</option>
                  <option value="high">Высокая</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
              </div>
            </div>
          </div>

          {/* Инвентарь */}
          {currentEquipment.length > 0 && (
            <ComboboxSelect
              label="Инвентарь"
              options={currentEquipment}
              value={workoutEquipment}
              onChange={setWorkoutEquipment}
              placeholder="Выберите инвентарь"
            />
          )}

          {/* Цель тренировки */}
          {currentGoals.length > 0 && (
            <div className="space-y-2">
              <Label>Цель</Label>
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
                    Выберите цель
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
        </CardContent>
      </Card>

      {/* Дополнительные параметры */}
      <Card>
        <CardHeader>
          <CardTitle>Дополнительные параметры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Калории и дистанция */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caloriesBurned">Сожжено калорий</Label>
              <Input
                id="caloriesBurned"
                type="number"
                placeholder="ккал"
                value={caloriesBurned ?? ""}
                onChange={(e) =>
                  setCaloriesBurned(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            {/* Дистанция - только для кардио */}
            {selectedCategory === "Кардио" && (
              <div className="space-y-2">
                <Label htmlFor="distance">Дистанция (км)</Label>
                <Input
                  id="distance"
                  type="number"
                  step="0.1"
                  placeholder="км"
                  value={distance ?? ""}
                  onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            )}
          </div>

          {/* Пульс */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heartRateAvg">Средний пульс</Label>
              <Input
                id="heartRateAvg"
                type="number"
                placeholder="уд/мин"
                value={heartRateAvg ?? ""}
                onChange={(e) =>
                  setHeartRateAvg(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heartRateMax">Макс. пульс</Label>
              <Input
                id="heartRateMax"
                type="number"
                placeholder="уд/мин"
                value={heartRateMax ?? ""}
                onChange={(e) =>
                  setHeartRateMax(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Упражнения, подходы, повторы и вес - только для силовой */}
          {selectedCategory === "Силовая" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercisesCount">Кол-во упражнений</Label>
                  <Input
                    id="exercisesCount"
                    type="number"
                    placeholder="шт"
                    value={exercisesCount ?? ""}
                    onChange={(e) =>
                      setExercisesCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setsCount">Кол-во подходов</Label>
                  <Input
                    id="setsCount"
                    type="number"
                    placeholder="шт"
                    value={setsCount ?? ""}
                    onChange={(e) =>
                      setSetsCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="repsCount">Кол-во повторов</Label>
                  <Input
                    id="repsCount"
                    type="number"
                    placeholder="шт"
                    value={repsCount ?? ""}
                    onChange={(e) =>
                      setRepsCount(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">Общий вес</Label>
                  <Input
                    id="totalWeight"
                    type="number"
                    step="0.1"
                    placeholder="кг"
                    value={totalWeight ?? ""}
                    onChange={(e) =>
                      setTotalWeight(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Скорость, темп, раунды - только для кардио */}
          {selectedCategory === "Кардио" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageSpeed">Средняя скорость (км/ч)</Label>
                  <Input
                    id="averageSpeed"
                    type="number"
                    step="0.1"
                    placeholder="км/ч"
                    value={averageSpeed ?? ""}
                    onChange={(e) =>
                      setAverageSpeed(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="averagePace">Средний темп (мин/км)</Label>
                  <Input
                    id="averagePace"
                    type="text"
                    placeholder="5:30"
                    value={averagePace}
                    onChange={(e) => setAveragePace(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rounds">Кол-во раундов</Label>
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
          {selectedCategory === "Йога" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Уровень</Label>
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
                      Выберите уровень
                    </option>
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Продолжающий</option>
                    <option value="advanced">Опытный</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Фокус</Label>
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
                      Выберите фокус
                    </option>
                    <option value="flexibility">Гибкость</option>
                    <option value="strength">Сила</option>
                    <option value="relaxation">Расслабление</option>
                    <option value="meditation">Медитация</option>
                    <option value="breathing">Дыхание</option>
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
