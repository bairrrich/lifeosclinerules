"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/lib/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, Calculator } from "@/lib/icons"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("recipes")
  const [isLoading, setIsLoading] = useState(false)

  // Состояния формы
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeTypeEnum.FOOD)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])

  // Автоматический расчёт КБЖУ из ингредиентов
  const calculateNutrition = () => {
    let totalCalories = 0
    let totalProtein = 0
    let totalFat = 0
    let totalCarbs = 0

    for (const ing of ingredients) {
      if (ing.calories_per_100 && ing.amount > 0) {
        // Определяем множитель в зависимости от единицы
        let multiplier = 1
        const unit = ing.unit.toLowerCase()

        if (unit === "г" || unit === "гр" || unit === "мл") {
          multiplier = ing.amount / 100
        } else if (unit === "кг" || unit === "л") {
          multiplier = ing.amount * 10 // кг = 1000г, делим на 100 = 10
        } else if (unit === "ст.л." || unit === "столовая ложка") {
          multiplier = (ing.amount * 15) / 100 // ~15г в ст.л.
        } else if (unit === "ч.л." || unit === "чайная ложка") {
          multiplier = (ing.amount * 5) / 100 // ~5г в ч.л.
        } else if (unit === "стакан") {
          multiplier = (ing.amount * 200) / 100 // ~200г в стакане
        } else if (unit === "шт" || unit === "штук") {
          // Для штук берём средний вес ~100г
          multiplier = (ing.amount * 100) / 100
        } else {
          // По умолчанию считаем как граммы
          multiplier = ing.amount / 100
        }

        totalCalories += (ing.calories_per_100 || 0) * multiplier
        totalProtein += (ing.protein_per_100 || 0) * multiplier
        totalFat += (ing.fat_per_100 || 0) * multiplier
        totalCarbs += (ing.carbs_per_100 || 0) * multiplier
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
    }
  }
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

        // Специфичные метаданные
        food_metadata: recipeType === "food" ? foodMetadata : undefined,
        drink_metadata: recipeType === "drink" ? drinkMetadata : undefined,
        cocktail_metadata: recipeType === "cocktail" ? cocktailMetadata : undefined,
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

      router.push("/recipes")
    } catch (error) {
      console.error("Failed to create recipe:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={t("new.title")}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Выбор типа рецепта */}
          <Card>
            <CardHeader>
              <CardTitle>{t("forms.recipeType")}</CardTitle>
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
              <CardTitle>{t("forms.main")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("fields.title")} *</Label>
                <Input
                  id="title"
                  placeholder={t("fields.titlePlaceholder")}
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("fields.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("fields.descriptionPlaceholder")}
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
                    placeholder={t("fields.servingUnitPlaceholder")}
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
                  value={watch("difficulty") || ""}
                  onValueChange={(value) =>
                    setValue("difficulty", (value as Difficulty) || undefined)
                  }
                >
                  <TabsList>
                    <TabsTrigger value="easy">{t("difficulties.easy")}</TabsTrigger>
                    <TabsTrigger value="medium">{t("difficulties.medium")}</TabsTrigger>
                    <TabsTrigger value="hard">{t("difficulties.hard")}</TabsTrigger>
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("fields.nutrition")}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nutrition = calculateNutrition()
                    setValue("calories", nutrition.calories || undefined)
                    setValue("protein", nutrition.protein || undefined)
                    setValue("fat", nutrition.fat || undefined)
                    setValue("carbs", nutrition.carbs || undefined)
                  }}
                  disabled={ingredients.length === 0}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {t("ingredients.calculate")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-xs">
                    {t("recipes.nutrition.calories")}
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    {...register("calories", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-xs">
                    {t("recipes.nutrition.protein")}
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    {...register("protein", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat" className="text-xs">
                    {t("recipes.nutrition.fat")}
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    {...register("fat", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-xs">
                    {t("recipes.nutrition.carbs")}
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    {...register("carbs", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sugar" className="text-xs">
                    {t("recipes.nutrition.sugar")}
                  </Label>
                  <Input
                    id="sugar"
                    type="number"
                    step="0.1"
                    {...register("sugar", { valueAsNumber: true })}
                    className="h-9"
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
              <CardTitle>{t("forms.additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("fields.tagsPlaceholder")} {...register("tags")} />
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
              {t("edit.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? t("edit.saving") : t("edit.save")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
