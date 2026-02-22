"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Tag, Star, Clock, User } from "lucide-react"
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
import type { Content, ContentType, BookMetadata, RecipeMetadata } from "@/types"

const typeLabels: Record<ContentType, string> = {
  book: "Книга",
  recipe: "Рецепт",
}

const typeColors: Record<ContentType, string> = {
  book: "bg-blue-500/10 text-blue-500",
  recipe: "bg-amber-500/10 text-amber-500",
}

const bookStatusLabels: Record<string, string> = {
  planned: "Запланировано",
  reading: "Читаю",
  done: "Прочитано",
}

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType
  const id = params.id as string

  const [content, setContent] = useState<Content | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const contentData = await getEntityById(db.content, id)
        setContent(contentData || null)
      } catch (error) {
        console.error("Failed to load content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!content) return
    try {
      await deleteEntity(db.content, content.id)
      router.push("/content")
    } catch (error) {
      console.error("Failed to delete content:", error)
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
          <Card><CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent></Card>
        </div>
      </AppLayout>
    )
  }

  if (!content) {
    return (
      <AppLayout title="Не найдено">
        <div className="container mx-auto px-4 py-6">
          <Card><CardContent className="p-4 text-center text-muted-foreground">Контент не найден</CardContent></Card>
        </div>
      </AppLayout>
    )
  }

  const metadata = content.metadata as BookMetadata | RecipeMetadata | undefined

  return (
    <AppLayout title={typeLabels[type]}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />Назад
        </Button>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl">{content.title}</CardTitle>
                {content.description && (
                  <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {content.rating !== undefined && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium">{content.rating}</span>
                  </div>
)}
                <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Book specific */}
            {type === "book" && metadata && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {(metadata as BookMetadata).author && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{(metadata as BookMetadata).author}</span>
                  </div>
                )}
                {(metadata as BookMetadata).status && (
                  <Badge variant="secondary">
                    {bookStatusLabels[(metadata as BookMetadata).status]}
                  </Badge>
                )}
                {(metadata as BookMetadata).year && (
                  <div className="text-sm text-muted-foreground">
                    Год: {(metadata as BookMetadata).year}
                  </div>
                )}
                {(metadata as BookMetadata).pages && (
                  <div className="text-sm text-muted-foreground">
                    {(metadata as BookMetadata).pages} стр.
                  </div>
                )}
              </div>
            )}

            {/* Recipe specific */}
            {type === "recipe" && metadata && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {(metadata as RecipeMetadata).cook_time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{(metadata as RecipeMetadata).cook_time} мин</span>
                  </div>
                )}
                {(metadata as RecipeMetadata).calories && (
                  <div className="text-sm text-muted-foreground">
                    {(metadata as RecipeMetadata).calories} ккал
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">{type === "book" ? "Заметки" : "Инструкции"}</TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <Card>
              <CardContent className="p-4">
                {content.body ? (
                  <p className="whitespace-pre-wrap">{content.body}</p>
                ) : (
                  <p className="text-muted-foreground">Нет содержимого</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Recipe ingredients */}
            {type === "recipe" && metadata && (metadata as RecipeMetadata).ingredients && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ингредиенты</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {(metadata as RecipeMetadata).ingredients?.map((ing, i) => (
                      <li key={i} className="text-sm">
                        {ing.name} — {ing.amount} {ing.unit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recipe nutrition */}
            {type === "recipe" && metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Пищевая ценность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{(metadata as RecipeMetadata).calories || "-"}</div>
                      <div className="text-xs text-muted-foreground">ккал</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{(metadata as RecipeMetadata).protein || "-"}</div>
                      <div className="text-xs text-muted-foreground">белки</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{(metadata as RecipeMetadata).fat || "-"}</div>
                      <div className="text-xs text-muted-foreground">жиры</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{(metadata as RecipeMetadata).carbs || "-"}</div>
                      <div className="text-xs text-muted-foreground">углеводы</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Создано</p>
                  <p>{formatDate(content.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Обновлено</p>
                  <p>{formatDate(content.updated_at)}</p>
                </div>
                {content.tags && content.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Теги</p>
                    <div className="flex flex-wrap gap-2">
                      {content.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />{tag}
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
          <Button variant="destructive" className="flex-1" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />Удалить
          </Button>
          <Link href={`/content/${type}/${id}/edit`} className="flex-1">
            <Button className="w-full">
              <Pencil className="h-4 w-4 mr-2" />Изменить
            </Button>
          </Link>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить {type === "book" ? "книгу" : "рецепт"}?</DialogTitle>
              <DialogDescription>
                Это действие нельзя отменить. "{content.title}" будет удалено навсегда.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Отмена</Button>
              <Button variant="destructive" onClick={handleDelete}>Удалить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}