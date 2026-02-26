"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Calendar, Tag, Flame, Timer, Heart, Weight, Repeat, Dumbbell, MapPin, Gauge, Copy } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { db, getEntityById, deleteEntity, createEntity } from "@/lib/db"
import type { Log, LogType, Category, WorkoutMetadata, StrengthSubcategory, CardioSubcategory, YogaSubcategory } from "@/types"

const typeLabels: Record<LogType, string> = {
  food: "Питание",
  workout: "Тренировка",
  finance: "Финансы",
}

const typeColors: Record<LogType, string> = {
  food: "bg-orange-500/10 text-orange-500",
  workout: "bg-blue-500/10 text-blue-500",
  finance: "bg-green-500/10 text-green-500",
}

// Цвета для категорий тренировок
const workoutCategoryColors: Record<string, string> = {
  "Силовая": "bg-red-500/10 text-red-500",
  "Кардио": "bg-blue-500/10 text-blue-500",
  "Йога": "bg-emerald-500/10 text-emerald-500",
}

// Метки интенсивности
const intensityLabels: Record<string, string> = {
  low: "Низкая",
  medium: "Средняя",
  high: "Высокая",
}

// Метки для силовых подкатегорий
const strengthSubcategoryLabels: Record<StrengthSubcategory, string> = {
  chest: "Грудь",
  back: "Спина",
  legs: "Ноги",
  shoulders: "Плечи",
  arms: "Руки",
  core: "Пресс (Кор)",
  free_weights: "Свободные веса",
  machines: "Тренажеры",
  bodyweight: "С собственным весом",
  functional: "Функциональный тренинг",
}

// Метки для кардио подкатегорий
const cardioSubcategoryLabels: Record<CardioSubcategory, string> = {
  running: "Бег",
  walking: "Ходьба",
  cycling: "Велосипед",
  rowing: "Гребля",
  jumping: "Прыжки",
  liss: "LISS (низкоинтенсивное)",
  hiit: "HIIT (интервальное)",
  tabata: "Табата",
}

// Метки для йога подкатегорий
const yogaSubcategoryLabels: Record<YogaSubcategory, string> = {
  hatha: "Хатха-йога",
  vinyasa: "Виньяса-йога",
  ashtanga: "Аштанга-йога",
  kundalini: "Кундалини-йога",
  iyengar: "Айенгар-йога",
  stretching: "Стретчинг / Гибкость",
  power: "Силовая йога",
  relax: "Релакс / Восстановление",
  breathing: "Дыхание и медитация",
  beginner: "Для начинающих",
  intermediate: "Для продолжающих",
  advanced: "Для опытных",
}

// Метки для целей тренировок
const goalLabels: Record<string, string> = {
  mass: "Набор массы",
  relief: "Рельеф",
  strength: "Сила",
  endurance: "Выносливость",
  flexibility: "Гибкость",
  relaxation: "Расслабление",
  balance: "Баланс",
  fat_loss: "Сжигание жира",
  recovery: "Восстановление",
}

// Метки для уровней йоги
const levelLabels: Record<string, string> = {
  beginner: "Начинающий",
  intermediate: "Продолжающий",
  advanced: "Опытный",
}

// Метки для фокуса йоги
const focusLabels: Record<string, string> = {
  flexibility: "Гибкость",
  strength: "Сила",
  relaxation: "Расслабление",
  meditation: "Медитация",
  breathing: "Дыхание",
}

export default function LogDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  const id = params.id as string

  const [log, setLog] = useState<Log | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const logData = await getEntityById(db.logs, id)
        setLog(logData || null)

        if (logData?.category_id) {
          const cat = await getEntityById(db.categories, logData.category_id)
          setCategory(cat || null)
        }
      } catch (error) {
        console.error("Failed to load log:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!log) return
    try {
      await deleteEntity(db.logs, log.id)
      router.push("/logs")
    } catch (error) {
      console.error("Failed to delete log:", error)
    }
  }

  // Копирование записи на сегодня
  const handleCopy = async () => {
    if (!log) return
    try {
      const today = new Date().toISOString().split("T")[0]
      const currentTime = new Date().toTimeString().slice(0, 5)
      
      await createEntity(db.logs, {
        type: log.type,
        title: log.title,
        date: `${today}T${currentTime}`,
        value: log.value,
        quantity: log.quantity,
        unit: log.unit,
        category_id: log.category_id,
        metadata: log.metadata,
        notes: log.notes,
        tags: log.tags,
      })
      
      router.push("/logs")
    } catch (error) {
      console.error("Failed to copy log:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
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

  if (!log) {
    return (
      <AppLayout title="Не найдено">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Запись не найдена
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Получить название подкатегории по значению и типу категории
  const getSubcategoryLabel = (subcategory: string, categoryName: string): string => {
    if (categoryName === "Силовая") {
      return strengthSubcategoryLabels[subcategory as StrengthSubcategory] || subcategory
    }
    if (categoryName === "Кардио") {
      return cardioSubcategoryLabels[subcategory as CardioSubcategory] || subcategory
    }
    if (categoryName === "Йога") {
      return yogaSubcategoryLabels[subcategory as YogaSubcategory] || subcategory
    }
    return subcategory
  }

  // Определить тип тренировки по названию категории
  const getWorkoutType = (categoryName: string): string => {
    if (categoryName === "Силовая") return "strength"
    if (categoryName === "Кардио") return "cardio"
    if (categoryName === "Йога") return "yoga"
    return "unknown"
  }

  // Get metadata based on type
  const getMetadataItems = () => {
    if (!log.metadata) return []

    if (type === "food") {
      const m = log.metadata as { calories?: number; protein?: number; fat?: number; carbs?: number }
      return [
        { label: "Калории", value: m.calories ? `${m.calories} ккал` : "-" },
        { label: "Белки", value: m.protein ? `${m.protein} г` : "-" },
        { label: "Жиры", value: m.fat ? `${m.fat} г` : "-" },
        { label: "Углеводы", value: m.carbs ? `${m.carbs} г` : "-" },
      ]
    }
    if (type === "workout") {
      const m = log.metadata as WorkoutMetadata
      const categoryName = category?.name || ""
      const workoutType = getWorkoutType(categoryName)
      
      // Базовые метрики
      const items: { label: string; value: string }[] = []
      
      if (m.duration) {
        items.push({ label: "Длительность", value: `${m.duration} мин` })
      }
      if (m.intensity) {
        items.push({ label: "Интенсивность", value: intensityLabels[m.intensity] || m.intensity })
      }
      if (m.subcategory) {
        items.push({ label: "Подкатегория", value: getSubcategoryLabel(m.subcategory, categoryName) })
      }
      if (m.equipment) {
        const equipmentStr = Array.isArray(m.equipment) ? m.equipment.join(", ") : m.equipment
        items.push({ label: "Инвентарь", value: equipmentStr })
      }
      if (m.goal) {
        items.push({ label: "Цель", value: goalLabels[m.goal] || m.goal })
      }
      if (m.calories_burned) {
        items.push({ label: "Сожжено калорий", value: `${m.calories_burned} ккал` })
      }
      
      // Специфические метрики для силовой
      if (workoutType === "strength") {
        if (m.exercises_count) {
          items.push({ label: "Упражнений", value: `${m.exercises_count}` })
        }
        if (m.sets_count) {
          items.push({ label: "Подходов", value: `${m.sets_count}` })
        }
        if (m.reps_count) {
          items.push({ label: "Повторов", value: `${m.reps_count}` })
        }
        if (m.total_weight) {
          items.push({ label: "Общий вес", value: `${m.total_weight} кг` })
        }
      }
      
      // Специфические метрики для кардио
      if (workoutType === "cardio") {
        if (m.distance) {
          items.push({ label: "Дистанция", value: `${m.distance} км` })
        }
        if (m.average_speed) {
          items.push({ label: "Средняя скорость", value: `${m.average_speed} км/ч` })
        }
        if (m.average_pace) {
          items.push({ label: "Средний темп", value: `${m.average_pace} мин/км` })
        }
        if (m.rounds) {
          items.push({ label: "Раундов", value: `${m.rounds}` })
        }
      }
      
      // Специфические метрики для йоги
      if (workoutType === "yoga") {
        if (m.level) {
          items.push({ label: "Уровень", value: levelLabels[m.level] || m.level })
        }
        if (m.focus) {
          items.push({ label: "Фокус", value: focusLabels[m.focus] || m.focus })
        }
      }
      
      // Пульс (общий для всех типов)
      if (m.heart_rate_avg) {
        items.push({ label: "Средний пульс", value: `${m.heart_rate_avg} уд/мин` })
      }
      if (m.heart_rate_max) {
        items.push({ label: "Макс. пульс", value: `${m.heart_rate_max} уд/мин` })
      }
      
      return items
    }
    if (type === "finance") {
      const m = log.metadata as { finance_type?: string }
      return [
        { label: "Тип", value: m.finance_type === "income" ? "Доход" : "Расход" },
      ]
    }
    return []
  }

  // Компонент для отображения метрик с иконками
  const WorkoutMetricsCards = () => {
    if (type !== "workout" || !log.metadata) return null
    
    const m = log.metadata as WorkoutMetadata
    const categoryName = category?.name || ""
    const workoutType = getWorkoutType(categoryName)
    
    return (
      <>
        {/* Карточка основных параметров */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Основные параметры
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {m.duration && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Длительность</p>
                    <p className="font-medium">{m.duration} мин</p>
                  </div>
                </div>
              )}
              {m.intensity && (
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Интенсивность</p>
                    <p className="font-medium">{intensityLabels[m.intensity]}</p>
                  </div>
                </div>
              )}
              {m.calories_burned && (
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Калории</p>
                    <p className="font-medium">{m.calories_burned} ккал</p>
                  </div>
                </div>
              )}
              {m.goal && (
                <div>
                  <p className="text-xs text-muted-foreground">Цель</p>
                  <Badge variant="secondary">{goalLabels[m.goal] || m.goal}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Карточка для силовых метрик */}
        {workoutType === "strength" && (m.exercises_count || m.sets_count || m.reps_count || m.total_weight) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Силовые показатели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {m.exercises_count && (
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Упражнений</p>
                      <p className="font-medium text-lg">{m.exercises_count}</p>
                    </div>
                  </div>
                )}
                {m.sets_count && (
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Подходов</p>
                      <p className="font-medium text-lg">{m.sets_count}</p>
                    </div>
                  </div>
                )}
                {m.reps_count && (
                  <div className="flex items-center gap-2">
                    <Repeat className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Повторов</p>
                      <p className="font-medium text-lg">{m.reps_count}</p>
                    </div>
                  </div>
                )}
                {m.total_weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Общий вес</p>
                      <p className="font-medium text-lg">{m.total_weight} кг</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Карточка для кардио метрик */}
        {workoutType === "cardio" && (m.distance || m.average_speed || m.average_pace || m.rounds) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Кардио показатели
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {m.distance && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Дистанция</p>
                      <p className="font-medium text-lg">{m.distance} км</p>
                    </div>
                  </div>
                )}
                {m.average_speed && (
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Скорость</p>
                      <p className="font-medium text-lg">{m.average_speed} км/ч</p>
                    </div>
                  </div>
                )}
                {m.average_pace && (
                  <div>
                    <p className="text-xs text-muted-foreground">Темп</p>
                    <p className="font-medium text-lg">{m.average_pace} мин/км</p>
                  </div>
                )}
                {m.rounds && (
                  <div>
                    <p className="text-xs text-muted-foreground">Раундов</p>
                    <p className="font-medium text-lg">{m.rounds}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Карточка пульса */}
        {(m.heart_rate_avg || m.heart_rate_max) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Пульс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {m.heart_rate_avg && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Средний</p>
                      <p className="font-medium text-lg">{m.heart_rate_avg} уд/мин</p>
                    </div>
                  </div>
                )}
                {m.heart_rate_max && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Максимальный</p>
                      <p className="font-medium text-lg">{m.heart_rate_max} уд/мин</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Карточка инвентаря */}
        {m.equipment && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Инвентарь</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(m.equipment) ? m.equipment : [m.equipment]).map((eq, i) => (
                  <Badge key={i} variant="outline">{eq}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </>
    )
  }

  return (
    <AppLayout title={typeLabels[type]}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{log.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(log.date)}</span>
                </div>
              </div>
              <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              {log.quantity !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Количество</p>
                  <p className="font-medium">
                    {log.quantity} {log.unit || ""}
                  </p>
                </div>
              )}
              {log.value !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {type === "finance" ? "Сумма" : "Значение"}
                  </p>
                  <p className="font-medium">{log.value}</p>
                </div>
              )}
              {category && (
                <div>
                  <p className="text-sm text-muted-foreground">Категория</p>
                  <p className="font-medium">{category.name}</p>
                </div>
              )}
            </div>

            {/* Type-specific metadata */}
            {getMetadataItems().length > 0 && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {getMetadataItems().map((item, i) => (
                  <div key={i}>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workout Metrics Cards */}
        <WorkoutMetricsCards />

        {/* Tabs */}
        <Tabs defaultValue="notes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes">Заметки</TabsTrigger>
            <TabsTrigger value="info">Информация</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {log.notes ? (
                  <p className="whitespace-pre-wrap">{log.notes}</p>
                ) : (
                  <p className="text-muted-foreground">Нет заметок</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Создано</p>
                  <p>{formatDate(log.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обновлено</p>
                  <p>{formatDate(log.updated_at)}</p>
                </div>
                {log.tags && log.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Теги</p>
                    <div className="flex flex-wrap gap-2">
                      {log.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Копировать
          </Button>
          <Link href={`/logs/${type}/${id}/edit`}>
            <Button className="w-full">
              <Pencil className="h-4 w-4 mr-2" />
              Изменить
            </Button>
          </Link>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить запись?</DialogTitle>
              <DialogDescription>
                Это действие нельзя отменить. Запись &laquo;{log.title}&raquo; будет удалена навсегда.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}