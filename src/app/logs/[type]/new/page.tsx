"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Bell } from "@/lib/icons"
import { CreateFormActions } from "@/components/shared/form-actions"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, createEntity, initializeDatabase, getCategoriesByType } from "@/lib/db"
import {
  FoodForm,
  WorkoutForm,
  FinanceForm,
  categoryColors,
  financeTypeColors,
  typeLabels,
  foodCategoryOrder,
  workoutCategoryOrder,
  getSubcategoryLabel,
  financeCategories,
  suppliers,
} from "@/components/logs"
import type {
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

// Form schemas
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

const foodSchema = baseLogSchema.extend({
  title: z.string().min(1, "Введите название"),
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
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [targetAccountId, setTargetAccountId] = useState<string>("")

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

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

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

  // Получаем текущую категорию тренировки
  const selectedWorkoutCategory = categories.find((c) => c.id === selectedCategoryId)?.name || ""

  useEffect(() => {
    async function loadData() {
      await initializeDatabase()
      const cats = await getCategoriesByType(type)

      // Сортируем категории в нужном порядке
      let sortedCats = cats
      if (type === "food") {
        const orderCats = foodCategoryOrder
          .map((name) => cats.find((c) => c.name === name))
          .filter(Boolean) as Category[]
        const remainingCats = cats.filter((c) => !foodCategoryOrder.includes(c.name))
        sortedCats = [...orderCats, ...remainingCats]
      } else if (type === "workout") {
        const orderCats = workoutCategoryOrder
          .map((name) => cats.find((c) => c.name === name))
          .filter(Boolean) as Category[]
        const remainingCats = cats.filter((c) => !workoutCategoryOrder.includes(c.name))
        sortedCats = [...orderCats, ...remainingCats]
      }

      setCategories(sortedCats)

      if (sortedCats.length > 0) {
        const defaultCat = sortedCats[0]
        setSelectedCategoryId(defaultCat.id)
        setValue("category_id", defaultCat.id)
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
        setCategoryError("Выберите категорию")
        return
      }
      setCategoryError("")

      if (!selectedAccountId) {
        setAccountError("Выберите аккаунт")
        return
      }
      setAccountError("")
    }

    // Проверяем единицу измерения если указано количество
    const quantity = data.quantity
    const unit = watch("unit")
    if (quantity !== undefined && quantity !== null && !isNaN(quantity) && quantity > 0 && !unit) {
      setUnitError("Выберите единицу измерения")
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
          title = "Финансовая операция"
        }
      } else if (type === "workout") {
        const subcategoryLabel = getSubcategoryLabel(selectedWorkoutCategory, workoutSubcategory)
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
      })

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
        const amount = data.value

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
    <AppLayout title={`Новая запись: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6 overflow-x-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Основное</CardTitle>
                <div className="flex items-center gap-2">
                  <Input type="date" className="w-auto" {...register("date")} />
                  <Input type="time" className="w-auto" {...register("time")} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tabs для категорий питания и тренировок */}
              {(type === "food" || type === "workout") && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Tabs
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setValue("category_id", value)
                      // Сбрасываем подкатегорию при смене типа тренировки
                      if (type === "workout") {
                        setWorkoutSubcategory("")
                        setWorkoutEquipment("")
                        setWorkoutGoal("")
                      }
                    }}
                  >
                    <TabsList
                      className="grid w-full"
                      style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}
                    >
                      {categories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className={categoryColors[cat.name] || ""}
                        >
                          {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Tabs для типа финансов */}
              {type === "finance" && (
                <div className="space-y-2">
                  <Label>Тип</Label>
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
                      <TabsTrigger value="income" className={financeTypeColors["income"]}>
                        Доход
                      </TabsTrigger>
                      <TabsTrigger value="expense" className={financeTypeColors["expense"]}>
                        Расход
                      </TabsTrigger>
                      <TabsTrigger value="transfer" className={financeTypeColors["transfer"]}>
                        Перевод
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
              <CardTitle>Дополнительно</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Textarea id="notes" placeholder="Ваши заметки..." {...register("notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Теги</Label>
                <Input id="tags" placeholder="теги через запятую" {...register("tags")} />
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
                    Напоминание
                  </CardTitle>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createReminder}
                      onChange={(e) => setCreateReminder(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Создать</span>
                  </label>
                </div>
              </CardHeader>
              {createReminder && (
                <CardContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Время напоминания</Label>
                      <input
                        type="time"
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Дни</Label>
                      <div className="flex gap-1 flex-wrap">
                        {dayNames.map((day, i) => (
                          <Button
                            key={i}
                            type="button"
                            variant={reminderDays.includes(i) ? "default" : "outline"}
                            size="sm"
                            className="px-2 h-8"
                            onClick={() => toggleReminderDay(i)}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Напоминание появится на странице напоминаний
                  </p>
                </CardContent>
              )}
            </Card>
          )}

          {/* Actions */}
          <CreateFormActions
            onCancel={() => router.back()}
            onSave={handleSubmit(onSubmit)}
            saveText="Сохранить"
            isSaving={isLoading}
          />
        </form>
      </div>
    </AppLayout>
  )
}
