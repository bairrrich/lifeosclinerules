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
import { Combobox } from "@/components/ui/combobox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, createEntity, initializeDatabase } from "@/lib/db"
import {
  RecipeIngredients,
  RecipeSteps,
  FoodRecipeForm,
  DrinkRecipeForm,
  CocktailRecipeForm,
  recipeTypeColors,
  type IngredientItem,
} from "@/components/recipes"
import { ImageUpload } from "@/components/shared/forms"
import type {
  RecipeType,
  Difficulty,
  FoodRecipeMetadata,
  DrinkRecipeMetadata,
  CocktailRecipeMetadata,
  RecipeContentExtended,
} from "@/types"
import { ContentType, RecipeType as RecipeTypeEnum } from "@/types"

// Преобразование пустой строки в 0 для числовых полей
const emptyStringToZero = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return 0
  return Number(val)
}, z.number())

// Form schema - сообщение об ошибке будет установлено в компоненте
const baseRecipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  recipe_type: z.enum(["food", "drink", "cocktail"]),
  servings: emptyStringToZero,
  serving_unit: z.string().optional(),
  prep_time_min: emptyStringToZero,
  cook_time_min: emptyStringToZero,
  difficulty: z.enum(["easy", "medium", "hard", "pro"]).optional(),
  rating: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return 0
    const num = Number(val)
    if (isNaN(num)) return 0
    return num
  }, z.number().min(0).max(5)),
  tags: z.string().optional(),
  personal_notes: z.string().optional(),

  // КБЖУ - необязательные поля (0 по умолчанию)
  calories: emptyStringToZero,
  protein: emptyStringToZero,
  fat: emptyStringToZero,
  carbs: emptyStringToZero,
  sugar: emptyStringToZero,
  fiber: emptyStringToZero,
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
    let totalFiber = 0

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
        totalFiber += (ing.fiber_per_100 || 0) * multiplier
      }
    }

    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
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
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(baseRecipeSchema),
    defaultValues: {
      recipe_type: "food",
      servings: 2,
      serving_unit: t("fields.servingUnitPlaceholder"),
      prep_time_min: 0,
      cook_time_min: 0,
      rating: 0,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      sugar: 0,
      fiber: 0,
    },
  })

  // Логирование ошибок валидации
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors)
    }
  }, [errors])

  useEffect(() => {
    initializeDatabase()
  }, [])

  const onSubmit = async (data: any) => {
    console.log("onSubmit called with data:", data)
    setIsLoading(true)
    try {
      // Определяем image_url из метаданных в зависимости от типа рецепта
      const imageUrl =
        recipeType === "food"
          ? foodMetadata.image_url
          : recipeType === "drink"
            ? drinkMetadata.image_url
            : cocktailMetadata.image_url

      console.log("Creating recipe with:", {
        recipe_type: recipeType,
        title: data.title,
        image_url: imageUrl,
      })

      const recipeData: Omit<RecipeContentExtended, "id" | "created_at" | "updated_at"> = {
        type: ContentType.RECIPE,
        recipe_type: data.recipe_type as RecipeType,
        title: data.title,
        description: data.description,
        image_url: imageUrl,
        rating: data.rating,
        personal_notes: data.personal_notes,
        tags: data.tags ? data.tags.split(",").map((tag: string) => tag.trim()) : [],

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

      console.log("Recipe data to save:", recipeData)

      const recipeId = await createEntity(
        db.content,
        recipeData as Omit<RecipeContentExtended, "id" | "created_at" | "updated_at">
      )

      console.log("Recipe created with ID:", recipeId)

      // Сохраняем ингредиенты
      if (ingredients.length > 0) {
        console.log("Saving ingredients:", ingredients.length)
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
        console.log("Saving steps:", steps.length)
        for (const step of steps) {
          await createEntity(db.recipeSteps, {
            recipe_id: recipeId,
            order: step.order,
            text: step.text,
            timer_min: step.timer_min,
          })
        }
      }

      console.log("Recipe saved successfully, redirecting...")
      router.push("/recipes")
    } catch (error) {
      console.error("Failed to create recipe:", error)
      alert(
        `Ошибка при сохранении рецепта: ${error instanceof Error ? error.message : String(error)}`
      )
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={t("new.title")}>
      <div className="container mx-auto px-4 py-6">
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault()
            console.log("Form submit event triggered")

            // Ручная валидация
            const isValid = await trigger()
            console.log("Validation result:", isValid)

            if (isValid) {
              // Получаем данные формы через watch
              const formData = watch()
              console.log("Form data from watch:", formData)
              await onSubmit(formData)
            } else {
              console.log("Form validation failed")
            }
          }}
        >
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
                  <TabsTrigger value="food" className={recipeTypeColors["food"] + " px-1 sm:px-2"}>
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

              {/* Изображение */}
              <ImageUpload
                imageUrl={
                  recipeType === "food"
                    ? foodMetadata.image_url
                    : recipeType === "drink"
                      ? drinkMetadata.image_url
                      : cocktailMetadata.image_url
                }
                onChange={(url) => {
                  if (recipeType === "food") {
                    setFoodMetadata((prev) => ({ ...prev, image_url: url }))
                  } else if (recipeType === "drink") {
                    setDrinkMetadata((prev) => ({ ...prev, image_url: url }))
                  } else {
                    setCocktailMetadata((prev) => ({ ...prev, image_url: url }))
                  }
                }}
                label={t("fields.imageUrl")}
                placeholder={t("fields.imageUrlPlaceholder")}
              />

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
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="easy">{t("difficulties.easy")}</TabsTrigger>
                    <TabsTrigger value="medium">{t("difficulties.medium")}</TabsTrigger>
                    <TabsTrigger value="hard">{t("difficulties.hard")}</TabsTrigger>
                    <TabsTrigger value="pro">{t("difficulties.pro")}</TabsTrigger>
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
                <CardTitle>{t("fields.nutrition")}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const nutrition = calculateNutrition()
                    setValue("calories", nutrition.calories || 0)
                    setValue("protein", nutrition.protein || 0)
                    setValue("fat", nutrition.fat || 0)
                    setValue("carbs", nutrition.carbs || 0)
                    setValue("fiber", nutrition.fiber || 0)
                  }}
                  disabled={ingredients.length === 0}
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  {t("ingredients.calculate")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="calories" className="text-sm font-medium">
                    {t("nutrition.calories")}
                  </Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="0"
                    {...register("calories", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein" className="text-sm font-medium">
                    {t("nutrition.protein")}
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register("protein", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat" className="text-sm font-medium">
                    {t("nutrition.fat")}
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register("fat", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs" className="text-sm font-medium">
                    {t("nutrition.carbs")}
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register("carbs", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sugar" className="text-sm font-medium">
                    {t("nutrition.sugar")}
                  </Label>
                  <Input
                    id="sugar"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register("sugar", { valueAsNumber: true })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiber" className="text-sm font-medium">
                    {t("nutrition.fiber")}
                  </Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    {...register("fiber", { valueAsNumber: true })}
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

          {/* Дополнительно */}
          <Card>
            <CardHeader>
              <CardTitle>{t("forms.additional")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Рейтинг */}
              <div className="space-y-2">
                <Label htmlFor="rating">{t("fields.rating")}</Label>
                <Combobox
                  options={[
                    { id: "0", label: "–" },
                    { id: "1", label: "1" },
                    { id: "2", label: "2" },
                    { id: "3", label: "3" },
                    { id: "4", label: "4" },
                    { id: "5", label: "5" },
                  ]}
                  value={watch("rating")?.toString() || ""}
                  onChange={(value) => setValue("rating", value ? parseInt(value as string) : 0)}
                  placeholder="5"
                  allowCustom={false}
                  searchable={false}
                />
              </div>

              {/* Личные заметки */}
              <div className="space-y-2">
                <Label htmlFor="personal_notes">{t("fields.personalNotes")}</Label>
                <textarea
                  id="personal_notes"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={t("fields.personalNotesPlaceholder")}
                  {...register("personal_notes")}
                />
              </div>

              {/* Теги */}
              <div className="space-y-2">
                <Label htmlFor="tags">{t("fields.tags")}</Label>
                <Input id="tags" placeholder={t("fields.tagsPlaceholder")} {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          {/* Действия */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="sm:w-[160px] sm:h-10 w-[44px] h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t("edit.cancel")}</span>
            </Button>
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={isLoading}
              className="w-[160px] h-10"
            >
              <Save className="h-4 w-4" />
              <span className="ml-2">{isLoading ? t("edit.saving") : t("edit.save")}</span>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
