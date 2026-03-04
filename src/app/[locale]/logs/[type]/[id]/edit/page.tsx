"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useLocale } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "@/lib/icons"
import { useTranslations } from "next-intl"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PageActions } from "@/components/shared/page-actions"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import {
  db,
  getEntityById,
  updateEntity,
  getCategoriesByType,
  initializeDatabase,
  getStaticEntityTranslation,
} from "@/lib/db"
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
} from "@/components/logs"
import type {
  LogType,
  Category,
  FoodMetadata,
  WorkoutMetadata,
  FinanceMetadata,
  FinanceType,
  Account,
  Log,
  StrengthSubcategory,
  CardioSubcategory,
  YogaSubcategory,
  WorkoutGoal,
} from "@/types"

// Messages for validation (will be used inside component with translations)
const validationMessages = {
  date: "Выберите дату",
  time: "Выберите время",
  title: "Введите название",
}

// Form schemas factory function
function createSchemas(t: (key: string) => string) {
  const messages = {
    date: t("date") || validationMessages.date,
    time: t("time") || validationMessages.time,
    title: t("title") || validationMessages.title,
  }

  return {
    baseLogSchema: z.object({
      date: z.string().min(1, messages.date),
      time: z.string().min(1, messages.time),
      title: z.string().optional(),
      category_id: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
    }),
    foodSchema: z.object({
      date: z.string().min(1, messages.date),
      time: z.string().min(1, messages.time),
      title: z.string().min(1, messages.title),
      category_id: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
      calories: z.number().optional(),
      protein: z.number().optional(),
      fat: z.number().optional(),
      carbs: z.number().optional(),
    }),
    workoutSchema: z.object({
      date: z.string().min(1, messages.date),
      time: z.string().min(1, messages.time),
      title: z.string().min(1, messages.title),
      category_id: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
      duration: z.number().optional(),
      intensity: z.enum(["low", "medium", "high"]).optional(),
    }),
    financeSchema: z.object({
      date: z.string().min(1, messages.date),
      time: z.string().min(1, messages.time),
      title: z.string().optional(),
      category_id: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      tags: z.string().optional(),
      finance_type: z.enum(["income", "expense", "transfer"]),
      account_id: z.string().optional(),
    }),
  }
}

type FormData =
  | z.infer<ReturnType<typeof createSchemas>["foodSchema"]>
  | z.infer<ReturnType<typeof createSchemas>["workoutSchema"]>
  | z.infer<ReturnType<typeof createSchemas>["financeSchema"]>

export default function EditLogPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  const id = params.id as string
  const t = useTranslations("logs")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [log, setLog] = useState<Log | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [targetAccountId, setTargetAccountId] = useState<string>("")

  // Состояния для зависимых списков финансов (храним для каждого типа отдельно)
  const [financeValues, setFinanceValues] = useState({
    income: { category: "", subcategory: "", item: "", supplier: "" },
    expense: { category: "", subcategory: "", item: "", supplier: "" },
    transfer: { category: "", subcategory: "", item: "", supplier: "" },
  })

  const financeCategory = financeValues[financeType as "income" | "expense" | "transfer"].category
  const financeSubcategory =
    financeValues[financeType as "income" | "expense" | "transfer"].subcategory
  const financeItem = financeValues[financeType as "income" | "expense" | "transfer"].item
  const financeSupplier = financeValues[financeType as "income" | "expense" | "transfer"].supplier

  const setFinanceCategory = (value: string) => {
    setFinanceValues((prev) => ({
      ...prev,
      [financeType]: { ...prev[financeType as "income" | "expense" | "transfer"], category: value },
    }))
  }
  const setFinanceSubcategory = (value: string) => {
    setFinanceValues((prev) => ({
      ...prev,
      [financeType]: {
        ...prev[financeType as "income" | "expense" | "transfer"],
        subcategory: value,
      },
    }))
  }
  const setFinanceItem = (value: string) => {
    setFinanceValues((prev) => ({
      ...prev,
      [financeType]: { ...prev[financeType as "income" | "expense" | "transfer"], item: value },
    }))
  }
  const setFinanceSupplier = (value: string) => {
    setFinanceValues((prev) => ({
      ...prev,
      [financeType]: { ...prev[financeType as "income" | "expense" | "transfer"], supplier: value },
    }))
  }

  // Состояния для тренировок
  const [workoutSubcategory, setWorkoutSubcategory] = useState<string>("")
  const [workoutEquipment, setWorkoutEquipment] = useState<string>("")
  const [workoutGoal, setWorkoutGoal] = useState<string>("")
  const [workoutIntensity, setWorkoutIntensity] = useState<string>("")
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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      (() => {
        const schemas = createSchemas((key) => t(`validation.${key}`))
        return type === "food"
          ? schemas.foodSchema
          : type === "workout"
            ? schemas.workoutSchema
            : schemas.financeSchema
      })()
    ),
  })

  // Получаем текущую категорию тренировки
  const selectedWorkoutCategory = categories.find((c) => c.id === selectedCategoryId)?.name || ""

  // Для финансов: находим category_id по ключу financeCategory
  useEffect(() => {
    if (type === "finance" && financeCategory && categories.length > 0) {
      const category = categories.find((c) => c.name === financeCategory)
      if (category) {
        setValue("category_id", category.id)
      }
    }
  }, [financeCategory, categories, type, setValue])

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        const [log, cats, accs] = await Promise.all([
          getEntityById(db.logs, id) as Promise<Log | undefined>,
          getCategoriesByType(type),
          db.accounts.toArray(),
        ])

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
        setAccounts(accs)
        setLog(log || null)

        if (log) {
          // Парсим дату и время из ISO-строки
          const datePart = log.date.split("T")[0]
          const timePart = log.date.includes("T")
            ? log.date.split("T")[1]?.substring(0, 5)
            : new Date().toTimeString().slice(0, 5)

          // Устанавливаем начальные значения для Tabs
          if (log.category_id) {
            setSelectedCategoryId(log.category_id)
          }

          const baseData: Record<string, unknown> = {
            date: datePart,
            time: timePart,
            title: log.title,
            category_id: log.category_id || "",
            quantity: log.quantity,
            unit: log.unit,
            value: log.value,
            notes: log.notes || "",
            tags: log.tags?.join(", ") || "",
          }

          if (log.metadata && type === "food") {
            const m = log.metadata as FoodMetadata
            Object.assign(baseData, {
              calories: m.calories,
              protein: m.protein,
              fat: m.fat,
              carbs: m.carbs,
            })
          } else if (log.metadata && type === "workout") {
            const m = log.metadata as WorkoutMetadata

            // Устанавливаем все специфические поля
            setWorkoutSubcategory(m.subcategory || "")
            setWorkoutEquipment(Array.isArray(m.equipment) ? m.equipment[0] : m.equipment || "")
            setWorkoutGoal(m.goal || "")
            setCaloriesBurned(m.calories_burned)
            setDistance(m.distance)
            setHeartRateAvg(m.heart_rate_avg)
            setHeartRateMax(m.heart_rate_max)
            setExercisesCount(m.exercises_count)
            setSetsCount(m.sets_count)
            setRepsCount(m.reps_count)
            setTotalWeight(m.total_weight)
            setAverageSpeed(m.average_speed)
            setAveragePace(m.average_pace || "")
            setRounds(m.rounds)
            setYogaLevel(m.level || "")
            setYogaFocus(m.focus || "")

            Object.assign(baseData, {
              duration: m.duration,
              intensity: m.intensity,
            })
          } else if (log.metadata && type === "finance") {
            const m = log.metadata as FinanceMetadata
            const extra = m as unknown as Record<string, string>

            setFinanceType(m.finance_type)
            setFinanceCategory(extra.category || "")
            setFinanceSubcategory(extra.subcategory || "")
            setFinanceItem(extra.item || "")
            setFinanceSupplier(extra.supplier || "")
            setSelectedAccountId(m.account_id || "")
            setTargetAccountId(extra.target_account_id || "")
            Object.assign(baseData, {
              finance_type: m.finance_type,
              account_id: m.account_id,
            })
          }

          reset(baseData as FormData)
        }
      } catch (error) {
        console.error("Failed to load log:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, type, reset])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      // Формируем title
      let title = data.title || ""
      if (type === "finance") {
        // Если title не заполнен, формируем автоматически
        if (!title) {
          const translatedCategory = financeCategory
            ? getStaticEntityTranslation("categories", financeCategory, locale, "finance")
            : ""
          const translatedSubcategory = financeSubcategory
            ? getStaticEntityTranslation("financeSubcategories", financeSubcategory, locale)
            : ""
          const translatedItem = financeItem
            ? getStaticEntityTranslation("financeSubcategories", financeItem, locale)
            : ""

          const parts = [translatedCategory, translatedSubcategory, translatedItem].filter(Boolean)
          if (parts.length > 0) {
            title = parts.join(" → ")
          } else {
            title = t("finance.type")
          }
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
        date: `${data.date}T${data.time}:00`, // ISO 8601 format
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
        const foodData = data as FormData & {
          calories?: number
          protein?: number
          fat?: number
          carbs?: number
        }
        metadata = {
          calories: foodData.calories,
          protein: foodData.protein,
          fat: foodData.fat,
          carbs: foodData.carbs,
        }
      } else if (type === "workout") {
        const workoutData = data as FormData & {
          duration?: number
          intensity?: "low" | "medium" | "high"
        }
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
        const financeData = data as FormData & { finance_type?: FinanceType; account_id?: string }
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

      await updateEntity(db.logs, id, {
        ...baseData,
        metadata,
      } as Partial<Log>)

      router.replace(`/logs/${type}/${id}`)
    } catch (error) {
      console.error("Failed to update log:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!log) return
    try {
      await db.logs.delete(log.id)
      router.push(`/logs/${type}`)
    } catch (error) {
      console.error("Failed to delete log:", error)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title={t("edit.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("edit.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t("edit.title", { type: typeLabels[type] })}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("edit.basic")}</CardTitle>
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
              {/* Tabs для категорий питания и тренировок */}
              {(type === "food" || type === "workout") && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("edit.type")}</Label>
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
                  workoutIntensity={workoutIntensity}
                  setWorkoutIntensity={setWorkoutIntensity}
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
              <CardTitle>{t("edit.additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">{t("fields.notes")}</Label>
                <Textarea
                  id="notes"
                  placeholder={t("edit.notesPlaceholder")}
                  {...register("notes")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("edit.tagsPlaceholder")} {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <PageActions
            id={id}
            type={type}
            title={log?.title}
            onSave={handleSubmit(onSubmit)}
            onDelete={handleDelete}
            onCancel={() => router.back()}
            isInForm={true}
            pathPrefix="logs"
            showDeleteDialog={true}
          />
        </form>
      </div>
    </AppLayout>
  )
}
