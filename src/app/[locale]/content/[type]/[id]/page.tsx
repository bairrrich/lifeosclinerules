"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Star,
  Clock,
  User,
  Flame,
  Users,
  ChefHat,
  Coffee,
  Martini,
  Timer,
} from "@/lib/icons"
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
import { useLocale } from "next-intl"
import type {
  Content,
  ContentType,
  BookMetadata,
  RecipeContentExtended,
  RecipeIngredientItem,
  RecipeStep,
} from "@/types"

const typeLabels: Record<ContentType, string> = {
  book: "Книга",
  recipe: "Рецепт",
}

const typeColors: Record<ContentType, string> = {
  book: "bg-blue-500/10 text-blue-500",
  recipe: "bg-amber-500/10 text-amber-500",
}

const recipeTypeLabels: Record<string, string> = {
  food: "Еда",
  drink: "Напиток",
  cocktail: "Коктейль",
}

const recipeTypeColors: Record<string, string> = {
  food: "bg-orange-500/10 text-orange-500",
  drink: "bg-blue-500/10 text-blue-500",
  cocktail: "bg-purple-500/10 text-purple-500",
}

const bookStatusLabels: Record<string, string> = {
  planned: "Запланировано",
  reading: "Читаю",
  done: "Прочитано",
}

const difficultyLabels: Record<string, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
  pro: "Профи",
}

export default function ContentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType
  const id = params.id as string
  const locale = useLocale()

  const [content, setContent] = useState<Content | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredientItem[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const contentData = await getEntityById(db.content, id)
        setContent(contentData || null)

        // Загружаем ингредиенты и шаги для рецепта
        if (contentData && contentData.type === "recipe") {
          const recipeIngredients = await db.recipeIngredientItems
            .where("recipe_id")
            .equals(id)
            .sortBy("order")
          setIngredients(recipeIngredients)

          const recipeSteps = await db.recipeSteps.where("recipe_id").equals(id).sortBy("order")
          setSteps(recipeSteps)
        }
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
      // Удаляем связанные данные для рецепта
      if (content.type === "recipe") {
        await db.recipeIngredientItems.where("recipe_id").equals(id).delete()
        await db.recipeSteps.where("recipe_id").equals(id).delete()
      }

      await deleteEntity(db.content, content.id)
      router.push("/content")
    } catch (error) {
      console.error("Failed to delete content:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
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
            <CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!content) {
    return (
      <AppLayout title="Не найдено">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Контент не найден
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  // Для книг
  const bookMetadata = type === "book" ? (content as { metadata?: BookMetadata }).metadata : null

  // Для рецептов
  const recipe = type === "recipe" ? (content as RecipeContentExtended) : null
  const recipeType = recipe?.recipe_type || "food"

  return (
    <AppLayout title={typeLabels[type]}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад
        </Button>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {recipe && (
                    <Badge className={recipeTypeColors[recipeType]}>
                      {recipeType === "food" && <ChefHat className="h-3 w-3 mr-1" />}
                      {recipeType === "drink" && <Coffee className="h-3 w-3 mr-1" />}
                      {recipeType === "cocktail" && <Martini className="h-3 w-3 mr-1" />}
                      {recipeTypeLabels[recipeType]}
                    </Badge>
                  )}
                  {!recipe && <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>}
                </div>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Book specific */}
            {type === "book" && bookMetadata && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                {bookMetadata.author && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{bookMetadata.author}</span>
                  </div>
                )}
                {bookMetadata.status && (
                  <Badge variant="secondary">{bookStatusLabels[bookMetadata.status]}</Badge>
                )}
                {bookMetadata.year && (
                  <div className="text-sm text-muted-foreground">Год: {bookMetadata.year}</div>
                )}
                {bookMetadata.pages && (
                  <div className="text-sm text-muted-foreground">{bookMetadata.pages} стр.</div>
                )}
              </div>
            )}

            {/* Recipe specific - время и порции */}
            {recipe && (
              <div className="grid grid-cols-3 gap-4 mt-2">
                {recipe.total_time_min && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.total_time_min} мин</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {recipe.servings} {recipe.serving_unit || "порций"}
                    </span>
                  </div>
                )}
                {recipe.difficulty && (
                  <Badge variant="secondary">{difficultyLabels[recipe.difficulty]}</Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue={type === "recipe" ? "instructions" : "content"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={type === "recipe" ? "instructions" : "content"}>
              {type === "book" ? "Заметки" : "Приготовление"}
            </TabsTrigger>
            <TabsTrigger value="details">Детали</TabsTrigger>
          </TabsList>

          <TabsContent value={type === "recipe" ? "instructions" : "content"} className="mt-4">
            {/* Шаги приготовления */}
            {type === "recipe" && steps.length > 0 ? (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                          {step.order}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{step.text}</p>
                          {step.timer_min && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Timer className="h-3 w-3" />
                              <span>{step.timer_min} мин</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : type === "recipe" ? (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  Нет инструкций
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  {content.body ? (
                    <p className="whitespace-pre-wrap">{content.body}</p>
                  ) : (
                    <p className="text-muted-foreground">Нет содержимого</p>
                  )}
                </CardContent>
              </Card>
            )}

            {type === "book" && (
              <Card>
                <CardContent className="p-4">
                  {content.body ? (
                    <p className="whitespace-pre-wrap">{content.body}</p>
                  ) : (
                    <p className="text-muted-foreground">Нет содержимого</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Ингредиенты */}
            {type === "recipe" && ingredients.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Ингредиенты</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <li key={ing.id || i} className="flex items-center justify-between text-sm">
                        <span>
                          {ing.ingredient_name}
                          {ing.optional && (
                            <span className="text-muted-foreground ml-1">(опц.)</span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {ing.amount} {ing.unit}
                          {ing.note && <span className="text-xs ml-1">({ing.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* КБЖУ */}
            {recipe && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Пищевая ценность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold flex items-center justify-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {recipe.calories || "-"}
                      </div>
                      <div className="text-xs text-muted-foreground">ккал</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{recipe.protein || "-"}</div>
                      <div className="text-xs text-muted-foreground">белки</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{recipe.fat || "-"}</div>
                      <div className="text-xs text-muted-foreground">жиры</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center mt-2">
                    <div>
                      <div className="text-lg font-semibold">{recipe.carbs || "-"}</div>
                      <div className="text-xs text-muted-foreground">углеводы</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{recipe.sugar || "-"}</div>
                      <div className="text-xs text-muted-foreground">сахар</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Специфичные метаданные рецепта */}
            {recipe && recipe.recipe_type === "food" && recipe.food_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Дополнительно</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.food_metadata.course_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Тип блюда: </span>
                      {recipe.food_metadata.course_type}
                    </div>
                  )}
                  {recipe.food_metadata.cuisine && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Кухня: </span>
                      {recipe.food_metadata.cuisine}
                    </div>
                  )}
                  {recipe.food_metadata.cooking_method && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Метод: </span>
                      {recipe.food_metadata.cooking_method.join(", ")}
                    </div>
                  )}
                  {recipe.food_metadata.dietary && recipe.food_metadata.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.food_metadata.dietary.map((d, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {recipe && recipe.recipe_type === "cocktail" && recipe.cocktail_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Детали коктейля</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.cocktail_metadata.base_spirit && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">База: </span>
                      {recipe.cocktail_metadata.base_spirit}
                    </div>
                  )}
                  {recipe.cocktail_metadata.cocktail_method && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Метод: </span>
                      {recipe.cocktail_metadata.cocktail_method}
                    </div>
                  )}
                  {recipe.cocktail_metadata.glass_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Бокал: </span>
                      {recipe.cocktail_metadata.glass_type}
                    </div>
                  )}
                  {recipe.cocktail_metadata.ice_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Лёд: </span>
                      {recipe.cocktail_metadata.ice_type}
                    </div>
                  )}
                  {recipe.cocktail_metadata.garnish && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Гарнир: </span>
                      {recipe.cocktail_metadata.garnish.join(", ")}
                    </div>
                  )}
                  {recipe.cocktail_metadata.alcohol_percent && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Крепость: </span>
                      {recipe.cocktail_metadata.alcohol_percent}%
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {recipe && recipe.recipe_type === "drink" && recipe.drink_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Детали напитка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.drink_metadata.drink_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Тип: </span>
                      {recipe.drink_metadata.drink_type}
                    </div>
                  )}
                  {recipe.drink_metadata.base && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">База: </span>
                      {recipe.drink_metadata.base}
                    </div>
                  )}
                  {recipe.drink_metadata.caffeine_mg && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Кофеин: </span>
                      {recipe.drink_metadata.caffeine_mg} мг
                    </div>
                  )}
                  {recipe.drink_metadata.volume_ml && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Объём: </span>
                      {recipe.drink_metadata.volume_ml} мл
                    </div>
                  )}
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
          <Link href={`/content/${type}/${id}/edit`} className="flex-1">
            <Button className="w-full">
              <Pencil className="h-4 w-4 mr-2" />
              Изменить
            </Button>
          </Link>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить {type === "book" ? "книгу" : "рецепт"}?</DialogTitle>
              <DialogDescription>
                Это действие нельзя отменить. &laquo;{content.title}&raquo; будет удалено навсегда.
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
