"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Bell, Utensils, Wallet, Footprints, Wind, Activity } from "@/lib/icons"
import { CreateFormActions } from "@/components/shared/form-actions"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { db, createEntity, initializeDatabase, getCategoriesByType } from "@/lib/db"
import { useTranslations, useLocale } from "next-intl"
import {
  FoodForm,
  WorkoutForm,
  FinanceForm,
  categoryColors,
  financeTypeColors,
  typeLabels,
  getSubcategoryLabel,
} from "@/components/logs"
import type {
  Log,
  LogType,
  Category,
  FoodMetadata,
  WorkoutMetadata,
  FinanceMetadata,
  FinanceType,
  Account,
  StrengthSubcategory,
  CardioSubcategory,
  YogaSubcategory,
  WorkoutGoal,
} from "@/types"

// ============================================
// Фиксированные типы для питания и тренировок
// ============================================

export const foodTypeOptions = [
  { value: "breakfast", label: "Breakfast", emoji: "🥐" },
  { value: "lunch", label: "Lunch", emoji: "🍲" },
  { value: "dinner", label: "Dinner", emoji: "🥪" },
  { value: "snack", label: "Snack", emoji: "☕" },
]

export const workoutTypeOptions = [
  { value: "strength" },
  { value: "cardio" },
  { value: "yoga" },
  { value: "stretching" },
]

// Form schemas
const baseLogSchema = z.object({
  date: z.string().min(1, "Date required"),
  time: z.string().min(1, "Time required"),
  title: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.number().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const foodSchema = baseLogSchema.extend({
  title: z.string().min(1, "Title required"),
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
})

const workoutSchema = baseLogSchema.extend({
  duration: z.number().optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
})

const financeSchema = baseLogSchema.extend({
  finance_type: z.enum(["income", "expense", "transfer"]),
  account_id: z.string().optional(),
})

type FormData =
  | z.infer<typeof foodSchema>
  | z.infer<typeof workoutSchema>
  | z.infer<typeof financeSchema>

export default function NewLogPage() {
  const t = useTranslations("logs")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [targetAccountId, setTargetAccountId] = useState<string>("")
  const [workoutIntensity, setWorkoutIntensity] = useState<string>("")

  // Состояния для зависимых списков финансов
  const [financeCategory, setFinanceCategory] = useState("")
  const [financeSubcategory, setFinanceSubcategory] = useState("")
  const [financeItem, setFinanceItem] = useState("")
  const [financeSupplier, setFinanceSupplier] = useState("")

  // Ошибки валидации
  const [categoryError, setCategoryError] = useState("")
  const [accountError, setAccountError] = useState("")
  const [unitError, setUnitError] = useState("")

  // Состояния для тренировок
  const [workoutSubcategory, setWorkoutSubcategory] = useState<string>("")
  const [workoutEquipment, setWorkoutEquipment] = useState<string>("")
  const [workoutGoal, setWorkoutGoal] = useState<string>("")
  const [caloriesBurned, setCaloriesBurned] = useState<number | undefined>()
  const [distance, setDistance] = useState<number | undefined>()
  const [heartRateAvg, setHeartRateAvg] = useState<number | undefined>()
  const [heartRateMax, setHeartRateMax] = useState<number | undefined>()
  const [exercisesCount, setExercisesCount] = useState<number | undefined>()
  const [setsCount, setSetsCount] = useState<number | undefined>()
  const [repsCount, setRepsCount] = useState<number | undefined>()
  const [totalWeight, setTotalWeight] = useState<number | undefined>()
  const [averageSpeed, setAverageSpeed] = useState<number | undefined>()
  const [averagePace, setAveragePace] = useState<string>("")
  const [rounds, setRounds] = useState<number | undefined>()
  const [yogaLevel, setYogaLevel] = useState<string>("")
  const [yogaFocus, setYogaFocus] = useState<string>("")

  // Состояния для напоминания
  const [createReminder, setCreateReminder] = useState(false)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5]) // По будням по умолчанию

  const dayNamesShort = ["su", "mo", "tu", "we", "th", "fr", "sa"]

  function toggleReminderDay(day: number) {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      type === "food" ? foodSchema : type === "workout" ? workoutSchema : financeSchema
    ),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
      finance_type: "expense",
    } as FormData,
  })

  // Получаем текущий тип тренировки (фиксированный)
  const selectedWorkoutCategory =
    selectedCategoryId.charAt(0).toUpperCase() + selectedCategoryId.slice(1)

  useEffect(() => {
    async function loadData() {
      await initializeDatabase()

      // Для питания и тренировок используем фиксированные типы
      if (type === "food") {
        setSelectedCategoryId(foodTypeOptions[0].value)
        setValue("category_id", foodTypeOptions[0].value)
        return
      }

      if (type === "workout") {
        setSelectedCategoryId(workoutTypeOptions[0].value)
        setValue("category_id", workoutTypeOptions[0].value)
        return
      }

      // Для финансов загружаем категории из базы
      const cats = await getCategoriesByType(type)
      setCategories(cats)

      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id)
        setValue("category_id", cats[0].id)
      }

      // Загружаем аккаунты для финансов
      if (type === "finance") {
        const accs = await db.accounts.toArray()
        setAccounts(accs)
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id)
          setValue("account_id", accs[0].id)
        }
      }
    }
    loadData()
  }, [type])

  const onSubmit = async (data: FormData) => {
    // Для финансов проверяем обязательные поля
    if (type === "finance") {
      if (!financeCategory) {
        setCategoryError(t("finance.category"))
        return
      }
      setCategoryError("")

      if (!selectedAccountId) {
        setAccountError(t("finance.account"))
        return
      }
      setAccountError("")
    }

    // Проверяем единицу измерения если указано количество
    const quantity = data.quantity
    const unit = watch("unit")
    if (quantity !== undefined && quantity !== null && !isNaN(quantity) && quantity > 0 && !unit) {
      setUnitError(t("fields.unit"))
      return
    }
    setUnitError("")

    setIsLoading(true)
    try {
      const dateTime = `${data.date}T${data.time}:00`

      // Формируем title
      let title = data.title || ""
      if (type === "finance") {
        const parts = [financeCategory, financeSubcategory, financeItem].filter(Boolean)
        if (parts.length > 0) {
          title = parts.join(" → ")
        } else {
          title = t("finance.type")
        }
      } else if (type === "workout") {
        const subcategoryLabel = getSubcategoryLabel(t, selectedWorkoutCategory, workoutSubcategory)
        if (subcategoryLabel) {
          title = `${selectedWorkoutCategory} (${subcategoryLabel})`
        } else {
          title = selectedWorkoutCategory
        }
      }

      const baseData = {
        type,
        date: dateTime,
        title: title,
        category_id: data.category_id || undefined,
        quantity: data.quantity,
        unit: data.unit,
        value: data.value,
        notes: data.notes,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      }

      let metadata: FoodMetadata | WorkoutMetadata | FinanceMetadata | undefined

      if (type === "food") {
        const foodData = data as z.infer<typeof foodSchema>
        metadata = {
          calories: foodData.calories,
          protein: foodData.protein,
          fat: foodData.fat,
          carbs: foodData.carbs,
        }
      } else if (type === "workout") {
        const workoutData = data as z.infer<typeof workoutSchema>
        metadata = {
          duration: workoutData.duration,
          intensity: workoutData.intensity,
          subcategory: workoutSubcategory as
            | StrengthSubcategory
            | CardioSubcategory
            | YogaSubcategory
            | undefined,
          equipment: workoutEquipment || undefined,
          goal: workoutGoal as WorkoutGoal | undefined,
          calories_burned: caloriesBurned,
          distance: distance,
          heart_rate_avg: heartRateAvg,
          heart_rate_max: heartRateMax,
          exercises_count: exercisesCount,
          sets_count: setsCount,
          reps_count: repsCount,
          total_weight: totalWeight,
          average_speed: averageSpeed,
          average_pace: averagePace || undefined,
          rounds: rounds,
          level: yogaLevel as "beginner" | "intermediate" | "advanced" | undefined,
          focus: yogaFocus as
            | "flexibility"
            | "strength"
            | "relaxation"
            | "meditation"
            | "breathing"
            | undefined,
        }
      } else if (type === "finance") {
        const financeData = data as z.infer<typeof financeSchema>
        metadata = {
          finance_type: financeData.finance_type as FinanceType,
          account_id: financeData.account_id,
          category: financeCategory,
          subcategory: financeSubcategory,
          item: financeItem,
          supplier: financeSupplier,
          target_account_id: financeType === "transfer" ? targetAccountId : undefined,
        } as FinanceMetadata & {
          category?: string
          subcategory?: string
          item?: string
          supplier?: string
          target_account_id?: string
        }
      }

      const logId = await createEntity(db.logs, {
        ...baseData,
        metadata,
      } as Partial<Log>)

      // Создаём напоминание если нужно
      if (createReminder && (type === "food" || type === "workout")) {
        const reminderTitle = type === "food" ? `Приём пищи: ${title}` : `Тренировка: ${title}`

        await createEntity(db.reminders, {
          type: type as "food" | "workout",
          title: reminderTitle,
          message: `Напоминание о ${type === "food" ? "приёме пищи" : "тренировке"}`,
          time: reminderTime,
          days: reminderDays,
          priority: "medium",
          is_active: true,
          sound: true,
          vibration: true,
          persistent: false,
          related_id: logId,
          related_type: "log",
          streak: 0,
          longest_streak: 0,
          total_completed: 0,
        })
      }

      // Обновляем балансы аккаунтов
      if (type === "finance" && data.value) {
        // Используем Math.abs() чтобы гарантировать положительное значение
        const amount = Math.abs(data.value)

        if (financeType === "income" && selectedAccountId) {
          const account = accounts.find((a) => a.id === selectedAccountId)
          if (account) {
            await db.accounts.update(selectedAccountId, {
              balance: account.balance + amount,
              updated_at: new Date().toISOString(),
            })
          }
        } else if (financeType === "expense" && selectedAccountId) {
          const account = accounts.find((a) => a.id === selectedAccountId)
          if (account) {
            await db.accounts.update(selectedAccountId, {
              balance: account.balance - amount,
              updated_at: new Date().toISOString(),
            })
          }
        } else if (financeType === "transfer" && selectedAccountId && targetAccountId) {
          const fromAccount = accounts.find((a) => a.id === selectedAccountId)
          const toAccount = accounts.find((a) => a.id === targetAccountId)
          if (fromAccount && toAccount) {
            await Promise.all([
              db.accounts.update(selectedAccountId, {
                balance: fromAccount.balance - amount,
                updated_at: new Date().toISOString(),
              }),
              db.accounts.update(targetAccountId, {
                balance: toAccount.balance + amount,
                updated_at: new Date().toISOString(),
              }),
            ])
          }
        }
      }

      router.push("/logs")
    } catch (error) {
      console.error("Failed to create log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={`${tCommon("new")}: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6 overflow-x-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tCommon("main")}</CardTitle>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-auto justify-start text-left font-normal",
                          !watch("date") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(() => {
                          const dateValue = watch("date")
                          return dateValue ? (
                            format(new Date(dateValue), "LLL dd, y", { locale: dateFnsLocale })
                          ) : (
                            <span>{t("fields.date")}</span>
                          )
                        })()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <Calendar
                        mode="single"
                        selected={watch("date") ? new Date(watch("date")!) : undefined}
                        onSelect={(date) =>
                          setValue("date", date ? format(date, "yyyy-MM-dd") : "")
                        }
                        initialFocus
                        locale={dateFnsLocale}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" className="w-auto" {...register("time")} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tabs для типов питания и тренировок (фиксированные, не редактируются) */}
              {type === "food" && (
                <div className="space-y-2">
                  <Label>{t("fields.type")}</Label>
                  <Tabs
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setValue("category_id", value)
                    }}
                  >
                    <TabsList className="grid grid-cols-4">
                      {foodTypeOptions.map((opt) => (
                        <TabsTrigger
                          key={opt.value}
                          value={opt.value}
                          className={categoryColors[opt.label] || ""}
                        >
                          <span className="mr-1">{opt.emoji}</span>
                          <span className="hidden sm:inline">{opt.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {type === "workout" && (
                <div className="space-y-2">
                  <Label>{t("fields.type")}</Label>
                  <Tabs
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setValue("category_id", value)
                      // Сбрасываем подкатегорию при смене типа тренировки
                      setWorkoutSubcategory("")
                      setWorkoutEquipment("")
                      setWorkoutGoal("")
                    }}
                  >
                    <TabsList className="grid grid-cols-4">
                      {workoutTypeOptions.map((opt) => {
                        const labelKey = opt.value.charAt(0).toUpperCase() + opt.value.slice(1)
                        const emojiMap: Record<string, string> = {
                          strength: "💪",
                          cardio: "🏃",
                          yoga: "🧘",
                          stretching: "🤸",
                        }
                        return (
                          <TabsTrigger
                            key={opt.value}
                            value={opt.value}
                            className={cn(
                              categoryColors[labelKey] || "",
                              "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
                            )}
                          >
                            <span className="mr-1 flex-shrink-0">{emojiMap[opt.value] || ""}</span>
                            <span className="hidden sm:inline truncate">
                              {tCommon(`workout.types.${opt.value}`)}
                            </span>
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Tabs для типа финансов */}
              {type === "finance" && (
                <div className="space-y-2">
                  <Label>{t("finance.type")}</Label>
                  <Tabs
                    value={financeType}
                    onValueChange={(value) => {
                      setFinanceType(value)
                      setValue("finance_type", value as "income" | "expense" | "transfer")
                      // Сбрасываем все зависимые поля при смене типа
                      setFinanceCategory("")
                      setFinanceSubcategory("")
                      setFinanceItem("")
                      setFinanceSupplier("")
                      setTargetAccountId("")
                    }}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger
                        value="income"
                        className={cn(
                          financeTypeColors["income"],
                          "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
                        )}
                      >
                        <span className="mr-1 flex-shrink-0">📈</span>
                        <span className="truncate">{t("finance.types.income")}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="expense"
                        className={cn(
                          financeTypeColors["expense"],
                          "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
                        )}
                      >
                        <span className="mr-1 flex-shrink-0">📉</span>
                        <span className="truncate">{t("finance.types.expense")}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="transfer"
                        className={cn(
                          financeTypeColors["transfer"],
                          "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
                        )}
                      >
                        <span className="mr-1 flex-shrink-0">🔄</span>
                        <span className="truncate">{t("finance.types.transfer")}</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Food Form */}
              {type === "food" && (
                <FoodForm
                  register={register as Parameters<typeof FoodForm>[0]["register"]}
                  watch={watch as Parameters<typeof FoodForm>[0]["watch"]}
                  setValue={setValue as Parameters<typeof FoodForm>[0]["setValue"]}
                  errors={errors as Record<string, { message?: string }>}
                />
              )}

              {/* Finance Form */}
              {type === "finance" && (
                <FinanceForm
                  register={register as Parameters<typeof FinanceForm>[0]["register"]}
                  watch={watch as Parameters<typeof FinanceForm>[0]["watch"]}
                  setValue={setValue as Parameters<typeof FinanceForm>[0]["setValue"]}
                  errors={errors as Record<string, { message?: string }>}
                  accounts={accounts}
                  financeType={financeType}
                  setFinanceType={setFinanceType}
                  selectedAccountId={selectedAccountId}
                  setSelectedAccountId={setSelectedAccountId}
                  targetAccountId={targetAccountId}
                  setTargetAccountId={setTargetAccountId}
                  financeCategory={financeCategory}
                  setFinanceCategory={setFinanceCategory}
                  financeSubcategory={financeSubcategory}
                  setFinanceSubcategory={setFinanceSubcategory}
                  financeItem={financeItem}
                  setFinanceItem={setFinanceItem}
                  financeSupplier={financeSupplier}
                  setFinanceSupplier={setFinanceSupplier}
                />
              )}

              {/* Workout Form */}
              {type === "workout" && (
                <WorkoutForm
                  register={register as Parameters<typeof WorkoutForm>[0]["register"]}
                  watch={watch as Parameters<typeof WorkoutForm>[0]["watch"]}
                  setValue={setValue as Parameters<typeof WorkoutForm>[0]["setValue"]}
                  selectedCategory={selectedWorkoutCategory}
                  workoutSubcategory={workoutSubcategory}
                  setWorkoutSubcategory={setWorkoutSubcategory}
                  workoutEquipment={workoutEquipment}
                  setWorkoutEquipment={setWorkoutEquipment}
                  workoutGoal={workoutGoal}
                  setWorkoutGoal={setWorkoutGoal}
                  workoutIntensity={workoutIntensity}
                  setWorkoutIntensity={setWorkoutIntensity}
                  caloriesBurned={caloriesBurned}
                  setCaloriesBurned={setCaloriesBurned}
                  distance={distance}
                  setDistance={setDistance}
                  heartRateAvg={heartRateAvg}
                  setHeartRateAvg={setHeartRateAvg}
                  heartRateMax={heartRateMax}
                  setHeartRateMax={setHeartRateMax}
                  exercisesCount={exercisesCount}
                  setExercisesCount={setExercisesCount}
                  setsCount={setsCount}
                  setSetsCount={setSetsCount}
                  repsCount={repsCount}
                  setRepsCount={setRepsCount}
                  totalWeight={totalWeight}
                  setTotalWeight={setTotalWeight}
                  averageSpeed={averageSpeed}
                  setAverageSpeed={setAverageSpeed}
                  averagePace={averagePace}
                  setAveragePace={setAveragePace}
                  rounds={rounds}
                  setRounds={setRounds}
                  yogaLevel={yogaLevel}
                  setYogaLevel={setYogaLevel}
                  yogaFocus={yogaFocus}
                  setYogaFocus={setYogaFocus}
                />
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{tCommon("additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">{t("fields.notes")}</Label>
                <Textarea id="notes" placeholder={t("fields.notes")} {...register("notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("fields.tags")} {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          {/* Reminder Section - only for food and workout */}
          {(type === "food" || type === "workout") && (
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    {tCommon("reminders.title")}
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createReminder}
                      onChange={(e) => setCreateReminder(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{tCommon("create")}</span>
                  </label>
                </div>
              </CardHeader>
              {createReminder && (
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{tCommon("reminders.time")}</Label>
                      <input
                        type="time"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{tCommon("reminders.days")}</Label>
                      <div className="flex gap-1 flex-wrap">
                        {dayNamesShort.map((day, i) => (
                          <Button
                            key={i}
                            type="button"
                            variant={reminderDays.includes(i) ? "default" : "outline"}
                            size="sm"
                            className="px-2 h-8"
                            onClick={() => toggleReminderDay(i)}
                          >
                            {tCommon(`reminders.daysOfWeek.${day}`)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{tCommon("reminders.pageHint")}</p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Actions */}
          <CreateFormActions
            onCancel={() => router.back()}
            onSave={handleSubmit(onSubmit)}
            saveText={tCommon("save")}
            isSaving={isLoading}
          />
        </form>
      </div>
    </AppLayout>
  )
}
