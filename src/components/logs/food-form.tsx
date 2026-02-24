"use client"

import { useState, useEffect } from "react"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { ChevronDown, Search, ChefHat, Package, Edit3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxSelect } from "./combobox-select"
import { db, getAllEntities } from "@/lib/db"
import type { Content, Item, RecipeContent, RecipeMetadata } from "@/types"
import { ContentType, ItemType } from "@/types"

// ============================================
// Схема валидации
// ============================================

const baseLogSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
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

// Источники питания
export const foodSourceTypes = [
  { value: "custom", label: "Свой вариант", icon: Edit3 },
  { value: "recipe", label: "Рецепты", icon: ChefHat },
  { value: "product", label: "Продукты", icon: Package },
]

// Продукты по подкатегориям
export const foodProducts: Record<string, Record<string, string[]>> = {
  "Молочные": {
    "Молоко": ["3.2%", "2.5%", "1.5%", "Без лактозы"],
    "Сыр": ["Твёрдый", "Мягкий", "Плавленый", "Творожный"],
    "Творог": ["0%", "2%", "4%", "5%", "9%"],
    "Сметана": ["10%", "15%", "20%"],
    "Кефир": ["1%", "2.5%", "3.2%"],
    "Йогурт": ["Натуральный", "Фруктовый", "Греческий"],
    "Масло сливочное": ["72.5%", "82.5%"],
  },
  "Мясо": {
    "Говядина": ["Вырезка", "Грудинка", "Ростбиф", "Фарш"],
    "Свинина": ["Шея", "Корейка", "Окорок", "Рулька"],
    "Курица": ["Грудка", "Бедро", "Голень", "Крылья", "Фарш"],
    "Индейка": ["Грудка", "Бедро", "Фарш"],
  },
  "Рыба": {
    "Форель": ["Свежая", "Слабосолёная", "Копчёная"],
    "Лосось": ["Свежий", "Слабосолёный", "Копчёный"],
    "Треска": ["Свежая", "Замороженная"],
    "Сельдь": ["Солёная", "Маринованная"],
    "Скумбрия": ["Свежая", "Копчёная", "Консервы"],
  },
  "Овощи": {
    "Картофель": ["Молодой", "Зрелый"],
    "Морковь": ["Свежая", "Тёртая"],
    "Лук": ["Репчатый", "Красный", "Зелёный"],
    "Огурцы": ["Свежие", "Солёные", "Маринованные"],
    "Помидоры": ["Свежие", "Вяленые", "Сушёные"],
    "Капуста": ["Белокочанная", "Краснокочанная", "Пекинская"],
    "Перец": ["Болгарский", "Острый"],
  },
  "Фрукты": {
    "Яблоки": ["Зелёные", "Красные", "Жёлтые"],
    "Бананы": ["Спелые", "Зелёные"],
    "Апельсины": ["Сладкие", "Кислые"],
    "Мандарины": ["Без косточек", "С косточками"],
    "Груши": ["Твёрдые", "Мягкие"],
    "Киви": ["Зелёное", "Жёлтое"],
  },
  "Ягоды": {
    "Клубника": ["Свежая", "Замороженная"],
    "Малина": ["Свежая", "Замороженная"],
    "Черника": ["Свежая", "Замороженная"],
    "Смородина": ["Чёрная", "Красная", "Белая"],
    "Вишня": ["Свежая", "Замороженная"],
  },
  "Крупы": {
    "Рис": ["Белый", "Бурый", "Басмати", "Жасмин", "Дикий"],
    "Гречка": ["Ядрица", "Продел", "Зелёная"],
    "Овсянка": ["Геркулес", "Хлопья", "Монастырская"],
    "Манка": ["Обычная"],
    "Пшено": ["Жёлтое", "Белое"],
  },
  "Хлеб": {
    "Белый хлеб": ["Батон", "Каравай", "Нарезной"],
    "Чёрный хлеб": ["Бородинский", "Ржаной", "Дарницкий"],
    "Лаваш": ["Армянский", "Грузинский"],
    "Булочки": ["С маком", "С изюмом", "С кунжутом"],
  },
  "Напитки": {
    "Чай": ["Чёрный", "Зелёный", "Травяной", "Фруктовый"],
    "Кофе": ["Арабика", "Робуста", "Эспрессо", "Капучино"],
    "Соки": ["Апельсиновый", "Яблочный", "Томатный", "Виноградный"],
    "Вода": ["Газированная", "Негазированная", "Минеральная"],
  },
  "Бакалея": {
    "Макароны": ["Спагетти", "Пенне", "Фузилли", "Лазанья"],
    "Сахар": ["Белый", "Коричневый", "Тростниковый"],
    "Мука": ["Пшеничная", "Ржаная", "Миндальная", "Кокосовая"],
    "Масло растительное": ["Подсолнечное", "Оливковое", "Кокосовое"],
  },
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

export function FoodForm({
  register,
  watch,
  setValue,
  errors,
}: FoodFormProps) {
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
  const [productVariant, setProductVariant] = useState("")
  
  // Состояния для своего варианта
  const [customTitle, setCustomTitle] = useState("")
  const [customPortionSize, setCustomPortionSize] = useState<number | undefined>()

  // Загружаем рецепты и продукты
  useEffect(() => {
    async function loadData() {
      // Загружаем рецепты
      const allContent = await getAllEntities(db.content)
      const recipeContent = allContent.filter(c => c.type === ContentType.RECIPE)
      setRecipes(recipeContent)
      
      // Загружаем продукты из каталога
      const allItems = await getAllEntities(db.items)
      const productItems = allItems.filter(i => i.type === ItemType.PRODUCT)
      setProducts(productItems)
    }
    loadData()
  }, [])

  // Получаем название выбранного рецепта
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)
  const selectedRecipeMetadata = selectedRecipe?.metadata as RecipeMetadata | undefined
  
  // Получаем название выбранного продукта
  const selectedProduct = products.find(p => p.id === selectedProductId)

  // При выборе рецепта устанавливаем КБЖУ
  useEffect(() => {
    if (sourceType === "recipe" && selectedRecipe && selectedRecipeMetadata) {
      setValue("title", selectedRecipe.title)
      setValue("calories", selectedRecipeMetadata.calories)
      setValue("protein", selectedRecipeMetadata.protein)
      setValue("fat", selectedRecipeMetadata.fat)
      setValue("carbs", selectedRecipeMetadata.carbs)
    }
  }, [sourceType, selectedRecipeId, selectedRecipe, selectedRecipeMetadata, setValue])

  // При выборе продукта из каталога
  useEffect(() => {
    if (sourceType === "product" && selectedProduct) {
      setValue("title", selectedProduct.name)
    }
  }, [sourceType, selectedProductId, selectedProduct, setValue])

  // При своём варианте
  useEffect(() => {
    if (sourceType === "custom" && customTitle) {
      setValue("title", customTitle)
    }
  }, [sourceType, customTitle, setValue])

  // Обновляем title при выборе из зависимых списков
  useEffect(() => {
    if (sourceType === "product" && productCategory && productSubcategory) {
      const title = productVariant 
        ? `${productSubcategory} (${productVariant})` 
        : productSubcategory
      setValue("title", title)
    }
  }, [sourceType, productCategory, productSubcategory, productVariant, setValue])

  // Получаем подкатегории для категории
  const currentSubcategories = productCategory ? Object.keys(foodProducts[productCategory] || {}) : []
  const currentVariants = productSubcategory && productCategory ? foodProducts[productCategory]?.[productSubcategory] || [] : []

  return (
    <>
      {/* Выбор источника */}
      <div className="space-y-2">
        <Label>Источник</Label>
        <div className="grid grid-cols-3 gap-2">
          {foodSourceTypes.map((source) => {
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
                  setProductVariant("")
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
                {source.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Свой вариант */}
      {sourceType === "custom" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customTitle">Название блюда *</Label>
            <Input
              id="customTitle"
              placeholder="Введите название"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customPortion">Размер порции (г)</Label>
            <Input
              id="customPortion"
              type="number"
              placeholder="граммы"
              value={customPortionSize ?? ""}
              onChange={(e) => setCustomPortionSize(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      )}

      {/* Выбор из рецептов */}
      {sourceType === "recipe" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Выберите рецепт</Label>
            {recipes.length > 0 ? (
              <div className="relative">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  style={{
                    backgroundImage: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                >
                  <option value="" disabled>Выберите рецепт</option>
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
                <p className="text-sm">Нет сохранённых рецептов</p>
                <p className="text-xs mt-1">Добавьте рецепты в раздел Контент</p>
              </div>
            )}
          </div>
          
          {selectedRecipe && selectedRecipeMetadata && (
            <Card className="bg-accent/50">
              <CardContent className="pt-4">
                <div className="grid grid-cols-4 gap-2 text-center text-sm">
                  <div>
                    <p className="text-muted-foreground">Ккал</p>
                    <p className="font-medium">{selectedRecipeMetadata.calories || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Белки</p>
                    <p className="font-medium">{selectedRecipeMetadata.protein || 0}г</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Жиры</p>
                    <p className="font-medium">{selectedRecipeMetadata.fat || 0}г</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Угл.</p>
                    <p className="font-medium">{selectedRecipeMetadata.carbs || 0}г</p>
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
              <ComboboxSelect
                label="Категория продуктов"
                options={Object.keys(foodProducts)}
                value={productCategory}
                onChange={(value) => {
                  setProductCategory(value)
                  setProductSubcategory("")
                  setProductVariant("")
                }}
                placeholder="Выберите категорию"
              />
              
              {productCategory && (
                <ComboboxSelect
                  label="Продукт"
                  options={currentSubcategories}
                  value={productSubcategory}
                  onChange={(value) => {
                    setProductSubcategory(value)
                    setProductVariant("")
                  }}
                  placeholder="Выберите продукт"
                />
              )}
              
              {productSubcategory && currentVariants.length > 0 && (
                <ComboboxSelect
                  label="Вариант"
                  options={currentVariants}
                  value={productVariant}
                  onChange={setProductVariant}
                  placeholder="Выберите вариант"
                />
              )}
            </>
          ) : (
            /* Если нет продуктов в каталоге, показываем форму добавления */
            <>
              <ComboboxSelect
                label="Категория продуктов"
                options={Object.keys(foodProducts)}
                value={productCategory}
                onChange={(value) => {
                  setProductCategory(value)
                  setProductSubcategory("")
                  setProductVariant("")
                }}
                placeholder="Выберите категорию"
              />
              
              {productCategory && (
                <ComboboxSelect
                  label="Продукт"
                  options={currentSubcategories}
                  value={productSubcategory}
                  onChange={(value) => {
                    setProductSubcategory(value)
                    setProductVariant("")
                  }}
                  placeholder="Выберите продукт"
                />
              )}
              
              {productSubcategory && currentVariants.length > 0 && (
                <ComboboxSelect
                  label="Вариант"
                  options={currentVariants}
                  value={productVariant}
                  onChange={setProductVariant}
                  placeholder="Выберите вариант"
                />
              )}
            </>
          )}
        </div>
      )}

      {/* КБЖУ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Пищевая ценность</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories" className="text-xs">Ккал</Label>
              <Input
                id="calories"
                type="number"
                placeholder="0"
                {...register("calories", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-xs">Белки</Label>
              <Input
                id="protein"
                type="number"
                step="0.1"
                placeholder="0"
                {...register("protein", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-xs">Жиры</Label>
              <Input
                id="fat"
                type="number"
                step="0.1"
                placeholder="0"
                {...register("fat", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-xs">Углеводы</Label>
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