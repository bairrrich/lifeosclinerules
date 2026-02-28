"use client"

import { useState, useEffect } from "react"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { ChevronDown, Search, ChefHat, Package, Edit3 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxSelect } from "./combobox-select"
import { useTranslations } from "next-intl"
import { db, getAllEntities } from "@/lib/db"
import type { Content, Item, RecipeContentExtended } from "@/types"
import { ContentType, ItemType } from "@/types"

// ============================================
// Схема валидации
// ============================================

const baseLogSchema = z.object({
  date: z.string().min(1, "Date required"),
  time: z.string().min(1, "Time required"),
  title: z.string().optional(),
  category_id: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

const foodSchema = baseLogSchema.extend({
  calories: z.number().optional(),
  protein: z.number().optional(),
  fat: z.number().optional(),
  carbs: z.number().optional(),
})

export type FoodFormData = z.infer<typeof foodSchema>

// ============================================
// Константы
// ============================================

// Функции для получения локализованных конфигураций
export function getFoodSourceTypes(t: any) {
  return [
    { value: "custom", label: t("food.sourceTypes.custom"), icon: Edit3 },
    { value: "recipe", label: t("food.sourceTypes.recipe"), icon: ChefHat },
    { value: "product", label: t("food.sourceTypes.product"), icon: Package },
  ]
}

// Интерфейс для данных продукта
interface ProductNutrition {
  variants: string[]
  calories: number
  protein: number
  fat: number
  carbs: number
}

// Функция для получения продуктов по категориям с КБЖУ (на 100г)
export function getFoodProducts(t: any): Record<string, Record<string, ProductNutrition>> {
  return {
    [t("food.productCategories.dairy")]: {
      [t("food.products.dairy.milk32")]: {
        variants: [],
        calories: 61,
        protein: 3,
        fat: 3.2,
        carbs: 4.7,
      },
      [t("food.products.dairy.milk25")]: {
        variants: [],
        calories: 52,
        protein: 2.8,
        fat: 2.5,
        carbs: 4.7,
      },
      [t("food.products.dairy.milk15")]: {
        variants: [],
        calories: 44,
        protein: 2.8,
        fat: 1.5,
        carbs: 4.7,
      },
      [t("food.products.dairy.hardCheese")]: {
        variants: [],
        calories: 352,
        protein: 26,
        fat: 28,
        carbs: 0.1,
      },
      [t("food.products.dairy.softCheese")]: {
        variants: [],
        calories: 300,
        protein: 20,
        fat: 24,
        carbs: 0.5,
      },
      [t("food.products.dairy.cottageCheese0")]: {
        variants: [],
        calories: 71,
        protein: 16.5,
        fat: 0,
        carbs: 1.3,
      },
      [t("food.products.dairy.cottageCheese5")]: {
        variants: [],
        calories: 121,
        protein: 17,
        fat: 5,
        carbs: 1.8,
      },
      [t("food.products.dairy.cottageCheese9")]: {
        variants: [],
        calories: 159,
        protein: 16.7,
        fat: 9,
        carbs: 2,
      },
      [t("food.products.dairy.sourCream15")]: {
        variants: [],
        calories: 158,
        protein: 2.7,
        fat: 15,
        carbs: 3.2,
      },
      [t("food.products.dairy.sourCream20")]: {
        variants: [],
        calories: 204,
        protein: 2.5,
        fat: 20,
        carbs: 3.4,
      },
      [t("food.products.dairy.kefir25")]: {
        variants: [],
        calories: 54,
        protein: 3,
        fat: 2.5,
        carbs: 4,
      },
      [t("food.products.dairy.kefir32")]: {
        variants: [],
        calories: 59,
        protein: 3.2,
        fat: 3.2,
        carbs: 4.1,
      },
      [t("food.products.dairy.naturalYogurt")]: {
        variants: [],
        calories: 66,
        protein: 4,
        fat: 3.5,
        carbs: 4.7,
      },
      [t("food.products.dairy.greekYogurt")]: {
        variants: [],
        calories: 97,
        protein: 8,
        fat: 5,
        carbs: 3.5,
      },
      [t("food.products.dairy.butter825")]: {
        variants: [],
        calories: 748,
        protein: 0.6,
        fat: 82.5,
        carbs: 0.8,
      },
    },
    [t("food.productCategories.meat")]: {
      [t("food.products.meat.beefFillet")]: {
        variants: [],
        calories: 170,
        protein: 20,
        fat: 9,
        carbs: 0,
      },
      [t("food.products.meat.beefBrisket")]: {
        variants: [],
        calories: 217,
        protein: 18,
        fat: 16,
        carbs: 0,
      },
      [t("food.products.meat.beefMince")]: {
        variants: [],
        calories: 254,
        protein: 17,
        fat: 20,
        carbs: 0,
      },
      [t("food.products.meat.porkNeck")]: {
        variants: [],
        calories: 269,
        protein: 16,
        fat: 22,
        carbs: 0,
      },
      [t("food.products.meat.porkLoin")]: {
        variants: [],
        calories: 242,
        protein: 17,
        fat: 18,
        carbs: 0,
      },
      [t("food.products.meat.chickenBreast")]: {
        variants: [],
        calories: 113,
        protein: 23,
        fat: 1,
        carbs: 0,
      },
      [t("food.products.meat.chickenThigh")]: {
        variants: [],
        calories: 185,
        protein: 19,
        fat: 11,
        carbs: 0,
      },
      [t("food.products.meat.chickenMince")]: {
        variants: [],
        calories: 143,
        protein: 17,
        fat: 8,
        carbs: 0,
      },
      [t("food.products.meat.turkeyBreast")]: {
        variants: [],
        calories: 84,
        protein: 19,
        fat: 0.5,
        carbs: 0,
      },
      [t("food.products.meat.turkeyThigh")]: {
        variants: [],
        calories: 142,
        protein: 18,
        fat: 7,
        carbs: 0,
      },
    },
    [t("food.productCategories.fish")]: {
      [t("food.products.fish.troutFresh")]: {
        variants: [],
        calories: 97,
        protein: 19,
        fat: 2,
        carbs: 0,
      },
      [t("food.products.fish.troutLightlySalted")]: {
        variants: [],
        calories: 186,
        protein: 20,
        fat: 11,
        carbs: 0,
      },
      [t("food.products.fish.salmonFresh")]: {
        variants: [],
        calories: 142,
        protein: 20,
        fat: 6,
        carbs: 0,
      },
      [t("food.products.fish.salmonLightlySalted")]: {
        variants: [],
        calories: 201,
        protein: 20,
        fat: 13,
        carbs: 0,
      },
      [t("food.products.fish.codFresh")]: {
        variants: [],
        calories: 78,
        protein: 17,
        fat: 0.7,
        carbs: 0,
      },
      [t("food.products.fish.herringSalted")]: {
        variants: [],
        calories: 145,
        protein: 17,
        fat: 8,
        carbs: 0,
      },
      [t("food.products.fish.mackerelFresh")]: {
        variants: [],
        calories: 191,
        protein: 18,
        fat: 13,
        carbs: 0,
      },
      [t("food.products.fish.mackerelSmoked")]: {
        variants: [],
        calories: 317,
        protein: 23,
        fat: 24,
        carbs: 0,
      },
      [t("food.products.fish.tunaCanned")]: {
        variants: [],
        calories: 116,
        protein: 23,
        fat: 1,
        carbs: 0,
      },
    },
    [t("food.productCategories.vegetables")]: {
      [t("food.products.vegetables.potato")]: {
        variants: [],
        calories: 77,
        protein: 2,
        fat: 0.4,
        carbs: 17,
      },
      [t("food.products.vegetables.carrot")]: {
        variants: [],
        calories: 32,
        protein: 1.3,
        fat: 0.1,
        carbs: 7,
      },
      [t("food.products.vegetables.onion")]: {
        variants: [],
        calories: 40,
        protein: 1.4,
        fat: 0.2,
        carbs: 9,
      },
      [t("food.products.vegetables.cucumber")]: {
        variants: [],
        calories: 15,
        protein: 0.8,
        fat: 0.1,
        carbs: 3,
      },
      [t("food.products.vegetables.tomato")]: {
        variants: [],
        calories: 18,
        protein: 0.9,
        fat: 0.2,
        carbs: 4,
      },
      [t("food.products.vegetables.whiteCabbage")]: {
        variants: [],
        calories: 28,
        protein: 1.8,
        fat: 0.1,
        carbs: 5,
      },
      [t("food.products.vegetables.pepper")]: {
        variants: [],
        calories: 27,
        protein: 1.3,
        fat: 0.1,
        carbs: 5,
      },
      [t("food.products.vegetables.garlic")]: {
        variants: [],
        calories: 149,
        protein: 6.5,
        fat: 0.5,
        carbs: 30,
      },
      [t("food.products.vegetables.zucchini")]: {
        variants: [],
        calories: 24,
        protein: 0.6,
        fat: 0.3,
        carbs: 5,
      },
      [t("food.products.vegetables.eggplant")]: {
        variants: [],
        calories: 25,
        protein: 1.2,
        fat: 0.1,
        carbs: 6,
      },
      [t("food.products.vegetables.beet")]: {
        variants: [],
        calories: 43,
        protein: 1.6,
        fat: 0.2,
        carbs: 9,
      },
    },
    [t("food.productCategories.fruits")]: {
      [t("food.products.fruits.apple")]: {
        variants: [],
        calories: 47,
        protein: 0.4,
        fat: 0.4,
        carbs: 10,
      },
      [t("food.products.fruits.banana")]: {
        variants: [],
        calories: 89,
        protein: 1.1,
        fat: 0.3,
        carbs: 23,
      },
      [t("food.products.fruits.orange")]: {
        variants: [],
        calories: 43,
        protein: 0.9,
        fat: 0.2,
        carbs: 9,
      },
      [t("food.products.fruits.tangerine")]: {
        variants: [],
        calories: 38,
        protein: 0.8,
        fat: 0.2,
        carbs: 8,
      },
      [t("food.products.fruits.pear")]: {
        variants: [],
        calories: 42,
        protein: 0.4,
        fat: 0.3,
        carbs: 11,
      },
      [t("food.products.fruits.kiwi")]: {
        variants: [],
        calories: 61,
        protein: 1.1,
        fat: 0.5,
        carbs: 14,
      },
      [t("food.products.fruits.grape")]: {
        variants: [],
        calories: 65,
        protein: 0.6,
        fat: 0.2,
        carbs: 16,
      },
      [t("food.products.fruits.pineapple")]: {
        variants: [],
        calories: 50,
        protein: 0.5,
        fat: 0.1,
        carbs: 12,
      },
    },
    [t("food.productCategories.berries")]: {
      [t("food.products.berries.strawberry")]: {
        variants: [],
        calories: 32,
        protein: 0.8,
        fat: 0.3,
        carbs: 7,
      },
      [t("food.products.berries.raspberry")]: {
        variants: [],
        calories: 46,
        protein: 0.8,
        fat: 0.5,
        carbs: 9,
      },
      [t("food.products.berries.blueberry")]: {
        variants: [],
        calories: 44,
        protein: 1.1,
        fat: 0.3,
        carbs: 10,
      },
      [t("food.products.berries.blackcurrant")]: {
        variants: [],
        calories: 44,
        protein: 1,
        fat: 0.2,
        carbs: 8,
      },
      [t("food.products.berries.cherry")]: {
        variants: [],
        calories: 52,
        protein: 0.8,
        fat: 0.2,
        carbs: 11,
      },
      [t("food.products.berries.cranberry")]: {
        variants: [],
        calories: 43,
        protein: 0.7,
        fat: 0.5,
        carbs: 9,
      },
    },
    [t("food.productCategories.grainsAndLegumes")]: {
      [t("food.products.grains.riceWhiteDry")]: {
        variants: [],
        calories: 344,
        protein: 6.7,
        fat: 0.7,
        carbs: 78,
      },
      [t("food.products.grains.riceBrownDry")]: {
        variants: [],
        calories: 337,
        protein: 7.4,
        fat: 2.2,
        carbs: 72,
      },
      [t("food.products.grains.buckwheatDry")]: {
        variants: [],
        calories: 313,
        protein: 12.6,
        fat: 3.3,
        carbs: 62,
      },
      [t("food.products.grains.oatmealDry")]: {
        variants: [],
        calories: 342,
        protein: 12,
        fat: 6,
        carbs: 60,
      },
      [t("food.products.grains.semolinaDry")]: {
        variants: [],
        calories: 333,
        protein: 10,
        fat: 1,
        carbs: 72,
      },
      [t("food.products.grains.milletDry")]: {
        variants: [],
        calories: 324,
        protein: 11,
        fat: 3,
        carbs: 66,
      },
      [t("food.products.grains.lentilsDry")]: {
        variants: [],
        calories: 284,
        protein: 24,
        fat: 1.5,
        carbs: 46,
      },
      [t("food.products.grains.beansDry")]: {
        variants: [],
        calories: 285,
        protein: 21,
        fat: 1.5,
        carbs: 47,
      },
      [t("food.products.grains.peasDry")]: {
        variants: [],
        calories: 298,
        protein: 20,
        fat: 2,
        carbs: 49,
      },
    },
    [t("food.productCategories.breadAndBakery")]: {
      [t("food.products.bakery.whiteBread")]: {
        variants: [],
        calories: 242,
        protein: 7,
        fat: 1,
        carbs: 49,
      },
      [t("food.products.bakery.blackBread")]: {
        variants: [],
        calories: 201,
        protein: 6.6,
        fat: 1.4,
        carbs: 41,
      },
      [t("food.products.bakery.slicedLoaf")]: {
        variants: [],
        calories: 262,
        protein: 7.5,
        fat: 2.9,
        carbs: 51,
      },
      [t("food.products.bakery.borodinskyBread")]: {
        variants: [],
        calories: 201,
        protein: 6.8,
        fat: 1.3,
        carbs: 41,
      },
      [t("food.products.bakery.armenianLavash")]: {
        variants: [],
        calories: 236,
        protein: 7.9,
        fat: 1,
        carbs: 48,
      },
    },
    [t("food.productCategories.eggs")]: {
      [t("food.products.eggs.chickenEggOnePiece")]: {
        variants: [],
        calories: 155,
        protein: 13,
        fat: 11,
        carbs: 1.1,
      },
      [t("food.products.eggs.eggWhite")]: {
        variants: [],
        calories: 52,
        protein: 11,
        fat: 0.2,
        carbs: 0.7,
      },
      [t("food.products.eggs.eggYolk")]: {
        variants: [],
        calories: 352,
        protein: 16,
        fat: 31,
        carbs: 1,
      },
    },
    [t("food.productCategories.nutsAndSeeds")]: {
      [t("food.products.nuts.walnut")]: {
        variants: [],
        calories: 656,
        protein: 16,
        fat: 61,
        carbs: 11,
      },
      [t("food.products.nuts.almond")]: {
        variants: [],
        calories: 645,
        protein: 18,
        fat: 58,
        carbs: 13,
      },
      [t("food.products.nuts.hazelnut")]: {
        variants: [],
        calories: 679,
        protein: 15,
        fat: 65,
        carbs: 10,
      },
      [t("food.products.nuts.cashew")]: {
        variants: [],
        calories: 600,
        protein: 18,
        fat: 49,
        carbs: 22,
      },
      [t("food.products.nuts.peanut")]: {
        variants: [],
        calories: 567,
        protein: 26,
        fat: 49,
        carbs: 16,
      },
      [t("food.products.nuts.sunflowerSeeds")]: {
        variants: [],
        calories: 578,
        protein: 21,
        fat: 53,
        carbs: 17,
      },
    },
    [t("food.productCategories.oilsAndFats")]: {
      [t("food.products.fats.sunflowerOil")]: {
        variants: [],
        calories: 899,
        protein: 0,
        fat: 9.9,
        carbs: 0,
      },
      [t("food.products.fats.oliveOil")]: {
        variants: [],
        calories: 898,
        protein: 0,
        fat: 99.8,
        carbs: 0,
      },
      [t("food.products.fats.coconutOil")]: {
        variants: [],
        calories: 899,
        protein: 0,
        fat: 99.9,
        carbs: 0,
      },
      [t("food.products.fats.mayonnaise")]: {
        variants: [],
        calories: 680,
        protein: 1,
        fat: 75,
        carbs: 1.5,
      },
    },
    [t("food.productCategories.drinks")]: {
      [t("food.products.drinks.teaWithoutSugar")]: {
        variants: [],
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      [t("food.products.drinks.blackCoffee")]: {
        variants: [],
        calories: 2,
        protein: 0.2,
        fat: 0,
        carbs: 0.3,
      },
      [t("food.products.drinks.orangeJuice")]: {
        variants: [],
        calories: 45,
        protein: 0.7,
        fat: 0.2,
        carbs: 10,
      },
      [t("food.products.drinks.appleJuice")]: {
        variants: [],
        calories: 46,
        protein: 0.1,
        fat: 0.1,
        carbs: 11,
      },
      [t("food.products.drinks.tomatoJuice")]: {
        variants: [],
        calories: 17,
        protein: 1,
        fat: 0,
        carbs: 4,
      },
      [t("food.products.drinks.compote")]: {
        variants: [],
        calories: 60,
        protein: 0.2,
        fat: 0,
        carbs: 15,
      },
    },
    [t("food.productCategories.sweets")]: {
      [t("food.products.sweets.sugar")]: {
        variants: [],
        calories: 387,
        protein: 0,
        fat: 0,
        carbs: 100,
      },
      [t("food.products.sweets.honey")]: {
        variants: [],
        calories: 304,
        protein: 0.3,
        fat: 0,
        carbs: 82,
      },
      [t("food.products.sweets.milkChocolate")]: {
        variants: [],
        calories: 535,
        protein: 6.9,
        fat: 30,
        carbs: 59,
      },
      [t("food.products.sweets.darkChocolate")]: {
        variants: [],
        calories: 546,
        protein: 5,
        fat: 35,
        carbs: 52,
      },
      [t("food.products.sweets.cookies")]: {
        variants: [],
        calories: 452,
        protein: 7,
        fat: 18,
        carbs: 68,
      },
      [t("food.products.sweets.candy")]: {
        variants: [],
        calories: 400,
        protein: 2,
        fat: 12,
        carbs: 75,
      },
    },
    [t("food.productCategories.groceries")]: {
      [t("food.products.groceries.pastaDry")]: {
        variants: [],
        calories: 344,
        protein: 10,
        fat: 1.1,
        carbs: 72,
      },
      [t("food.products.groceries.wheatFlour")]: {
        variants: [],
        calories: 342,
        protein: 10,
        fat: 1,
        carbs: 73,
      },
      [t("food.products.groceries.ryeFlour")]: {
        variants: [],
        calories: 298,
        protein: 8,
        fat: 1.5,
        carbs: 63,
      },
      [t("food.products.groceries.starch")]: {
        variants: [],
        calories: 342,
        protein: 0.1,
        fat: 0,
        carbs: 85,
      },
    },
  }
}

// ============================================
// Интерфейсы
// ============================================

interface FoodFormProps {
  register: UseFormRegister<FoodFormData>
  watch: UseFormWatch<FoodFormData>
  setValue: UseFormSetValue<FoodFormData>
  errors: Record<string, { message?: string }>
}

// ============================================
// Компонент
// ============================================

export function FoodForm({ register, watch, setValue, errors }: FoodFormProps) {
  const t = useTranslations("logs")

  // Состояния для выбора источника
  const [sourceType, setSourceType] = useState<string>("custom")

  // Состояния для рецептов
  const [recipes, setRecipes] = useState<Content[]>([])
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("")

  // Состояния для продуктов из каталога
  const [products, setProducts] = useState<Item[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")

  // Состояния для зависимых списков продуктов
  const [productCategory, setProductCategory] = useState("")
  const [productSubcategory, setProductSubcategory] = useState("")

  // Состояния для своего варианта
  const [customTitle, setCustomTitle] = useState("")
  const [customPortionSize, setCustomPortionSize] = useState<number | undefined>()

  // Загружаем рецепты и продукты
  useEffect(() => {
    async function loadData() {
      // Загружаем рецепты
      const allContent = await getAllEntities(db.content)
      const recipeContent = allContent.filter((c) => c.type === ContentType.RECIPE)
      setRecipes(recipeContent)

      // Загружаем продукты из каталога
      const allItems = await getAllEntities(db.items)
      const productItems = allItems.filter((i) => i.type === ItemType.PRODUCT)
      setProducts(productItems)
    }
    loadData()
  }, [])

  // Получаем выбранный рецепт (приводим к RecipeContentExtended для доступа к полям КБЖУ)
  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId) as
    | RecipeContentExtended
    | undefined

  // Получаем название выбранного продукта
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  // При выборе рецепта устанавливаем КБЖУ
  useEffect(() => {
    if (sourceType === "recipe" && selectedRecipe) {
      setValue("title", selectedRecipe.title)
      // КБЖУ хранятся на верхнем уровне рецепта
      setValue("calories", selectedRecipe.calories)
      setValue("protein", selectedRecipe.protein)
      setValue("fat", selectedRecipe.fat)
      setValue("carbs", selectedRecipe.carbs)
    }
  }, [sourceType, selectedRecipeId, selectedRecipe, setValue])

  // При выборе продукта из каталога
  useEffect(() => {
    if (sourceType === "product" && selectedProduct) {
      setValue("title", selectedProduct.name)
      // Заполняем КБЖУ из каталога
      setValue("calories", selectedProduct.calories)
      setValue("protein", selectedProduct.protein)
      setValue("fat", selectedProduct.fat)
      setValue("carbs", selectedProduct.carbs)
    }
  }, [sourceType, selectedProductId, selectedProduct, setValue])

  // При своём варианте
  useEffect(() => {
    if (sourceType === "custom" && customTitle) {
      setValue("title", customTitle)
    }
  }, [sourceType, customTitle, setValue])

  // При выборе продукта из справочника (зависимые списки)
  useEffect(() => {
    if (sourceType === "product" && productCategory && productSubcategory) {
      setValue("title", productSubcategory)

      // Получаем КБЖУ из справочника
      const productData = getFoodProducts(t)[productCategory]?.[productSubcategory]
      if (productData) {
        setValue("calories", productData.calories)
        setValue("protein", productData.protein)
        setValue("fat", productData.fat)
        setValue("carbs", productData.carbs)
      }
    }
  }, [sourceType, productCategory, productSubcategory, setValue])

  // Получаем подкатегории для категории
  const currentSubcategories = productCategory
    ? Object.keys(getFoodProducts(t)[productCategory] || {})
    : []

  return (
    <>
      {/* Выбор источника */}
      <div className="space-y-2">
        <Label>{t("food.source")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {getFoodSourceTypes(t).map((source) => {
            const Icon = source.icon
            return (
              <button
                key={source.value}
                type="button"
                onClick={() => {
                  setSourceType(source.value)
                  // Сбрасываем все поля при смене источника
                  setSelectedRecipeId("")
                  setSelectedProductId("")
                  setProductCategory("")
                  setProductSubcategory("")
                  setCustomTitle("")
                  setCustomPortionSize(undefined)
                  setValue("title", "")
                  setValue("calories", undefined)
                  setValue("protein", undefined)
                  setValue("fat", undefined)
                  setValue("carbs", undefined)
                }}
                className={`flex flex-col items-center gap-2 px-3 py-3 text-sm rounded-xl border transition-colors ${
                  sourceType === source.value
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-background hover:bg-accent"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t(`food.sourceTypes.${source.value}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Свой вариант */}
      {sourceType === "custom" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customTitle">{t("food.dishName")} *</Label>
            <Input
              id="customTitle"
              placeholder={t("food.dishName")}
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPortion">{t("food.portionSize")}</Label>
            <Input
              id="customPortion"
              type="number"
              placeholder={t("common.grams")}
              value={customPortionSize ?? ""}
              onChange={(e) =>
                setCustomPortionSize(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      )}

      {/* Выбор из рецептов */}
      {sourceType === "recipe" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("food.selectRecipe")}</Label>
            {recipes.length > 0 ? (
              <div className="relative">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  style={{
                    backgroundImage: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                    appearance: "none",
                  }}
                >
                  <option value="" disabled>
                    {t("food.selectRecipe")}
                  </option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-4 text-center text-muted-foreground">
                <ChefHat className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("food.noRecipes")}</p>
                <p className="text-xs mt-1">{t("food.addRecipeToContent")}</p>
              </div>
            )}
          </div>

          {selectedRecipe && (
            <Card className="bg-accent/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("food.calories")}</p>
                    <p className="font-medium">{selectedRecipe.calories || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("food.protein")}</p>
                    <p className="font-medium">{selectedRecipe.protein || 0}г</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("food.fat")}</p>
                    <p className="font-medium">{selectedRecipe.fat || 0}г</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("food.carbs")}</p>
                    <p className="font-medium">{selectedRecipe.carbs || 0}г</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Выбор из продуктов */}
      {sourceType === "product" && (
        <div className="space-y-4">
          {/* Сначала проверяем есть ли продукты в каталоге */}
          {products.length > 0 ? (
            <>
              <div className="space-y-2">
                <Label>{t("food.selectProduct")}</Label>
                <div className="relative">
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    style={{
                      backgroundImage: "none",
                      WebkitAppearance: "none",
                      MozAppearance: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="" disabled>
                      {t("food.selectProduct")}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                </div>
              </div>

              {selectedProduct && (selectedProduct.calories || selectedProduct.protein) && (
                <Card className="bg-accent/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("food.calories")}</p>
                        <p className="font-medium">{selectedProduct.calories || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.protein")}</p>
                        <p className="font-medium">{selectedProduct.protein || 0}г</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.fat")}</p>
                        <p className="font-medium">{selectedProduct.fat || 0}г</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.carbs")}</p>
                        <p className="font-medium">{selectedProduct.carbs || 0}г</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            /* Если нет продуктов в каталоге, показываем справочник */
            <>
              <ComboboxSelect
                label={t("food.productCategory")}
                options={Object.keys(getFoodProducts(t))}
                value={productCategory}
                onChange={(value) => {
                  setProductCategory(value)
                  setProductSubcategory("")
                }}
                placeholder={t("food.productCategory")}
              />

              {productCategory && (
                <ComboboxSelect
                  label={t("food.product")}
                  options={currentSubcategories}
                  value={productSubcategory}
                  onChange={setProductSubcategory}
                  placeholder={t("food.product")}
                />
              )}

              {productCategory && productSubcategory && (
                <Card className="bg-accent/50">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="text-muted-foreground">{t("food.calories")}</p>
                        <p className="font-medium">
                          {getFoodProducts(t)[productCategory]?.[productSubcategory]?.calories || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.protein")}</p>
                        <p className="font-medium">
                          {getFoodProducts(t)[productCategory]?.[productSubcategory]?.protein || 0}г
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.fat")}</p>
                        <p className="font-medium">
                          {getFoodProducts(t)[productCategory]?.[productSubcategory]?.fat || 0}г
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{t("food.carbs")}</p>
                        <p className="font-medium">
                          {getFoodProducts(t)[productCategory]?.[productSubcategory]?.carbs || 0}г
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* КБЖУ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("recipes.nutrition.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-xs">
                {t("recipes.nutrition.calories")}
              </Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                {...register("calories", { valueAsNumber: true })}
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
                placeholder="0"
                {...register("protein", { valueAsNumber: true })}
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
                placeholder="0"
                {...register("fat", { valueAsNumber: true })}
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
                placeholder="0"
                {...register("carbs", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
