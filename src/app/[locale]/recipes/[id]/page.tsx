"use client"

import { useEffect, useState, useRef } from "react"
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
  Crop,
  RotateCcw,
  ImageMinus,
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
import { DeleteConfirmActions } from "@/components/shared/page-actions"
import { db, initializeDatabase, deleteEntity } from "@/lib/db"
import { cn } from "@/lib/utils"
import type { RecipeContentExtended, RecipeIngredientItem, RecipeStep } from "@/types"
import { recipeColors } from "@/lib/theme-colors"
import { Cropper, CropperRef } from "react-advanced-cropper"
import "react-advanced-cropper/dist/style.css"

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
  const [isCropping, setIsCropping] = useState(false)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  const cropperRef = useRef<CropperRef>(null)

  // Загрузка сохранённого обрезанного изображения из localStorage
  useEffect(() => {
    if (id) {
      const savedCroppedImage = localStorage.getItem(`recipe-${id}-cropped`)
      if (savedCroppedImage) {
        setCroppedImage(savedCroppedImage)
      }
    }
  }, [id])

  // Сохранение обрезанного изображения в localStorage
  useEffect(() => {
    if (croppedImage && id) {
      try {
        localStorage.setItem(`recipe-${id}-cropped`, croppedImage)
      } catch (error) {
        console.error("Failed to save cropped image to localStorage:", error)
      }
    }
  }, [croppedImage, id])

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
        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            {/* Изображение рецепта */}
            {recipe.image_url && (
              <div className="mb-4 group relative">
                <div className="rounded-lg overflow-hidden bg-muted">
                  {isCropping ? (
                    <div className="h-56">
                      <Cropper
                        ref={cropperRef}
                        src={croppedImage || recipe.image_url}
                        stencilProps={{
                          aspectRatio: 16 / 9,
                        }}
                        className="h-full"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : (
                    <img
                      src={croppedImage || recipe.image_url}
                      alt={recipe.title}
                      className="w-full aspect-video object-cover"
                      crossOrigin="anonymous"
                    />
                  )}
                </div>
                {/* Контролы изображения - появляются при наведении */}
                {!isCropping && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 shadow-lg"
                      onClick={() => setIsCropping(true)}
                      title="Обрезать изображение"
                    >
                      <Crop className="h-4 w-4" />
                    </Button>
                    {croppedImage && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 shadow-lg"
                          onClick={() => {
                            setCroppedImage(null)
                            setIsCropping(false)
                            localStorage.removeItem(`recipe-${id}-cropped`)
                          }}
                          title="Сбросить обрезку"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 shadow-lg"
                          onClick={() => {
                            if (recipe.image_url) {
                              setCroppedImage(recipe.image_url)
                              localStorage.setItem(`recipe-${id}-cropped`, recipe.image_url)
                            }
                          }}
                          title="Вернуть оригинал"
                        >
                          <ImageMinus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
                {/* Контролы для режима обрезки */}
                {isCropping && (
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        if (cropperRef.current) {
                          try {
                            const canvas = cropperRef.current.getCanvas()
                            if (canvas) {
                              const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.9)
                              setCroppedImage(croppedDataUrl)
                              localStorage.setItem(`recipe-${id}-cropped`, croppedDataUrl)
                              setIsCropping(false)
                            } else {
                              console.error("Canvas is null")
                            }
                          } catch (error) {
                            console.error("Failed to crop image:", error)
                            alert(
                              "Не удалось обрезать изображение. Возможно, это внешнее изображение с ограничениями CORS."
                            )
                            setIsCropping(false)
                          }
                        }
                      }}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => setIsCropping(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Заголовок */}
            <CardTitle className="text-xl mb-2">{recipe.title}</CardTitle>

            {/* Описание */}
            {recipe.description && (
              <p className="text-sm text-muted-foreground mb-3">{recipe.description}</p>
            )}

            {/* Тип рецепта и рейтинг в одной строке */}
            <div className="flex items-center gap-2">
              <Badge className={recipeTypeColors[recipeType]}>
                {recipeType === "food" && <ChefHat className="h-3 w-3 mr-1" />}
                {recipeType === "drink" && <Coffee className="h-3 w-3 mr-1" />}
                {recipeType === "cocktail" && <Martini className="h-3 w-3 mr-1" />}
                {t(`types.${recipeType}`)}
              </Badge>

              {recipe.rating !== undefined && (
                <div className="flex items-center gap-1">
                  <Star
                    className={`h-4 w-4 ${recipeColors.rating.fill} ${recipeColors.rating.DEFAULT}`}
                  />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {/* Время и порции - компактные бейджи */}
            <div className="flex flex-wrap gap-2 mt-2">
              {recipe.prep_time_min !== undefined && recipe.prep_time_min > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("fields.prepTime")}: {recipe.prep_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.cook_time_min !== undefined && recipe.cook_time_min > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {t("fields.cookTime")}: {recipe.cook_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.total_time_min !== undefined && recipe.total_time_min > 0 && (
                <Badge variant="outline" className="text-xs">
                  Σ {recipe.total_time_min} {t("fields.minutes")}
                </Badge>
              )}
              {recipe.servings !== undefined && recipe.servings > 0 && (
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
                      className={`text-xs ${recipeColors.cuisine.bg} ${recipeColors.cuisine.text} ${recipeColors.cuisine.border}`}
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {t(`cuisines.${recipe.food_metadata.cuisine.toLowerCase()}`) ||
                        recipe.food_metadata.cuisine}
                    </Badge>
                  )}
                  {recipe.food_metadata.course_type && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.courseType.bg} ${recipeColors.courseType.text} ${recipeColors.courseType.border}`}
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
                      className={`text-xs ${recipeColors.cookingMethod.bg} ${recipeColors.cookingMethod.text} ${recipeColors.cookingMethod.border}`}
                    >
                      {t(`cookingMethods.${method.toLowerCase()}`) || method}
                    </Badge>
                  ))}
                  {recipe.food_metadata.serving_temperature && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.servingTemperature.bg} ${recipeColors.servingTemperature.text} ${recipeColors.servingTemperature.border}`}
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
                                ? recipeColors.spicy.active
                                : recipeColors.spicy.inactive
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
                        className={`text-xs ${recipeColors.dietary.bg} ${recipeColors.dietary.text} ${recipeColors.dietary.border}`}
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
                      className={`text-xs ${recipeColors.drinkType.bg} ${recipeColors.drinkType.text} ${recipeColors.drinkType.border}`}
                    >
                      <Coffee className="h-3 w-3 mr-1" />
                      {t(`drinkTypes.${recipe.drink_metadata.drink_type.toLowerCase()}`) ||
                        recipe.drink_metadata.drink_type}
                    </Badge>
                  )}
                  {recipe.drink_metadata.base && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.base.bg} ${recipeColors.base.text} ${recipeColors.base.border}`}
                    >
                      <GlassWater className="h-3 w-3 mr-1" />
                      {recipe.drink_metadata.base}
                    </Badge>
                  )}
                  {recipe.drink_metadata.serving_temperature && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.servingTemperature.bg} ${recipeColors.servingTemperature.text} ${recipeColors.servingTemperature.border}`}
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
                          ? recipeColors.carbonated.yes
                          : recipeColors.carbonated.no
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
                        className={`text-xs ${recipeColors.caffeine.bg} ${recipeColors.caffeine.text} ${recipeColors.caffeine.border}`}
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
                          ? recipeColors.alcoholic.yes
                          : recipeColors.alcoholic.no
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
                      className={`text-xs ${recipeColors.baseSpirit.bg} ${recipeColors.baseSpirit.text} ${recipeColors.baseSpirit.border}`}
                    >
                      {recipe.cocktail_metadata.base_spirit}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.cocktail_method && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.cocktailMethod.bg} ${recipeColors.cocktailMethod.text} ${recipeColors.cocktailMethod.border}`}
                    >
                      {t(
                        `view.methods.${recipe.cocktail_metadata.cocktail_method.toLowerCase()}`
                      ) || recipe.cocktail_metadata.cocktail_method}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.glass_type && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.glassType.bg} ${recipeColors.glassType.text} ${recipeColors.glassType.border}`}
                    >
                      {t(`view.glassTypes.${recipe.cocktail_metadata.glass_type.toLowerCase()}`) ||
                        recipe.cocktail_metadata.glass_type}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.ice_type && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.iceType.bg} ${recipeColors.iceType.text} ${recipeColors.iceType.border}`}
                    >
                      ❄️{" "}
                      {t(`view.iceTypes.${recipe.cocktail_metadata.ice_type.toLowerCase()}`) ||
                        recipe.cocktail_metadata.ice_type}
                    </Badge>
                  )}
                  {recipe.cocktail_metadata.color && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${recipeColors.color.bg} ${recipeColors.color.text} ${recipeColors.color.border}`}
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recipe">{t("view.recipe")}</TabsTrigger>
            <TabsTrigger value="notes">{t("view.notes")}</TabsTrigger>
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
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${recipeColors.calories.bg}`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Flame className={`h-3 w-3 ${recipeColors.calories.text}`} />
                      <span className={`text-xs ${recipeColors.calories.text}`}>
                        {t("view.calories")}
                      </span>
                    </div>
                    <span className="font-semibold text-sm">
                      {recipe.calories !== undefined && recipe.calories > 0 ? recipe.calories : "-"}
                    </span>
                  </div>
                  {/* Белки */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${recipeColors.protein.bg}`}
                  >
                    <span className={`text-xs ${recipeColors.protein.text} mb-1`}>
                      {t("view.protein")}
                    </span>
                    <span className="font-semibold text-sm">
                      {recipe.protein !== undefined && recipe.protein > 0
                        ? `${recipe.protein}${tCommon("unit.g")}`
                        : "-"}
                    </span>
                  </div>
                  {/* Жиры */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${recipeColors.fat.bg}`}
                  >
                    <span className={`text-xs ${recipeColors.fat.text} mb-1`}>{t("view.fat")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.fat !== undefined && recipe.fat > 0
                        ? `${recipe.fat}${tCommon("unit.g")}`
                        : "-"}
                    </span>
                  </div>
                  {/* Углеводы */}
                  <div
                    className={`flex flex-col items-center justify-center p-2 rounded-lg ${recipeColors.carbs.bg}`}
                  >
                    <span className={`text-xs ${recipeColors.carbs.text} mb-1`}>
                      {t("view.carbs")}
                    </span>
                    <span className="font-semibold text-sm">
                      {recipe.carbs !== undefined && recipe.carbs > 0
                        ? `${recipe.carbs}${tCommon("unit.g")}`
                        : "-"}
                    </span>
                  </div>
                </div>
                {/* Вторая строка: Сахар и Клетчатка */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Сахар */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg ${recipeColors.sugar.bg}`}
                  >
                    <span className={`text-sm ${recipeColors.sugar.text}`}>{t("view.sugar")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.sugar !== undefined && recipe.sugar > 0
                        ? `${recipe.sugar}${tCommon("unit.g")}`
                        : "-"}
                    </span>
                  </div>
                  {/* Клетчатка */}
                  <div
                    className={`flex items-center justify-between p-2 rounded-lg ${recipeColors.fiber.bg}`}
                  >
                    <span className={`text-sm ${recipeColors.fiber.text}`}>{t("view.fiber")}</span>
                    <span className="font-semibold text-sm">
                      {recipe.fiber !== undefined && recipe.fiber > 0
                        ? `${recipe.fiber}${tCommon("unit.g")}`
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка личных заметок */}
          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("view.notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                {recipe.personal_notes ? (
                  <p className="text-sm whitespace-pre-wrap">{recipe.personal_notes}</p>
                ) : (
                  <p className="text-muted-foreground">{t("view.noNotes")}</p>
                )}
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
                              className={`text-xs ${recipeColors.cookingMethod.bg} ${recipeColors.cookingMethod.text} ${recipeColors.cookingMethod.border}`}
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
                                  ? recipeColors.spicy.active
                                  : recipeColors.spicy.inactive
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
                            className={`text-xs ${recipeColors.dietary.bg} ${recipeColors.dietary.text} ${recipeColors.dietary.border}`}
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
                          ? recipeColors.alcoholic.yes
                          : recipeColors.alcoholic.no
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
                        className={`${recipeColors.baseSpirit.bg} ${recipeColors.baseSpirit.text} ${recipeColors.baseSpirit.border}`}
                      >
                        {recipe.cocktail_metadata.base_spirit}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.cocktail_method && (
                      <Badge
                        variant="outline"
                        className={`${recipeColors.cocktailMethod.bg} ${recipeColors.cocktailMethod.text} ${recipeColors.cocktailMethod.border}`}
                      >
                        {t(
                          `view.methods.${recipe.cocktail_metadata.cocktail_method.toLowerCase()}`
                        ) || recipe.cocktail_metadata.cocktail_method}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.glass_type && (
                      <Badge
                        variant="outline"
                        className={`${recipeColors.glassType.bg} ${recipeColors.glassType.text} ${recipeColors.glassType.border}`}
                      >
                        {t(
                          `view.glassTypes.${recipe.cocktail_metadata.glass_type.toLowerCase()}`
                        ) || recipe.cocktail_metadata.glass_type}
                      </Badge>
                    )}
                    {recipe.cocktail_metadata.ice_type && (
                      <Badge
                        variant="outline"
                        className={`${recipeColors.iceType.bg} ${recipeColors.iceType.text} ${recipeColors.iceType.border}`}
                      >
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
                              className={`text-xs ${recipeColors.garnish.bg} ${recipeColors.garnish.text} ${recipeColors.garnish.border}`}
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
                            className={`text-xs ${recipeColors.tools.bg} ${recipeColors.tools.text} ${recipeColors.tools.border}`}
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
        <div className="flex gap-2">
          <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Link href="/recipes" className="sm:w-[160px] w-[44px]">
            <Button variant="outline" className="w-full hover:!bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{tCommon("back")}</span>
            </Button>
          </Link>
          <Link href={`/recipes/${id}/edit`} className="w-[160px]">
            <Button
              variant="outline"
              size="icon"
              className="w-[160px] h-[44px] hover:!bg-primary/10"
            >
              <Pencil className="h-4 w-4" />
              <span className="ml-2">{t("common.edit")}</span>
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
              <DeleteConfirmActions
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
