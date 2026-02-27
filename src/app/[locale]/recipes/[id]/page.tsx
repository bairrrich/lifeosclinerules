"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
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

const difficultyLabels: Record<string, string> = {
  easy: "Легко",
  medium: "Средне",
  hard: "Сложно",
  pro: "Профи",
}

export default function RecipeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const t = useTranslations("recipes")
  const locale = useLocale()

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
            {/* Время и порции */}
            <div className="grid grid-cols-3 gap-4 mt-2">
              {recipe.total_time_min && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {recipe.total_time_min} {t("fields.minutes")}
                  </span>
                </div>
              )}
              {recipe.servings && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {recipe.servings} {recipe.serving_unit || t("fields.servings")}
                  </span>
                </div>
              )}
              {recipe.difficulty && (
                <Badge variant="secondary">{t(`difficulties.${recipe.difficulty}`)}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="instructions">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">{t("forms.steps")}</TabsTrigger>
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="mt-4">
            {/* Шаги приготовления */}
            {steps.length > 0 ? (
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
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  {t("steps.noInstructions")}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("nutrition")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold flex items-center justify-center gap-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      {recipe.calories || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">{t("nutrition.calories")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{recipe.protein || "-"}</div>
                    <div className="text-xs text-muted-foreground">{t("nutrition.protein")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{recipe.fat || "-"}</div>
                    <div className="text-xs text-muted-foreground">{t("nutrition.fat")}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center mt-2">
                  <div>
                    <div className="text-lg font-semibold">{recipe.carbs || "-"}</div>
                    <div className="text-xs text-muted-foreground">{t("nutrition.carbs")}</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{recipe.sugar || "-"}</div>
                    <div className="text-xs text-muted-foreground">{t("nutrition.sugar")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Специфичные метаданные */}
            {recipe.recipe_type === "cocktail" && recipe.cocktail_metadata && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("cocktailDetails")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recipe.cocktail_metadata.base_spirit && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("cocktailDetails.base")}: </span>
                      {recipe.cocktail_metadata.base_spirit}
                    </div>
                  )}
                  {recipe.cocktail_metadata.cocktail_method && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("cocktailDetails.method")}: </span>
                      {recipe.cocktail_metadata.cocktail_method}
                    </div>
                  )}
                  {recipe.cocktail_metadata.glass_type && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("cocktailDetails.glass")}: </span>
                      {recipe.cocktail_metadata.glass_type}
                    </div>
                  )}
                  {recipe.cocktail_metadata.alcohol_percent && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {t("cocktailDetails.strength")}:{" "}
                      </span>
                      {recipe.cocktail_metadata.alcohol_percent}%
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
