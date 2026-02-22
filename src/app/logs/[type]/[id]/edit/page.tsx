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
import { NativeSelect } from "@/components/ui/native-select"
import { db, getEntityById, updateEntity, getCategoriesByType } from "@/lib/db"
import type { LogType, Category, FoodMetadata, WorkoutMetadata, FinanceMetadata, FinanceType } from "@/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Form schemas
const baseLogSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  title: z.string().min(1, "Введите название"),
  category_id: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const foodSchema = baseLogSchema.extend({
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

type FormData = z.infer<typeof foodSchema> | z.infer<typeof workoutSchema> | z.infer<typeof financeSchema>

const typeLabels: Record<LogType, string> = {
  food: "Питание",
  workout: "Тренировка",
  finance: "Финансы",
}

// Цвета для категорий (только активные имеют фон)
const categoryColors: Record<string, string> = {
  // Питание
  "Завтрак": "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  "Обед": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "Ужин": "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
  "Перекус": "data-[state=active]:bg-cyan-500 data-[state=active]:text-white",
  // Тренировки
  "Силовая": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "Кардио": "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  "Йога": "data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
}

// Цвета для типов финансов
const financeTypeColors: Record<string, string> = {
  "income": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "expense": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "transfer": "data-[state=active]:bg-yellow-500 data-[state=active]:text-white",
}

// Порядок категорий для питания
const foodCategoryOrder = ["Завтрак", "Обед", "Ужин", "Перекус"]
// Порядок категорий для тренировок
const workoutCategoryOrder = ["Силовая", "Кардио", "Йога"]

export default function EditLogPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  const id = params.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      type === "food" ? foodSchema :
      type === "workout" ? workoutSchema :
      financeSchema
    ),
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [log, cats] = await Promise.all([
          getEntityById(db.logs, id),
          getCategoriesByType(type),
        ])

        // Сортируем категории в нужном порядке
        let sortedCats = cats
        if (type === "food") {
          sortedCats = foodCategoryOrder
            .map(name => cats.find(c => c.name === name))
            .filter(Boolean) as Category[]
        } else if (type === "workout") {
          sortedCats = workoutCategoryOrder
            .map(name => cats.find(c => c.name === name))
            .filter(Boolean) as Category[]
        }

        setCategories(sortedCats)

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
          if (type === "finance" && log.metadata) {
            const m = log.metadata as FinanceMetadata
            setFinanceType(m.finance_type)
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
            Object.assign(baseData, {
              duration: m.duration,
              intensity: m.intensity,
            })
          } else if (log.metadata && type === "finance") {
            const m = log.metadata as FinanceMetadata
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
      // Объединяем дату и время в ISO-строку
      const dateTime = `${data.date}T${data.time}:00`
      
      const baseData = {
        date: dateTime,
        title: data.title,
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
        }
      } else if (type === "finance") {
        const financeData = data as z.infer<typeof financeSchema>
        metadata = {
          finance_type: financeData.finance_type as FinanceType,
          account_id: financeData.account_id,
        }
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
              <CardTitle>Основное</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Дата и время на первой строке */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Дата *</Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date")}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Время *</Label>
                  <Input
                    id="time"
                    type="time"
                    {...register("time")}
                  />
                  {errors.time && (
                    <p className="text-sm text-destructive">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Tabs для категорий питания и тренировок */}
              {(type === "food" || type === "workout") && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Tabs 
                    value={selectedCategoryId} 
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setValue("category_id", value)
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

              {/* Select для категорий финансов (подкатегории) */}
              {type === "finance" && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Категория</Label>
                  <NativeSelect
                    onChange={(e) => setValue("category_id", e.target.value)}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  placeholder="Введите название"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Единица</Label>
                  <Input
                    id="unit"
                    placeholder="г, шт, мл"
                    {...register("unit")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Значение</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  placeholder={type === "finance" ? "Сумма" : "Значение"}
                  {...register("value", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Type-specific fields */}
          {type === "food" && (
            <Card>
              <CardHeader>
                <CardTitle>Пищевая ценность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Калории</Label>
                    <Input
                      id="calories"
                      type="number"
                      {...register("calories", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Белки (г)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      {...register("protein", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fat">Жиры (г)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      {...register("fat", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Углеводы (г)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      {...register("carbs", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {type === "workout" && (
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
                    <NativeSelect
                      onChange={(e) =>
                        setValue("intensity", e.target.value as "low" | "medium" | "high")
                      }
                    >
                      <option value="">Выберите</option>
                      <option value="low">Низкая</option>
                      <option value="medium">Средняя</option>
                      <option value="high">Высокая</option>
                    </NativeSelect>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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