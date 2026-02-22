"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Calendar, Tag } from "lucide-react"
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
import { db, getEntityById, deleteEntity } from "@/lib/db"
import type { Log, LogType, Category } from "@/types"

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
      const m = log.metadata as { duration?: number; intensity?: string }
      const intensityLabels: Record<string, string> = {
        low: "Низкая",
        medium: "Средняя",
        high: "Высокая",
      }
      return [
        { label: "Длительность", value: m.duration ? `${m.duration} мин` : "-" },
        { label: "Интенсивность", value: m.intensity ? intensityLabels[m.intensity] : "-" },
      ]
    }
    if (type === "finance") {
      const m = log.metadata as { finance_type?: string }
      return [
        { label: "Тип", value: m.finance_type === "income" ? "Доход" : "Расход" },
      ]
    }
    return []
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
        <div className="flex gap-4">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить
          </Button>
          <Link href={`/logs/${type}/${id}/edit`} className="flex-1">
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
                Это действие нельзя отменить. Запись "{log.title}" будет удалена навсегда.
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