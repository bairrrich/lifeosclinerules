"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { ChefHat, Plus, Search, Star, Clock, Flame, Coffee, Martini, Users } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import type { RecipeContentExtended, RecipeIngredientItem, RecipeStep } from "@/types"
import { RecipeType } from "@/types"
import { recipeColors } from "@/lib/theme-colors"
import { cn } from "@/lib/utils"

// Типы фильтров - label будет получен через t()
const recipeTypeFilters: {
  value: RecipeType | "all"
  icon: typeof ChefHat | typeof Search | null
}[] = [
  { value: "all", icon: Search },
  { value: RecipeType.FOOD, icon: ChefHat },
  { value: RecipeType.DRINK, icon: Coffee },
  { value: RecipeType.COCKTAIL, icon: Martini },
]

interface RecipeWithDetails extends RecipeContentExtended {
  ingredientsList?: RecipeIngredientItem[]
  stepsList?: RecipeStep[]
}

export default function RecipesPage() {
  const t = useTranslations("recipes")
  const [isLoading, setIsLoading] = useState(true)
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<RecipeType | "all">("all")

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        // Загружаем рецепты из content
        const allContent = await db.content.toArray()
        const recipesOnly = allContent.filter((c) => c.type === "recipe") as RecipeContentExtended[]

        // Загружаем ингредиенты и шаги для каждого рецепта
        const recipesWithDetails: RecipeWithDetails[] = await Promise.all(
          recipesOnly.map(async (recipe) => {
            const ingredients = await db.recipeIngredientItems
              .where("recipe_id")
              .equals(recipe.id)
              .sortBy("order")

            const steps = await db.recipeSteps.where("recipe_id").equals(recipe.id).sortBy("order")

            return {
              ...recipe,
              ingredientsList: ingredients,
              stepsList: steps,
            }
          })
        )

        setRecipes(recipesWithDetails)
      } catch (error) {
        console.error("Failed to load recipes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Фильтрация
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = activeType === "all" || recipe.recipe_type === activeType

    return matchesSearch && matchesType
  })

  // Статистика
  const stats = {
    total: recipes.length,
    food: recipes.filter((r) => r.recipe_type === RecipeType.FOOD).length,
    drink: recipes.filter((r) => r.recipe_type === RecipeType.DRINK).length,
    cocktail: recipes.filter((r) => r.recipe_type === RecipeType.COCKTAIL).length,
  }

  // Иконка по типу
  const getTypeIcon = (type: RecipeType) => {
    switch (type) {
      case RecipeType.FOOD:
        return ChefHat
      case RecipeType.DRINK:
        return Coffee
      case RecipeType.COCKTAIL:
        return Martini
      default:
        return ChefHat
    }
  }

  const getTypeColor = (type: RecipeType) => {
    switch (type) {
      case RecipeType.FOOD:
        return recipeColors.food.light
      case RecipeType.DRINK:
        return recipeColors.drink.light
      case RecipeType.COCKTAIL:
        return recipeColors.cocktail.light
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const getTabsTriggerColor = (type: RecipeType | "all") => {
    switch (type) {
      case "all":
        return ""
      case RecipeType.FOOD:
        return "data-[state=active]:bg-[oklch(0.76_0.28_68)] data-[state=active]:text-white"
      case RecipeType.DRINK:
        return "data-[state=active]:bg-[oklch(0.70_0.30_208)] data-[state=active]:text-white"
      case RecipeType.COCKTAIL:
        return "data-[state=active]:bg-[oklch(0.68_0.32_38)] data-[state=active]:text-white"
      default:
        return ""
    }
  }

  return (
    <AppLayout title={t("list.title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">{t("list.stats.total")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${recipeColors.food.text}`}>{stats.food}</div>
            <div className="text-xs text-muted-foreground">{t("list.stats.food")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${recipeColors.drink.text}`}>{stats.drink}</div>
            <div className="text-xs text-muted-foreground">{t("list.stats.drink")}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className={`text-2xl font-bold ${recipeColors.cocktail.text}`}>
              {stats.cocktail}
            </div>
            <div className="text-xs text-muted-foreground">{t("list.stats.cocktail")}</div>
          </Card>
        </div>

        {/* Фильтры по типу */}
        <Tabs
          value={activeType}
          onValueChange={(value) => setActiveType(value as RecipeType | "all")}
          aria-label={t("list.filters.all")}
        >
          <TabsList
            className="grid grid-cols-4 w-full h-auto"
            role="tablist"
            aria-label={t("list.filters.all")}
          >
            {recipeTypeFilters.map((filter) => {
              const Icon = filter.icon
              return (
                <TabsTrigger
                  key={filter.value}
                  value={filter.value}
                  className={cn(
                    "text-xs sm:text-sm px-2 sm:px-4 py-2",
                    getTabsTriggerColor(filter.value)
                  )}
                  role="tab"
                  aria-selected={activeType === filter.value}
                  aria-controls={`panel-${filter.value}`}
                  id={`tab-${filter.value}`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only sm:ml-1">
                    {t(`list.filters.${filter.value}`)}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("list.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список рецептов */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("list.loading")}
            </CardContent>
          </Card>
        ) : filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {recipes.length === 0 ? t("list.empty.noRecipes") : t("list.empty.noResults")}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredRecipes.map((recipe) => {
              const TypeIcon = getTypeIcon(recipe.recipe_type || "food")
              const typeColor = getTypeColor(recipe.recipe_type || "food")

              return (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.id}`}
                  aria-label={`${t("list.title")}: ${recipe.title}`}
                >
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Иконка типа */}
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${typeColor}`}
                          aria-hidden="true"
                        >
                          <TypeIcon className="h-6 w-6" />
                        </div>

                        {/* Контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium truncate">{recipe.title}</h3>
                              {recipe.description && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {recipe.description}
                                </p>
                              )}
                            </div>
                            {recipe.rating && (
                              <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                                <Star
                                  className={`h-4 w-4 ${recipeColors.rating.fill} ${recipeColors.rating.DEFAULT}`}
                                />
                                <span className="text-sm">{recipe.rating}</span>
                              </div>
                            )}
                          </div>

                          {/* Мета информация */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {recipe.total_time_min && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {recipe.total_time_min} {t("list.minutes")}
                                </span>
                              </div>
                            )}
                            {recipe.calories && (
                              <div className="flex items-center gap-1">
                                <Flame className="h-3 w-3" />
                                <span>
                                  {recipe.calories} {t("list.calories")}
                                </span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>
                                  {recipe.servings} {t("list.servings")}
                                </span>
                              </div>
                            )}
                            {recipe.ingredientsList && (
                              <span>
                                {recipe.ingredientsList.length} {t("list.ingredients")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
