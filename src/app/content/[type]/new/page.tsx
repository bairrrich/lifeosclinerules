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
import { db, createEntity, initializeDatabase } from "@/lib/db"
import type { ContentType, BookStatus } from "@/types"

// Form schema
const baseContentSchema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  body: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.string().optional(),
})

const bookSchema = baseContentSchema.extend({
  author: z.string().optional(),
  year: z.number().optional(),
  pages: z.number().optional(),
  status: z.enum(["planned", "reading", "done"]),
})

const recipeSchema = baseContentSchema.extend({
  ingredients: z.string().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
  cook_time: z.number().optional(),
})

type BookFormData = z.infer<typeof bookSchema>
type RecipeFormData = z.infer<typeof recipeSchema>
type FormData = BookFormData | RecipeFormData

const typeLabels: Record<ContentType, string> = {
  book: "Книга",
  recipe: "Рецепт",
}

export default function NewContentPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType
  
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      type === "book" ? bookSchema : recipeSchema
    ),
    defaultValues: type === "book" 
      ? { status: "planned" } 
      : {},
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const baseData = {
        type,
        title: data.title,
        description: data.description,
        body: data.body,
        rating: data.rating,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      }

      if (type === "book") {
        const bookData = data as BookFormData
        await createEntity(db.content, {
          ...baseData,
          metadata: {
            author: bookData.author,
            year: bookData.year,
            pages: bookData.pages,
            status: bookData.status as BookStatus,
          },
        })
      } else {
        const recipeData = data as RecipeFormData
        await createEntity(db.content, {
          ...baseData,
          metadata: {
            ingredients: recipeData.ingredients
              ? recipeData.ingredients.split("\n").map((line) => {
                  const parts = line.split(" - ")
                  return {
                    name: parts[0] || line,
                    amount: parts[1] ? parseFloat(parts[1]) : 1,
                    unit: parts[2] || "шт",
                  }
                })
              : [],
            calories: recipeData.calories,
            protein: recipeData.protein,
            fat: recipeData.fat,
            carbs: recipeData.carbs,
            cook_time: recipeData.cook_time,
          },
        })
      }

      router.push("/content")
    } catch (error) {
      console.error("Failed to create content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={`Новый: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Основное</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  placeholder={type === "book" ? "Название книги" : "Название рецепта"}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание..."
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Оценка</Label>
                <Input
                  id="rating"
                  type="number"
                  min={1}
                  max={5}
                  placeholder="от 1 до 5"
                  {...register("rating", { valueAsNumber: true })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Type-specific fields */}
          {type === "book" && (
            <Card>
              <CardHeader>
                <CardTitle>О книге</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Автор</Label>
                  <Input
                    id="author"
                    placeholder="Имя автора"
                    {...register("author")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Год издания</Label>
                    <Input
                      id="year"
                      type="number"
                      {...register("year", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pages">Страниц</Label>
                    <Input
                      id="pages"
                      type="number"
                      {...register("pages", { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Статус</Label>
                  <NativeSelect
                    defaultValue="planned"
                    onChange={(e) =>
                      setValue("status", e.target.value as "planned" | "reading" | "done")
                    }
                  >
                    <option value="planned">Запланировано</option>
                    <option value="reading">Читаю</option>
                    <option value="done">Прочитано</option>
                  </NativeSelect>
                </div>
              </CardContent>
            </Card>
          )}

          {type === "recipe" && (
            <Card>
              <CardHeader>
                <CardTitle>О рецепте</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cook_time">Время приготовления (мин)</Label>
                  <Input
                    id="cook_time"
                    type="number"
                    {...register("cook_time", { valueAsNumber: true })}
                  />
                </div>

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

                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ингредиенты</Label>
                  <Textarea
                    id="ingredients"
                    placeholder="Каждый ингредиент на новой строке:&#10;Название - количество - единица&#10;Мука - 200 - г"
                    className="min-h-[120px]"
                    {...register("ingredients")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Body */}
          <Card>
            <CardHeader>
              <CardTitle>Содержание</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="body">
                  {type === "book" ? "Заметки о книге" : "Инструкции"}
                </Label>
                <Textarea
                  id="body"
                  placeholder={
                    type === "book"
                      ? "Ваши заметки о книге..."
                      : "Пошаговые инструкции..."
                  }
                  className="min-h-[200px]"
                  {...register("body")}
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
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}