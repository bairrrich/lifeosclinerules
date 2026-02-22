"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Tag, Calendar, Package, AlertTriangle } from "lucide-react"
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
import type { Item, ItemType } from "@/types"

const typeLabels: Record<ItemType, string> = {
  vitamin: "Витамины",
  medicine: "Лекарства",
  herb: "Травы",
  cosmetic: "Косметика",
  product: "Продукты",
}

const typeColors: Record<ItemType, string> = {
  vitamin: "bg-purple-500/10 text-purple-500",
  medicine: "bg-red-500/10 text-red-500",
  herb: "bg-green-500/10 text-green-500",
  cosmetic: "bg-pink-500/10 text-pink-500",
  product: "bg-yellow-500/10 text-yellow-500",
}

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ItemType
  const id = params.id as string

  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const itemData = await getEntityById(db.items, id)
        setItem(itemData || null)
      } catch (error) {
        console.error("Failed to load item:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!item) return
    try {
      await deleteEntity(db.items, item.id)
      router.push("/items")
    } catch (error) {
      console.error("Failed to delete item:", error)
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

  if (!item) {
    return (
      <AppLayout title="Не найдено">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Элемент не найден
            </CardContent>
          </Card>
        </div>
      </AppLayout>
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
                <CardTitle className="text-xl">{item.name}</CardTitle>
                {item.category && (
                  <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                )}
              </div>
              <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {item.description && (
              <p className="text-muted-foreground">{item.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="usage">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage">Применение</TabsTrigger>
            <TabsTrigger value="health">Здоровье</TabsTrigger>
            <TabsTrigger value="info">Инфо</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Способ применения</CardTitle>
              </CardHeader>
              <CardContent>
                {item.usage ? (
                  <p className="whitespace-pre-wrap">{item.usage}</p>
                ) : (
                  <p className="text-muted-foreground">Не указано</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Дозировка</CardTitle>
              </CardHeader>
              <CardContent>
                {item.dosage ? (
                  <p>{item.dosage}</p>
                ) : (
                  <p className="text-muted-foreground">Не указано</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Форма выпуска</CardTitle>
              </CardHeader>
              <CardContent>
                {item.form ? (
                  <p>{item.form}</p>
                ) : (
                  <p className="text-muted-foreground">Не указано</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Польза</CardTitle>
              </CardHeader>
              <CardContent>
                {item.benefits ? (
                  <p className="whitespace-pre-wrap">{item.benefits}</p>
                ) : (
                  <p className="text-muted-foreground">Не указано</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Противопоказания
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.contraindications ? (
                  <p className="whitespace-pre-wrap">{item.contraindications}</p>
                ) : (
                  <p className="text-muted-foreground">Не указано</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Производитель</p>
                    <p>{item.manufacturer || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Срок годности</p>
                    <p>{item.expiration ? formatDate(item.expiration) : "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Состав</p>
                  <p className="whitespace-pre-wrap">{item.composition || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Условия хранения</p>
                  <p>{item.storage || "-"}</p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Заметки</p>
                  <p className="whitespace-pre-wrap">{item.notes || "-"}</p>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Теги</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
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
          <Link href={`/items/${type}/${id}/edit`} className="flex-1">
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
              <DialogTitle>Удалить элемент?</DialogTitle>
              <DialogDescription>
                Это действие нельзя отменить. "{item.name}" будет удалено навсегда.
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