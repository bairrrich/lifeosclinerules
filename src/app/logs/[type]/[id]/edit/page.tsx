"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, getEntityById, updateEntity, getCategoriesByType, initializeDatabase } from "@/lib/db"
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
import type { LogType, Category, FoodMetadata, WorkoutMetadata, FinanceMetadata, FinanceType, Account, Log, StrengthSubcategory, CardioSubcategory, YogaSubcategory, WorkoutGoal } from "@/types"

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
  title: z.string().min(1, "Введите название"),
  duration: z.number().optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
})

const financeSchema = baseLogSchema.extend({
  finance_type: z.enum(["income", "expense", "transfer"]),
  account_id: z.string().optional(),
})

type FormData = z.infer<typeof foodSchema> | z.infer<typeof workoutSchema> | z.infer<typeof financeSchema>

export default function EditLogPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  const id = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [targetAccountId, setTargetAccountId] = useState<string>("")
  
  // Состояния для зависимых списков финансов
  const [financeCategory, setFinanceCategory] = useState("")
  const [financeSubcategory, setFinanceSubcategory] = useState("")
  const [financeItem, setFinanceItem] = useState("")
  const [financeSupplier, setFinanceSupplier] = useState("")
  
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

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      type === "food" ? foodSchema :
      type === "workout" ? workoutSchema :
      financeSchema
    ),
  })

  // Получаем текущую категорию тренировки
  const selectedWorkoutCategory = categories.find(c => c.id === selectedCategoryId)?.name || ""

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
            .map(name => cats.find(c => c.name === name))
            .filter(Boolean) as Category[]
          const remainingCats = cats.filter(c => !foodCategoryOrder.includes(c.name))
          sortedCats = [...orderCats, ...remainingCats]
        } else if (type === "workout") {
          const orderCats = workoutCategoryOrder
            .map(name => cats.find(c => c.name === name))
            .filter(Boolean) as Category[]
          const remainingCats = cats.filter(c => !workoutCategoryOrder.includes(c.name))
          sortedCats = [...orderCats, ...remainingCats]
        }

        setCategories(sortedCats)
        setAccounts(accs)

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
          subcategory: workoutSubcategory as StrengthSubcategory | CardioSubcategory | YogaSubcategory | undefined,
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
          level: yogaLevel as 'beginner' | 'intermediate' | 'advanced' | undefined,
          focus: yogaFocus as 'flexibility' | 'strength' | 'relaxation' | 'meditation' | 'breathing' | undefined,
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
        } as FinanceMetadata & { category?: string; subcategory?: string; item?: string; supplier?: string; target_account_id?: string }
      }

      await updateEntity(db.logs, id, {
        ...baseData,
        metadata,
      })

      router.push(`/logs/${type}/${id}`)
    } catch (error) {
      console.error("Failed to update log:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`Редактировать: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Основное</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    className="w-auto"
                    {...register("date")}
                  />
                  <Input
                    type="time"
                    className="w-auto"
                    {...register("time")}
                  />
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
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
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
                      setFinanceCategory("")
                      setFinanceSubcategory("")
                      setFinanceItem("")
                      setFinanceSupplier("")
                      setTargetAccountId("")
                    }}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="income" className={financeTypeColors["income"]}>Доход</TabsTrigger>
                      <TabsTrigger value="expense" className={financeTypeColors["expense"]}>Расход</TabsTrigger>
                      <TabsTrigger value="transfer" className={financeTypeColors["transfer"]}>Перевод</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Food Form */}
              {type === "food" && (
                <FoodForm
                  register={register as Parameters<typeof FoodForm>[0]['register']}
                  watch={watch as Parameters<typeof FoodForm>[0]['watch']}
                  setValue={setValue as Parameters<typeof FoodForm>[0]['setValue']}
                  errors={errors as Record<string, { message?: string }>}
                />
              )}

              {/* Finance Form */}
              {type === "finance" && (
                <FinanceForm
                  register={register as Parameters<typeof FinanceForm>[0]['register']}
                  watch={watch as Parameters<typeof FinanceForm>[0]['watch']}
                  setValue={setValue as Parameters<typeof FinanceForm>[0]['setValue']}
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
                  register={register as Parameters<typeof WorkoutForm>[0]['register']}
                  watch={watch as Parameters<typeof WorkoutForm>[0]['watch']}
                  setValue={setValue as Parameters<typeof WorkoutForm>[0]['setValue']}
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
                <Textarea
                  id="notes"
                  placeholder="Ваши заметки..."
                  {...register("notes")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Теги</Label>
                <Input
                  id="tags"
                  placeholder="теги через запятую"
                  {...register("tags")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}