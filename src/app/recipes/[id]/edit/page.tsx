"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase, getTimestamp } from "@/lib/db"
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
import type { Difficulty, FoodRecipeMetadata, DrinkRecipeMetadata, CocktailRecipeMetadata, RecipeContentExtended, RecipeIngredientItem, RecipeStep, RecipeType } from "@/types"
import { RecipeType as RecipeTypeEnum } from "@/types"

// Recipe schema
const recipeSchema = z.object({
  title: z.string().min(1, "Введите название"),
  description: z.string().optional(),
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

type RecipeFormData = z.infer<typeof recipeSchema>

export default function EditRecipePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Recipe specific state
  const [recipeType, setRecipeType] = useState<RecipeType>(RecipeTypeEnum.FOOD)
  const [ingredients, setIngredients] = useState<IngredientItem[]>([])
  const [steps, setSteps] = useState<{ id?: string; order: number; text: string; timer_min?: number }[]>([])
  const [foodMetadata, setFoodMetadata] = useState<FoodRecipeMetadata>({})
  const [drinkMetadata, setDrinkMetadata] = useState<DrinkRecipeMetadata>({ is_carbonated: false })
  const [cocktailMetadata, setCocktailMetadata] = useState<CocktailRecipeMetadata>({ is_alcoholic: true })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
  })

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const content = await db.content.get(id)
        
        if (content && content.type === "recipe") {
          const recipe = content as RecipeContentExtended
          
          // Recipe type
          setRecipeType(recipe.recipe_type || "food")
          
          // Recipe fields
          const baseData: Record<string, unknown> = {
            title: recipe.title,
            description: recipe.description || "",
            rating: recipe.rating,
            tags: recipe.tags?.join(", ") || "",
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
          }
          reset(baseData as RecipeFormData)
          
          // Load ingredients
          const recipeIngredients = await db.recipeIngredientItems
            .where("recipe_id")
            .equals(id)
            .sortBy("order")
          setIngredients(recipeIngredients.map(ing => ({
            id: ing.id,
            ingredient_name: ing.ingredient_name,
            amount: ing.amount,
            unit: ing.unit,
            optional: ing.optional,
            note: ing.note,
            order: ing.order,
          })))
          
          // Load steps
          const recipeSteps = await db.recipeSteps
            .where("recipe_id")
            .equals(id)
            .sortBy("order")
          setSteps(recipeSteps.map(s => ({
            id: s.id,
            order: s.order,
            text: s.text,
            timer_min: s.timer_min,
          })))
          
          // Load metadata
          if (recipe.food_metadata) setFoodMetadata(recipe.food_metadata)
          if (recipe.drink_metadata) setDrinkMetadata(recipe.drink_metadata)
          if (recipe.cocktail_metadata) setCocktailMetadata(recipe.cocktail_metadata)
        }
      } catch (error) {
        console.error("Failed to load recipe:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, reset])

  const onSubmit = async (data: RecipeFormData) => {
    setIsSaving(true)
    try {
      const now = getTimestamp()
      
      // Update recipe content (using type assertion for RecipeContentExtended fields)
      await db.content.update(id, {
        title: data.title,
        description: data.description,
        rating: data.rating,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        recipe_type: recipeType,
        prep_time_min: data.prep_time_min,
        cook_time_min: data.cook_time_min,
        total_time_min: (data.prep_time_min || 0) + (data.cook_time_min || 0),
        servings: data.servings,
        serving_unit: data.serving_unit,
        difficulty: data.difficulty,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        sugar: data.sugar,
        fiber: data.fiber,
        food_metadata: recipeType === "food" ? foodMetadata : undefined,
        drink_metadata: recipeType === "drink" ? drinkMetadata : undefined,
        cocktail_metadata: recipeType === "cocktail" ? cocktailMetadata : undefined,
        updated_at: now,
      } as Partial<RecipeContentExtended>)
      
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
          created_at: now,
          updated_at: now,
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
          created_at: now,
          updated_at: now,
        })
      }

      router.push(`/recipes/${id}`)
    } catch (error) {
      console.error("Failed to update recipe:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="container mx-auto px-4 py-6">
          <Card><CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent></Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Редактировать рецепт">
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Recipe Type Selector */}
          <Card>
            <CardContent className="p-4">
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
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Название *</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Название рецепта"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Краткое описание..."
                  {...register("description")}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Порции</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("servings", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Единица</label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="порции"
                    {...register("serving_unit")}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Подготовка (мин)</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("prep_time_min", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Приготовление (мин)</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("cook_time_min", { valueAsNumber: true })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Сложность</label>
                <Tabs 
                  value={watch("difficulty") as string || ""} 
                  onValueChange={(value) => setValue("difficulty", value as "easy" | "medium" | "hard" | "pro" || undefined)}
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
          <RecipeIngredients
            ingredients={ingredients}
            onChange={setIngredients}
          />

          {/* Steps */}
          <RecipeSteps
            steps={steps}
            onChange={setSteps}
          />

          {/* Nutrition */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="text-sm font-medium">Пищевая ценность</div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Ккал</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("calories", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Белки (г)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("protein", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Жиры (г)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("fat", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Углеводы (г)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("carbs", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Сахар (г)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Теги</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="теги через запятую"
                  {...register("tags")}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />Отмена
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />{isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}