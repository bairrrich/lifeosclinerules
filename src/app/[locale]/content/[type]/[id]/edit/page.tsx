"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "@/lib/icons"
import { useTranslations, useLocale } from "next-intl"
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

// Book schema factory function
function createBookSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(1, t("validation.titleRequired")),
    description: z.string().optional(),
    body: z.string().optional(),
    rating: z.number().optional(),
    tags: z.string().optional(),
    author: z.string().optional(),
    year: z.number().optional(),
    pages: z.number().optional(),
    status: z.enum(["planned", "reading", "done"]),
  })
}

// Recipe schema factory function
function createRecipeSchema(t: (key: string) => string) {
  return z.object({
    title: z.string().min(1, t("validation.titleRequired")),
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
}

type BookFormData = z.infer<ReturnType<typeof createBookSchema>>
type RecipeFormData = z.infer<ReturnType<typeof createRecipeSchema>>

export default function EditContentPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType
  const id = params.id as string
  const t = useTranslations("recipes")
  const tCommon = useTranslations("common")
  const locale = useLocale()

  const typeLabels: Record<ContentType, string> = {
    book: t("types.book"),
    recipe: t("types.recipe"),
  }

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
    resolver: zodResolver(
      type === "book"
        ? createBookSchema((key) => t(`validation.${key}`))
        : createRecipeSchema((key) => t(`validation.${key}`))
    ),
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
      <AppLayout title={tCommon("loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {tCommon("loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`${t("edit.title")} ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Book Form */}
          {type === "book" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{t("edit.basic")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("fields.title")} *</Label>
                    <Input id="title" {...register("title")} />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t("fields.description")}</Label>
                    <Textarea id="description" {...register("description")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">{t("userBook.rating")}</Label>
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
                  <CardTitle>{t("edit.bookDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">{t("fields.authors")}</Label>
                    <Input id="author" {...register("author")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">{t("fields.publishedYear")}</Label>
                      <Input
                        id="year"
                        type="number"
                        {...register("year", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pages">{t("fields.pageCount")}</Label>
                      <Input
                        id="pages"
                        type="number"
                        {...register("pages", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("userBook.status")}</Label>
                    <NativeSelect {...register("status")}>
                      <option value="planned">{t("status.planned")}</option>
                      <option value="reading">{t("status.reading")}</option>
                      <option value="done">{t("status.completed")}</option>
                    </NativeSelect>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("view.notes")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Textarea className="min-h-[200px]}" {...register("body")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">{t("view.tags")}</Label>
                    <Input
                      id="tags"
                      placeholder={t("view.tagsPlaceholder")}
                      {...register("tags")}
                    />
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
                  <CardTitle>{t("edit.recipeType")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={recipeType}
                    onValueChange={(value) => setRecipeType(value as RecipeType)}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger
                        value="food"
                        className={recipeTypeColors["food"] + " px-1 sm:px-2"}
                      >
                        <span className="mr-1">🍳</span>
                        <span className="hidden sm:inline">{t("types.food")}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="drink"
                        className={recipeTypeColors["drink"] + " px-1 sm:px-2"}
                      >
                        <span className="mr-1">☕</span>
                        <span className="hidden sm:inline">{t("types.drink")}</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="cocktail"
                        className={recipeTypeColors["cocktail"] + " px-1 sm:px-2"}
                      >
                        <span className="mr-1">🍸</span>
                        <span className="hidden sm:inline">{t("types.cocktail")}</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("edit.basic")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("fields.title")} *</Label>
                    <Input id="title" placeholder={t("fields.title")} {...register("title")} />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("fields.description")}</Label>
                    <Textarea
                      id="description"
                      placeholder={t("fields.description")}
                      {...register("description")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servings">{t("fields.servings")}</Label>
                      <Input
                        id="servings"
                        type="number"
                        {...register("servings", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serving_unit">{t("fields.servingUnit")}</Label>
                      <Input
                        id="serving_unit"
                        placeholder={t("fields.servingUnit")}
                        {...register("serving_unit")}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prep_time_min">{t("fields.prepTime")}</Label>
                      <Input
                        id="prep_time_min"
                        type="number"
                        {...register("prep_time_min", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cook_time_min">{t("fields.cookTime")}</Label>
                      <Input
                        id="cook_time_min"
                        type="number"
                        {...register("cook_time_min", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("fields.difficulty")}</Label>
                    <Tabs
                      value={(watch("difficulty") as string) || ""}
                      onValueChange={(value) =>
                        setValue(
                          "difficulty",
                          (value as "easy" | "medium" | "hard" | "pro") || undefined
                        )
                      }
                    >
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="easy">{t("difficulty.easy")}</TabsTrigger>
                        <TabsTrigger value="medium">{t("difficulty.medium")}</TabsTrigger>
                        <TabsTrigger value="hard">{t("difficulty.hard")}</TabsTrigger>
                        <TabsTrigger value="pro">{t("difficulty.pro")}</TabsTrigger>
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
                  <CardTitle className="text-base">{t("edit.nutrition")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="calories">{t("fields.calories")}</Label>
                      <Input
                        id="calories"
                        type="number"
                        placeholder="0"
                        {...register("calories", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="protein">{t("fields.protein")}</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register("protein", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fat">{t("fields.fat")}</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register("fat", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="carbs">{t("fields.carbs")}</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register("carbs", { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sugar">{t("fields.sugar")}</Label>
                      <Input
                        id="sugar"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register("sugar", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fiber">{t("fields.fiber")}</Label>
                      <Input
                        id="fiber"
                        type="number"
                        step="0.1"
                        placeholder="0"
                        {...register("fiber", { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {t("edit.nutrition.optional")}
                  </p>
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
                  <CardTitle>{t("view.additional")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">{t("view.tags")}</Label>
                    <Input
                      id="tags"
                      placeholder={t("view.tagsPlaceholder")}
                      {...register("tags")}
                    />
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
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? tCommon("loading") : tCommon("save")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
