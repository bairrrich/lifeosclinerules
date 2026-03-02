"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale, useMessages } from "next-intl"
import { useRouter, useParams } from "@/lib/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Star,
  Clock,
  Flame,
  Users,
  ChefHat,
  Coffee,
  Martini,
  Timer,
  Utensils,
  Globe,
  Soup,
  Leaf,
  Droplets,
  GlassWater,
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
import { db, initializeDatabase, deleteEntity } from "@/lib/db"
import type { RecipeContentExtended, RecipeIngredientItem, RecipeStep } from "@/types"
import { recipeColors } from "@/lib/theme-colors"

const recipeTypeColors: Record<string, string> = {
  food: recipeColors.food.light,
  drink: recipeColors.drink.light,
  cocktail: recipeColors.cocktail.light,
}

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const t = useTranslations("recipes")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const messages = useMessages() as any

  // Получаем entities для текущей локали через useMessages
  // entities загружаются из i18n/request.ts как часть messages
  const entities = messages?.entities || { units: {}, unitsAbbreviations: {} }

  // Функция для получения локализованного сокращения единицы измерения
  const getUnitAbbreviation = (unit: string) => {
    if (!unit) return ""

    // Маппинг русских единиц на английские ключи (для старых данных)
    const ruToEnMap: Record<string, string> = {
      г: "g",
      кг: "kg",
      мг: "mg",
      мл: "ml",
      л: "l",
      "ч.л.": "tsp",
      "ст.л.": "tbsp",
      стакан: "cup",
      шт: "pcs",
      "щеп.": "pinch",
      "зубч.": "clove",
      "порц.": "servings",
      мин: "min",
      ч: "h",
      сек: "sec",
      "по вкусу": "to taste",
      дн: "days",
    }

    // Если это русская единица, конвертируем в английский ключ
    const normalizedUnit = ruToEnMap[unit] || unit.toLowerCase().trim()

    // Пробуем найти точное совпадение в unitsAbbreviations
    const exactMatch = entities.unitsAbbreviations?.[normalizedUnit]
    if (exactMatch) return exactMatch

    // Возвращаем исходное значение
    return unit
  }

  const [recipe, setRecipe] = useState<RecipeContentExtended | null>(null)
  const [ingredients, setIngredients] = useState<RecipeIngredientItem[]>([])
  const [steps, setSteps] = useState<RecipeStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const contentData = await db.content.get(id)

        if (contentData && contentData.type === "recipe") {
          setRecipe(contentData as RecipeContentExtended)

          // Загружаем ингредиенты и шаги
          const recipeIngredients = await db.recipeIngredientItems
            .where("recipe_id")
            .equals(id)
            .sortBy("order")
          setIngredients(recipeIngredients)

          const recipeSteps = await db.recipeSteps.where("recipe_id").equals(id).sortBy("order")
          setSteps(recipeSteps)
        }
      } catch (error) {
        console.error("Failed to load recipe:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!recipe) return
    try {
      // Удаляем связанные данные
      await db.recipeIngredientItems.where("recipe_id").equals(id).delete()
      await db.recipeSteps.where("recipe_id").equals(id).delete()

      await deleteEntity(db.content, recipe.id)
      router.push("/recipes")
    } catch (error) {
      console.error("Failed to delete recipe:", error)
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
      <AppLayout title={t("common.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("common.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!recipe) {
    return (
      <AppLayout title={t("notFound")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("notFound")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const recipeType = recipe.recipe_type || "food"

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={recipeTypeColors[recipeType]}>
                    {recipeType === "food" && <ChefHat className="h-3 w-3 mr-1" />}
                    {recipeType === "drink" && <Coffee className="h-3 w-3 mr-1" />}
                    {recipeType === "cocktail" && <Martini className="h-3 w-3 mr-1" />}
                    {t(`types.${recipeType}`)}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{recipe.title}</CardTitle>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground mt-1">{recipe.description}</p>
                )}
              </div>
              {recipe.rating !== undefined && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Время и порции - компактные бейджи */}
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.prep_time_min && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("fields.prepTime")}: {recipe.prep_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.cook_time_min && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("fields.cookTime")}: {recipe.cook_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.total_time_min && (
                <Badge variant="outline" className="text-xs">
                  Σ {recipe.total_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.servings && (
                <Badge variant="outline" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {recipe.servings} {recipe.serving_unit || t("fields.servings")}
                </Badge>
              )}
              {recipe.difficulty && (
                <Badge variant="secondary" className="text-xs">
                  {t(`difficulties.${recipe.difficulty}`)}
                </Badge>
              )}
            </div>

            {/* Food Metadata - Кухня, Тип блюда, Метод приготовления */}
            {recipeType === "food" && recipe.food_metadata && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {recipe.food_metadata.cuisine && (
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {t(`cuisines.${recipe.food_metadata.cuisine.toLowerCase()}`) ||
                        recipe.food_metadata.cuisine}
                    </Badge>
                  )}
                  {recipe.food_metadata.course_type && (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200 text-xs"
                    >
                      <Utensils className="h-3 w-3 mr-1" />
                      {t(`courseTypes.${recipe.food_metadata.course_type.toLowerCase()}`) ||
                        recipe.food_metadata.course_type}
                    </Badge>
                  )}
                  {recipe.food_metadata.cooking_method?.map((method) => (
                    <Badge
                      key={method}
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      {t(`cookingMethods.${method.toLowerCase()}`) || method}
                    </Badge>
                  ))}
                  {recipe.food_metadata.serving_temperature && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 text-xs"
                    >
                      {t(
                        `servingTemperatures.${recipe.food_metadata.serving_temperature.toLowerCase()}`
                      ) || recipe.food_metadata.serving_temperature}
                    </Badge>
                  )}
                </div>
                {/* Острота */}
                {recipe.food_metadata.spicy_level !== undefined &&
                  recipe.food_metadata.spicy_level > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {t("fields.spicyLevel")}:
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`w-6 h-2 rounded-full ${
                              level <= (recipe.food_metadata?.spicy_level || 0)
                                ? "bg-red-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t(`spicyLevels.${recipe.food_metadata.spicy_level}`)}
                      </span>
                    </div>
                  )}
                {/* Диетические опции */}
                {recipe.food_metadata.dietary && recipe.food_metadata.dietary.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {recipe.food_metadata.dietary.map((diet) => (
                      <Badge
                        key={diet}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 text-xs"
                      >
                        {t(`dietaryOptions.${diet.toLowerCase()}`) || diet}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Drink Metadata */}
            {recipeType === "drink" && recipe.drink_metadata && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {recipe.drink_metadata.drink_type && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      <Coffee className="h-3 w-3 mr-1" />
                      {t(`drinkTypes.${recipe.drink_metadata.drink_type.toLowerCase()}`) ||
                        recipe.drink_metadata.drink_type}
                    </Badge>
                  )}
                  {recipe.drink_metadata.base && (
                    <Badge
                      variant="outline"
                      className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs"
                    >
                      <GlassWater className="h-3 w-3 mr-1" />
                      {recipe.drink_metadata.base}
                    </Badge>
                  )}
                  {recipe.drink_metadata.serving_temperature && (
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 text-xs"
                    >
                      {t(
                        `servingTemperatures.${recipe.drink_metadata.serving_temperature.toLowerCase()}`
                      ) || recipe.drink_metadata.serving_temperature}
                    </Badge>
                  )}
                  {recipe.drink_metadata.is_carbonated !== undefined && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        recipe.drink_metadata.is_carbonated
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {recipe.drink_metadata.is_carbonated
                        ? t("view.carbonatedLabel")
                        : t("view.nonCarbonatedLabel")}
                    </Badge>
                  )}
                  {recipe.drink_metadata.volume_ml && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.drink_metadata.volume_ml} {tCommon("unit.ml")}
                    </Badge>
                  )}
                  {recipe.drink_metadata.caffeine_mg !== undefined &&
                    recipe.drink_metadata.caffeine_mg > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                      >
                        ☕ {recipe.drink_metadata.caffeine_mg} {tCommon("unit.mg")}
                      </Badge>
                    )}
                </div>
              </div>
            )}

            {/* Cocktail Metadata */}
            {recipeType === "cocktail" && recipe.cocktail_metadata && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-2">
                  {recipe.cocktail_metadata.is_alcoholic !== undefined && (
                    <Badge
                      variant="outline"
                      className={
                        recipe.cocktail_metadata.is_alcoholic
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {recipe.cocktail_metadata.is_alcoholic
                        ? t("view.cocktailDetails.alcoholic")
                        : t("view.cocktailDetails.nonAlcoholic")}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.alcohol_percent && (
                    <Badge variant="outline" className="text-xs">
                      {recipe.cocktail_metadata.alcohol_percent}% ABV
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.base_spirit && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                    >
                      {recipe.cocktail_metadata.base_spirit}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.cocktail_method && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                    >
                      {t(
                        `view.methods.${recipe.cocktail_metadata.cocktail_method.toLowerCase()}`
                      ) || recipe.cocktail_metadata.cocktail_method}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.glass_type && (
                    <Badge
                      variant="outline"
                      className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs"
                    >
                      {t(`view.glassTypes.${recipe.cocktail_metadata.glass_type.toLowerCase()}`) ||
                        recipe.cocktail_metadata.glass_type}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.ice_type && (
                    <Badge
                      variant="outline"
                      className="bg-sky-50 text-sky-700 border-sky-200 text-xs"
                    >
                      ❄️{" "}
                      {t(`view.iceTypes.${recipe.cocktail_metadata.ice_type.toLowerCase()}`) ||
                        recipe.cocktail_metadata.ice_type}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.color && (
                    <Badge
                      variant="outline"
                      className="bg-pink-50 text-pink-700 border-pink-200 text-xs"
                    >
                      {recipe.cocktail_metadata.color}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="recipe">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipe">{t("view.recipe")}</TabsTrigger>
            <TabsTrigger value="details">{t("view.details")}</TabsTrigger>
          </TabsList>

          <TabsContent value="recipe" className="mt-4 space-y-4">
            {/* Ингредиенты */}
            {ingredients.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("forms.ingredients")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {ingredients.map((ing, i) => (
                      <li key={ing.id || i} className="flex items-center justify-between text-sm">
                        <span>
                          {ing.ingredient_name}
                          {ing.optional && (
                            <span className="text-muted-foreground ml-1">
                              ({t("ingredients.optional")})
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {ing.amount} {getUnitAbbreviation(ing.unit)}
                          {ing.note && <span className="text-xs ml-1">({ing.note})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Шаги приготовления */}
            {steps.length > 0 ? (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("view.instructions")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                                <span>
                                  {step.timer_min} {t("fields.minutes")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  {t("steps.noInstructions")}
                </CardContent>
              </Card>
            )}

            {/* КБЖУ */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("view.nutrition")}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Первая строка: КБЖУ */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {/* Калории */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50">
                    <div className="flex items-center gap-1 mb-1">
                      <Flame className="h-3 w-3 text-orange-700" />
                      <span className="text-xs text-orange-700">{t("view.calories")}</span>
                    </div>
                    <span className="font-semibold text-sm">{recipe.calories || "-"}</span>
                  </div>
                  {/* Белки */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50">
                    <span className="text-xs text-blue-700 mb-1">{t("view.protein")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.protein !== undefined ? `${recipe.protein}${tCommon("unit.g")}` : "-"}
                    </span>
                  </div>
                  {/* Жиры */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-yellow-50">
                    <span className="text-xs text-yellow-700 mb-1">{t("view.fat")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.fat !== undefined ? `${recipe.fat}${tCommon("unit.g")}` : "-"}
                    </span>
                  </div>
                  {/* Углеводы */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-green-50">
                    <span className="text-xs text-green-700 mb-1">{t("view.carbs")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.carbs !== undefined ? `${recipe.carbs}${tCommon("unit.g")}` : "-"}
                    </span>
                  </div>
                </div>
                {/* Вторая строка: Сахар и Клетчатка */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Сахар */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-pink-50">
                    <span className="text-sm text-pink-700">{t("view.sugar")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.sugar !== undefined ? `${recipe.sugar}${tCommon("unit.g")}` : "-"}
                    </span>
                  </div>
                  {/* Клетчатка */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50">
                    <span className="text-sm text-emerald-700">{t("view.fiber")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.fiber !== undefined ? `${recipe.fiber}${tCommon("unit.g")}` : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Специфичные метаданные для блюд */}
            {recipe.recipe_type === "food" && recipe.food_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("fields.dishParameters")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Тип блюда */}
                  {recipe.food_metadata.course_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.courseType")}: </span>
                      <span className="font-medium">
                        {t(`courseTypes.${recipe.food_metadata.course_type.toLowerCase()}`) ||
                          recipe.food_metadata.course_type}
                      </span>
                    </div>
                  )}

                  {/* Кухня */}
                  {recipe.food_metadata.cuisine && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.cuisine")}: </span>
                      <span className="font-medium">
                        {t(`cuisines.${recipe.food_metadata.cuisine.toLowerCase()}`) ||
                          recipe.food_metadata.cuisine}
                      </span>
                    </div>
                  )}

                  {/* Метод приготовления */}
                  {recipe.food_metadata.cooking_method &&
                    recipe.food_metadata.cooking_method.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {t("fields.cookingMethod")}:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recipe.food_metadata.cooking_method.map((method, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {t(`cookingMethods.${method.toLowerCase()}`) || method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Температура подачи */}
                  {recipe.food_metadata.serving_temperature && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("fields.servingTemperature")}:{" "}
                      </span>
                      <span className="font-medium">
                        {t(
                          `servingTemperatures.${recipe.food_metadata.serving_temperature.toLowerCase()}`
                        ) || recipe.food_metadata.serving_temperature}
                      </span>
                    </div>
                  )}

                  {/* Острота */}
                  {recipe.food_metadata.spicy_level !== undefined &&
                    recipe.food_metadata.spicy_level > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t("fields.spicyLevel")}: </span>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`w-5 h-2 rounded-full ${
                                level <= (recipe.food_metadata?.spicy_level || 0)
                                  ? "bg-red-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Диетические опции */}
                  {recipe.food_metadata.dietary && recipe.food_metadata.dietary.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t("fields.dietary")}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recipe.food_metadata.dietary.map((diet, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {t(`dietaryOptions.${diet.toLowerCase()}`) || diet}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Специфичные метаданные для напитков */}
            {recipe.recipe_type === "drink" && recipe.drink_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("view.drinkDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Тип напитка */}
                  {recipe.drink_metadata.drink_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.drinkType")}: </span>
                      <span className="font-medium">
                        {t(`view.drinkTypes.${recipe.drink_metadata.drink_type.toLowerCase()}`) ||
                          recipe.drink_metadata.drink_type}
                      </span>
                    </div>
                  )}

                  {/* База */}
                  {recipe.drink_metadata.base && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.base")}: </span>
                      <span className="font-medium">
                        {t(`view.bases.${recipe.drink_metadata.base.toLowerCase()}`) ||
                          recipe.drink_metadata.base}
                      </span>
                    </div>
                  )}

                  {/* Температура подачи */}
                  {recipe.drink_metadata.serving_temperature && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("fields.servingTemperature")}:{" "}
                      </span>
                      <span className="font-medium">
                        {t(
                          `servingTemperatures.${recipe.drink_metadata.serving_temperature.toLowerCase()}`
                        ) || recipe.drink_metadata.serving_temperature}
                      </span>
                    </div>
                  )}

                  {/* Газация */}
                  {recipe.drink_metadata.is_carbonated !== undefined && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("view.carbonatedLabel")}: </span>
                      <span className="font-medium">
                        {recipe.drink_metadata.is_carbonated ? tCommon("yes") : tCommon("no")}
                      </span>
                    </div>
                  )}

                  {/* Объём */}
                  {recipe.drink_metadata.volume_ml && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.volume")}: </span>
                      <span className="font-medium">
                        {recipe.drink_metadata.volume_ml} {tCommon("unit.ml")}
                      </span>
                    </div>
                  )}

                  {/* Кофеин */}
                  {recipe.drink_metadata.caffeine_mg !== undefined &&
                    recipe.drink_metadata.caffeine_mg > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">{t("fields.caffeine")}: </span>
                        <span className="font-medium">
                          {recipe.drink_metadata.caffeine_mg} {tCommon("unit.mg")}
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Специфичные метаданные для коктейлей */}
            {recipe.recipe_type === "cocktail" && recipe.cocktail_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("view.cocktailDetails.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Алкогольный/безалкогольный и крепость */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={
                        recipe.cocktail_metadata.is_alcoholic
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-green-500/10 text-green-500"
                      }
                    >
                      {recipe.cocktail_metadata.is_alcoholic
                        ? t("view.cocktailDetails.alcoholic")
                        : t("view.cocktailDetails.nonAlcoholic")}
                    </Badge>
                    {recipe.cocktail_metadata.alcohol_percent && (
                      <Badge variant="outline">
                        {recipe.cocktail_metadata.alcohol_percent}% ABV
                      </Badge>
                    )}
                  </div>

                  {/* IBA категория */}
                  {recipe.cocktail_metadata.iba_category && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.ibaCategory")}: </span>
                      <span className="font-medium">{recipe.cocktail_metadata.iba_category}</span>
                    </div>
                  )}

                  {/* Основные параметры */}
                  <div className="flex flex-wrap gap-2">
                    {recipe.cocktail_metadata.base_spirit && (
                      <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        {recipe.cocktail_metadata.base_spirit}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.cocktail_method && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {t(
                          `view.methods.${recipe.cocktail_metadata.cocktail_method.toLowerCase()}`
                        ) || recipe.cocktail_metadata.cocktail_method}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.glass_type && (
                      <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                        {t(
                          `view.glassTypes.${recipe.cocktail_metadata.glass_type.toLowerCase()}`
                        ) || recipe.cocktail_metadata.glass_type}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.ice_type && (
                      <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                        ❄️{" "}
                        {t(`view.iceTypes.${recipe.cocktail_metadata.ice_type.toLowerCase()}`) ||
                          recipe.cocktail_metadata.ice_type}
                      </Badge>
                    )}
                  </div>

                  {/* Цвет */}
                  {recipe.cocktail_metadata.color && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("fields.color")}: </span>
                      <span className="font-medium">{recipe.cocktail_metadata.color}</span>
                    </div>
                  )}

                  {/* Гарнир */}
                  {recipe.cocktail_metadata.garnish &&
                    recipe.cocktail_metadata.garnish.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          {t("fields.garnish")}:{" "}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {recipe.cocktail_metadata.garnish.map((g, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs bg-pink-50 text-pink-700 border-pink-200"
                            >
                              🍒 {t(`view.garnishes.${g.toLowerCase()}`) || g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Инструменты */}
                  {recipe.cocktail_metadata.tools && recipe.cocktail_metadata.tools.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t("fields.tools")}: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recipe.cocktail_metadata.tools.map((tool, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-slate-50 text-slate-700 border-slate-200"
                          >
                            🔧 {t(`view.tools.${tool.toLowerCase()}`) || tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t("createdAt")}</p>
                  <p>{formatDate(recipe.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t("updatedAt")}</p>
                  <p>{formatDate(recipe.updated_at)}</p>
                </div>
                {recipe.tags && recipe.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{t("fields.tags")}</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, i) => (
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
            {t("common.delete")}
          </Button>
          <Link href={`/recipes/${id}/edit`} className="flex-1">
            <Button className="w-full">
              <Pencil className="h-4 w-4 mr-2" />
              {t("common.edit")}
            </Button>
          </Link>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("deleteDialog.description", { title: recipe.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t("common.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
