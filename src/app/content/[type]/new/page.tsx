"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, createEntity, initializeDatabase } from "@/lib/db"
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
  RecipeType,
  Difficulty,
  FoodRecipeMetadata,
  DrinkRecipeMetadata,
  CocktailRecipeMetadata,
  RecipeContentExtended,
} from "@/types"
import { ContentType, RecipeType as RecipeTypeEnum } from "@/types"

// Form schema
const baseRecipeSchema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
  recipe_type: z.enum(["food", "drink", "cocktail"]),
  servings: z.number().optional(),
  serving_unit: z.string().optional(),
  prep_time_min: z.number().optional(),
  cook_time_min: z.number().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "pro"]).optional(),
  rating: z.number().min(1).max(5).optional(),
  tags: z.string().optional(),

  // КБЖУ
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
  sugar: z.number().optional(),
  fiber: z.number().optional(),
})

type FormData = z.infer<typeof baseRecipeSchema>

export default function NewRecipePage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ContentType

  const [isLoading, setIsLoading] = useState(false)

  // Состояния формы
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeTypeEnum.FOOD)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [steps, setSteps] = useState<
    { id?: string; order: number; text: string; timer_min?: number; isNew?: boolean }[]
  >([])

  // Специфичные метаданные
  const [foodMetadata, setFoodMetadata] = useState<FoodRecipeMetadata>({})
  const [drinkMetadata, setDrinkMetadata] = useState<DrinkRecipeMetadata>({
    is_carbonated: false,
  })
  const [cocktailMetadata, setCocktailMetadata] = useState<CocktailRecipeMetadata>({
    is_alcoholic: true,
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(baseRecipeSchema),
    defaultValues: {
      recipe_type: "food",
      servings: 2,
      serving_unit: "порции",
    },
  })

  useEffect(() => {
    initializeDatabase()
  }, [])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const recipeData: Omit<RecipeContentExtended, "id" | "created_at" | "updated_at"> = {
        type: ContentType.RECIPE,
        recipe_type: data.recipe_type as RecipeType,
        title: data.title,
        description: data.description,
        rating: data.rating,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],

        // Время
        prep_time_min: data.prep_time_min,
        cook_time_min: data.cook_time_min,
        total_time_min: (data.prep_time_min || 0) + (data.cook_time_min || 0),

        // Порции
        servings: data.servings,
        serving_unit: data.serving_unit,
        difficulty: data.difficulty,

        // КБЖУ
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        sugar: data.sugar,
        fiber: data.fiber,
      }

      const recipeId = await createEntity(
        db.content,
        recipeData as Omit<RecipeContentExtended, "id" | "created_at" | "updated_at">
      )

      // Сохраняем ингредиенты
      if (ingredients.length > 0) {
        for (const ing of ingredients) {
          await createEntity(db.recipeIngredientItems, {
            recipe_id: recipeId,
            ingredient_name: ing.ingredient_name,
            amount: ing.amount,
            unit: ing.unit,
            optional: ing.optional,
            note: ing.note,
            order: ing.order,
          })
        }
      }

      // Сохраняем шаги
      if (steps.length > 0) {
        for (const step of steps) {
          await createEntity(db.recipeSteps, {
            recipe_id: recipeId,
            order: step.order,
            text: step.text,
            timer_min: step.timer_min,
          })
        }
      }

      router.push("/content")
    } catch (error) {
      console.error("Failed to create recipe:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={`Новый рецепт`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Выбор типа рецепта */}
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

          {/* Основное */}
          <Card>
            <CardHeader>
              <CardTitle>Основное</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input id="title" placeholder="Название рецепта" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
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
                  value={watch("difficulty") || ""}
                  onValueChange={(value) =>
                    setValue("difficulty", (value as Difficulty) || undefined)
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

          {/* Ингредиенты */}
          <RecipeIngredients ingredients={ingredients} onChange={setIngredients} />

          {/* Шаги */}
          <RecipeSteps steps={steps} onChange={setSteps} />

          {/* КБЖУ */}
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
              <div className="grid grid-cols-2 gap-4">
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

          {/* Специфичные поля */}
          {recipeType === "food" && (
            <FoodRecipeForm metadata={foodMetadata} onChange={setFoodMetadata} />
          )}

          {recipeType === "drink" && (
            <DrinkRecipeForm metadata={drinkMetadata} onChange={setDrinkMetadata} />
          )}

          {recipeType === "cocktail" && (
            <CocktailRecipeForm metadata={cocktailMetadata} onChange={setCocktailMetadata} />
          )}

          {/* Теги */}
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

          {/* Действия */}
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
