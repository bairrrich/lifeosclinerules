"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, getEntityById, updateEntity } from "@/lib/db"
import {
  RecipeIngredients,
  RecipeSteps,
  FoodRecipeForm,
  DrinkRecipeForm,
  CocktailRecipeForm,
  recipeTypeLabels,
  recipeTypeColors,
  type IngredientItem,
} from "@/components/recipes"
import type {
  ContentType,
  BookMetadata,
  BookStatus,
  RecipeContentExtended,
  FoodRecipeMetadata,
  DrinkRecipeMetadata,
  CocktailRecipeMetadata,
  RecipeIngredientItem,
  RecipeStep,
} from "@/types"
import { RecipeType } from "@/types"

// Book schema
const bookSchema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  body: z.string().optional(),
  rating: z.number().optional(),
  tags: z.string().optional(),
  author: z.string().optional(),
  year: z.number().optional(),
  pages: z.number().optional(),
  status: z.enum(["planned", "reading", "done"]),
})

// Recipe schema
const recipeSchema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  body: z.string().optional(),
  rating: z.number().optional(),
  tags: z.string().optional(),
  prep_time_min: z.number().optional(),
  cook_time_min: z.number().optional(),
  servings: z.number().optional(),
  serving_unit: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "pro"]).optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
  sugar: z.number().optional(),
  fiber: z.number().optional(),
})

type BookFormData = z.infer<typeof bookSchema>
type RecipeFormData = z.infer<typeof recipeSchema>

const typeLabels: Record<ContentType, string> = {
  book: "Книга",
  recipe: "Рецепт",
}

export default function EditContentPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Recipe specific state
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeType.FOOD)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [steps, setSteps] = useState<
    { id?: string; order: number; text: string; timer_min?: number }[]
  >([])
  const [foodMetadata, setFoodMetadata] = useState<FoodRecipeMetadata>({})
  const [drinkMetadata, setDrinkMetadata] = useState<DrinkRecipeMetadata>({ is_carbonated: false })
  const [cocktailMetadata, setCocktailMetadata] = useState<CocktailRecipeMetadata>({
    is_alcoholic: true,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookFormData | RecipeFormData>({
    resolver: zodResolver(type === "book" ? bookSchema : recipeSchema),
  })

  useEffect(() => {
    async function loadData() {
      try {
        const content = await getEntityById(db.content, id)
        if (content) {
          const baseData: Record<string, unknown> = {
            title: content.title,
            description: content.description || "",
            body: content.body || "",
            rating: content.rating,
            tags: content.tags?.join(", ") || "",
          }

          if (type === "book") {
            const m = (content as { metadata?: BookMetadata }).metadata
            if (m) {
              Object.assign(baseData, {
                author: m.author || "",
                year: m.year,
                pages: m.pages,
                status: m.status || "planned",
              })
            }
          } else if (type === "recipe") {
            const recipe = content as RecipeContentExtended

            // Recipe type
            setRecipeType(recipe.recipe_type || RecipeType.FOOD)

            // Recipe fields
            Object.assign(baseData, {
              prep_time_min: recipe.prep_time_min,
              cook_time_min: recipe.cook_time_min,
              servings: recipe.servings,
              serving_unit: recipe.serving_unit,
              difficulty: recipe.difficulty,
              calories: recipe.calories,
              protein: recipe.protein,
              fat: recipe.fat,
              carbs: recipe.carbs,
              sugar: recipe.sugar,
              fiber: recipe.fiber,
            })

            // Load ingredients
            const recipeIngredients = await db.recipeIngredientItems
              .where("recipe_id")
              .equals(id)
              .sortBy("order")
            setIngredients(
              recipeIngredients.map((ing) => ({
                id: ing.id,
                ingredient_name: ing.ingredient_name,
                amount: ing.amount,
                unit: ing.unit,
                optional: ing.optional,
                note: ing.note,
                order: ing.order,
              }))
            )

            // Load steps
            const recipeSteps = await db.recipeSteps.where("recipe_id").equals(id).sortBy("order")
            setSteps(
              recipeSteps.map((s) => ({
                id: s.id,
                order: s.order,
                text: s.text,
                timer_min: s.timer_min,
              }))
            )

            // Load metadata
            if (recipe.food_metadata) setFoodMetadata(recipe.food_metadata)
            if (recipe.drink_metadata) setDrinkMetadata(recipe.drink_metadata)
            if (recipe.cocktail_metadata) setCocktailMetadata(recipe.cocktail_metadata)
          }

          reset(baseData as BookFormData | RecipeFormData)
        }
      } catch (error) {
        console.error("Failed to load content:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, type, reset])

  const onSubmit = async (data: BookFormData | RecipeFormData) => {
    setIsSaving(true)
    try {
      const baseData = {
        title: data.title,
        description: data.description,
        body: data.body,
        rating: data.rating,
        tags: typeof data.tags === "string" ? data.tags.split(",").map((t) => t.trim()) : [],
      }

      if (type === "book") {
        const bookData = data as BookFormData
        await updateEntity(db.content, id, {
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

        // Update recipe content
        await updateEntity(db.content, id, {
          ...baseData,
          recipe_type: recipeType,
          prep_time_min: recipeData.prep_time_min,
          cook_time_min: recipeData.cook_time_min,
          total_time_min: (recipeData.prep_time_min || 0) + (recipeData.cook_time_min || 0),
          servings: recipeData.servings,
          serving_unit: recipeData.serving_unit,
          difficulty: recipeData.difficulty,
          calories: recipeData.calories,
          protein: recipeData.protein,
          fat: recipeData.fat,
          carbs: recipeData.carbs,
          sugar: recipeData.sugar,
          fiber: recipeData.fiber,
          food_metadata: recipeType === "food" ? foodMetadata : undefined,
          drink_metadata: recipeType === "drink" ? drinkMetadata : undefined,
          cocktail_metadata: recipeType === "cocktail" ? cocktailMetadata : undefined,
        })

        // Delete old ingredients and add new ones
        await db.recipeIngredientItems.where("recipe_id").equals(id).delete()
        for (const ing of ingredients) {
          await db.recipeIngredientItems.add({
            id: crypto.randomUUID(),
            recipe_id: id,
            ingredient_name: ing.ingredient_name,
            amount: ing.amount,
            unit: ing.unit,
            optional: ing.optional,
            note: ing.note,
            order: ing.order || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }

        // Delete old steps and add new ones
        await db.recipeSteps.where("recipe_id").equals(id).delete()
        for (const step of steps) {
          await db.recipeSteps.add({
            id: crypto.randomUUID(),
            recipe_id: id,
            order: step.order,
            text: step.text,
            timer_min: step.timer_min,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      router.push(`/content/${type}/${id}`)
    } catch (error) {
      console.error("Failed to update content:", error)
    } finally {
      setIsSaving(false)
    }
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

  return (
    <AppLayout title={`Редактировать: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Book Form */}
          {type === "book" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название *</Label>
                    <Input id="title" {...register("title")} />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание</Label>
                    <Textarea id="description" {...register("description")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Оценка</Label>
                    <Input
                      id="rating"
                      type="number"
                      min={1}
                      max={5}
                      {...register("rating", { valueAsNumber: true })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>О книге</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Автор</Label>
                    <Input id="author" {...register("author")} />
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
                    <NativeSelect {...register("status")}>
                      <option value="planned">Запланировано</option>
                      <option value="reading">Читаю</option>
                      <option value="done">Прочитано</option>
                    </NativeSelect>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Заметки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea className="min-h-[200px]" {...register("body")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Теги</Label>
                    <Input id="tags" placeholder="теги через запятую" {...register("tags")} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Recipe Form */}
          {type === "recipe" && (
            <>
              {/* Recipe Type Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Тип рецепта</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={recipeType}
                    onValueChange={(value) => setRecipeType(value as RecipeType)}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="food" className={recipeTypeColors["food"]}>
                        {recipeTypeLabels["food"]}
                      </TabsTrigger>
                      <TabsTrigger value="drink" className={recipeTypeColors["drink"]}>
                        {recipeTypeLabels["drink"]}
                      </TabsTrigger>
                      <TabsTrigger value="cocktail" className={recipeTypeColors["cocktail"]}>
                        {recipeTypeLabels["cocktail"]}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Основное</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Название *</Label>
                    <Input id="title" placeholder="Название рецепта" {...register("title")} />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">Порции</Label>
                      <Input
                        id="servings"
                        type="number"
                        {...register("servings", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serving_unit">Единица</Label>
                      <Input id="serving_unit" placeholder="порции" {...register("serving_unit")} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep_time_min">Подготовка (мин)</Label>
                      <Input
                        id="prep_time_min"
                        type="number"
                        {...register("prep_time_min", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook_time_min">Приготовление (мин)</Label>
                      <Input
                        id="cook_time_min"
                        type="number"
                        {...register("cook_time_min", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Сложность</Label>
                    <Tabs
                      value={(watch("difficulty") as string) || ""}
                      onValueChange={(value) =>
                        setValue(
                          "difficulty",
                          (value as "easy" | "medium" | "hard" | "pro") || undefined
                        )
                      }
                    >
                      <TabsList>
                        <TabsTrigger value="easy">Легко</TabsTrigger>
                        <TabsTrigger value="medium">Средне</TabsTrigger>
                        <TabsTrigger value="hard">Сложно</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <RecipeIngredients ingredients={ingredients} onChange={setIngredients} />

              {/* Steps */}
              <RecipeSteps steps={steps} onChange={setSteps} />

              {/* Nutrition */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Пищевая ценность</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Ккал</Label>
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
                    <div className="space-y-2">
                      <Label htmlFor="fat">Жиры (г)</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        {...register("fat", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Углеводы (г)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        {...register("carbs", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sugar">Сахар (г)</Label>
                      <Input
                        id="sugar"
                        type="number"
                        step="0.1"
                        {...register("sugar", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Type-specific forms */}
              {recipeType === "food" && (
                <FoodRecipeForm metadata={foodMetadata} onChange={setFoodMetadata} />
              )}

              {recipeType === "drink" && (
                <DrinkRecipeForm metadata={drinkMetadata} onChange={setDrinkMetadata} />
              )}

              {recipeType === "cocktail" && (
                <CocktailRecipeForm metadata={cocktailMetadata} onChange={setCocktailMetadata} />
              )}

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительно</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Теги</Label>
                    <Input id="tags" placeholder="теги через запятую" {...register("tags")} />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

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
