"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ChefHat, Plus, Search, Star, Clock, Flame, 
  Coffee, Martini, Users
} from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import { recipeTypeLabels, recipeTypeColors } from "@/components/recipes"
import type { RecipeContentExtended, RecipeIngredientItem, RecipeStep } from "@/types"
import { RecipeType } from "@/types"

// Типы фильтров
const recipeTypeFilters: { value: RecipeType | "all"; label: string; icon: typeof ChefHat }[] = [
  { value: "all", label: "Все", icon: ChefHat },
  { value: RecipeType.FOOD, label: "Еда", icon: ChefHat },
  { value: RecipeType.DRINK, label: "Напитки", icon: Coffee },
  { value: RecipeType.COCKTAIL, label: "Коктейли", icon: Martini },
]

interface RecipeWithDetails extends RecipeContentExtended {
  ingredientsList?: RecipeIngredientItem[]
  stepsList?: RecipeStep[]
}

export default function RecipesPage() {
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
            
            const steps = await db.recipeSteps
              .where("recipe_id")
              .equals(recipe.id)
              .sortBy("order")
            
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
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      case RecipeType.FOOD: return ChefHat
      case RecipeType.DRINK: return Coffee
      case RecipeType.COCKTAIL: return Martini
      default: return ChefHat
    }
  }

  const getTypeColor = (type: RecipeType) => {
    switch (type) {
      case RecipeType.FOOD: return "bg-orange-500/10 text-orange-500"
      case RecipeType.DRINK: return "bg-blue-500/10 text-blue-500"
      case RecipeType.COCKTAIL: return "bg-purple-500/10 text-purple-500"
      default: return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <AppLayout title="Рецепты">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.food}</div>
            <div className="text-xs text-muted-foreground">Еда</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.drink}</div>
            <div className="text-xs text-muted-foreground">Напитки</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.cocktail}</div>
            <div className="text-xs text-muted-foreground">Коктейли</div>
          </Card>
        </div>

        {/* Фильтры по типу */}
        <Tabs
          value={activeType}
          onValueChange={(value) => setActiveType(value as RecipeType | "all")}
        >
          <TabsList className="grid grid-cols-4 w-full h-auto">
            {recipeTypeFilters.map((filter) => (
              <TabsTrigger key={filter.value} value={filter.value} className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                <filter.icon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden text-[10px]">{filter.label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список рецептов */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        ) : filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {recipes.length === 0
                ? "Нет рецептов. Добавьте первый!"
                : "Рецепты не найдены"}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredRecipes.map((recipe) => {
              const TypeIcon = getTypeIcon(recipe.recipe_type || "food")
              const typeColor = getTypeColor(recipe.recipe_type || "food")
              
              return (
                <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Иконка типа */}
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${typeColor}`}>
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
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm">{recipe.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Мета информация */}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            {recipe.total_time_min && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{recipe.total_time_min} мин</span>
                              </div>
                            )}
                            {recipe.calories && (
                              <div className="flex items-center gap-1">
                                <Flame className="h-3 w-3" />
                                <span>{recipe.calories} ккал</span>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{recipe.servings} порций</span>
                              </div>
                            )}
                            {recipe.ingredientsList && (
                              <span>{recipe.ingredientsList.length} ингр.</span>
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

        {/* FAB */}
        <div className="fixed bottom-20 right-4 max-w-[960px] mx-auto left-0 right-0 pointer-events-none">
          <div className="flex justify-end">
            <Link href="/recipes/new">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg pointer-events-auto"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}