"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save, ChevronDown, Plus } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, createEntity, initializeDatabase, getCategoriesByType } from "@/lib/db"
import type { LogType, Category, FoodMetadata, WorkoutMetadata, FinanceMetadata, FinanceType, Account } from "@/types"

// Финансовые категории по типам
const financeCategories: Record<string, Record<string, { subcategories: Record<string, string[]> }>> = {
  income: {
    "Зарплата": { subcategories: { "Основная": [], "Премия": [], "Надбавка": [] } },
    "Фриланс": { subcategories: { "Разработка": [], "Дизайн": [], "Консультации": [] } },
    "Инвестиции": { subcategories: { "Дивиденды": [], "Проценты": [], "Купоны": [] } },
    "Прочее": { subcategories: { "Подарки": [], "Возврат": [], "Другое": [] } },
  },
  expense: {
    "Продукты": { subcategories: { 
      "Молочные": ["Молоко", "Сыр", "Творог", "Сметана", "Кефир", "Йогурт", "Масло сливочное"],
      "Мясо": ["Говядина", "Свинина", "Баранина", "Курица", "Индейка", "Утка"],
      "Рыба": ["Форель", "Сельдь", "Лосось", "Треска", "Карп", "Судак", "Скумбрия"],
      "Овощи": ["Картофель", "Морковь", "Лук", "Свекла", "Огурцы", "Помидоры", "Капуста", "Перец"],
      "Фрукты": ["Яблоки", "Бананы", "Апельсины", "Мандарины", "Груши", "Виноград", "Киви"],
      "Ягоды": ["Клубника", "Малина", "Черника", "Смородина", "Вишня", "Клюква"],
      "Крупы": ["Рис", "Гречка", "Овсянка", "Манка", "Пшено", "Перловка"],
      "Хлеб": ["Белый хлеб", "Чёрный хлеб", "Батон", "Булочки", "Лаваш"],
      "Напитки": ["Чай", "Кофе", "Соки", "Вода", "Газировка", "Квас"],
      "Бакалея": ["Макароны", "Сахар", "Соль", "Мука", "Масло растительное", "Уксус"],
      "Кондитерские": ["Шоколад", "Конфеты", "Печенье", "Торты", "Мёд", "Варенье"],
      "Заморозка": ["Пельмени", "Вареники", "Овощная смесь", "Ягоды замороженные", "Мороженое"]
    } },
    "Транспорт": { subcategories: { "Такси": ["Яндекс.Такси", "Uber", "Ситимобил"], "Общественный": ["Метро", "Автобус", "Трамвай"], "Топливо": ["Лукойл", "Газпром", "Роснефть"] } },
    "Развлечения": { subcategories: { "Кино": [], "Концерты": [], "Кафе/Рестораны": [], "Подписки": ["Netflix", "Яндекс.Плюс", "YouTube Premium"] } },
    "Здоровье": { subcategories: { "Аптека": ["Аптека.ру", "Ригла", "Живика"], "Врач": [], "Спортзал": [] } },
    "Одежда": { subcategories: { "Обувь": [], "Верхняя одежда": [], "Повседневное": [] } },
    "Жильё": { subcategories: { "Аренда": [], "Коммунальные": [], "Ремонт": [] } },
    "Связь": { subcategories: { "Мобильная": ["МТС", "Билайн", "Мегафон", "Tele2"], "Интернет": ["Ростелеком", "Дом.ру"], "ТВ": [] } },
    "Образование": { subcategories: { "Курсы": [], "Книги": [], "Репетитор": [] } },
    "Прочее": { subcategories: { "Подарки": [], "Бытовое": [], "Другое": [] } },
  },
  transfer: {
    "Перевод": { subcategories: { "На карту": ["Сбербанк", "Тинькофф", "Альфа"], "На счёт": [], "В наличные": [] } },
    "Пополнение": { subcategories: { "С карты": ["Сбербанк", "Тинькофф", "Альфа"], "Наличными": [] } },
  },
}

// Поставщики по категориям
const suppliers: Record<string, string[]> = {
  "Продукты": ["Магнит", "Пятёрочка", "Азбука Вкуса", "Перекрёсток", "Яндекс.Еда", "Самокат"],
  "Транспорт": ["Яндекс.Такси", "Uber", "Ситимобил", "Лукойл", "Газпром"],
  "Развлечения": ["Netflix", "Яндекс.Плюс", "YouTube Premium", "Кинотеатр"],
  "Здоровье": ["Аптека.ру", "Ригла", "Живика", "Горздрав"],
  "Связь": ["МТС", "Билайн", "Мегафон", "Tele2", "Ростелеком"],
  "default": [],
}

// Form schema
const baseLogSchema = z.object({
  date: z.string().min(1, "Выберите дату"),
  time: z.string().min(1, "Выберите время"),
  title: z.string().min(1, "Введите название"),
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

const workoutSchema = baseLogSchema.extend({
  duration: z.number().optional(),
  intensity: z.enum(["low", "medium", "high"]).optional(),
})

const financeSchema = baseLogSchema.extend({
  finance_type: z.enum(["income", "expense", "transfer"]),
  account_id: z.string().optional(),
  title: z.string().optional(), // title формируется из категорий
})

type FormData = z.infer<typeof foodSchema> | z.infer<typeof workoutSchema> | z.infer<typeof financeSchema>

const typeLabels: Record<LogType, string> = {
  food: "Питание",
  workout: "Тренировка",
  finance: "Финансы",
}

// Цвета для категорий (только активные имеют фон)
const categoryColors: Record<string, string> = {
  // Питание
  "Завтрак": "data-[state=active]:bg-orange-500 data-[state=active]:text-white",
  "Обед": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "Ужин": "data-[state=active]:bg-purple-500 data-[state=active]:text-white",
  "Перекус": "data-[state=active]:bg-cyan-500 data-[state=active]:text-white",
  // Тренировки
  "Силовая": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "Кардио": "data-[state=active]:bg-blue-500 data-[state=active]:text-white",
  "Йога": "data-[state=active]:bg-emerald-500 data-[state=active]:text-white",
}

// Цвета для типов финансов
const financeTypeColors: Record<string, string> = {
  "income": "data-[state=active]:bg-green-500 data-[state=active]:text-white",
  "expense": "data-[state=active]:bg-red-500 data-[state=active]:text-white",
  "transfer": "data-[state=active]:bg-yellow-500 data-[state=active]:text-white",
}

// Порядок категорий для питания
const foodCategoryOrder = ["Завтрак", "Обед", "Ужин", "Перекус"]
// Порядок категорий для тренировок
const workoutCategoryOrder = ["Силовая", "Кардио", "Йога"]

// Компонент выпадающего списка с возможностью добавления
function ComboboxSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  placeholder = "Выберите..." 
}: { 
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>{label}</Label>
      {!showCustomInput ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className={value ? "" : "text-muted-foreground"}>
              {value || placeholder}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border bg-background shadow-lg">
              <div className="max-h-60 overflow-auto p-1">
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChange(option)
                      setIsOpen(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent ${
                      value === option ? "bg-accent" : ""
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="border-t p-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomInput(true)
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-primary hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  Добавить свой вариант
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Введите свой вариант"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setShowCustomInput(false)
              setCustomValue("")
            }}
          >
            ✕
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={() => {
              if (customValue.trim()) {
                onChange(customValue.trim())
                setShowCustomInput(false)
                setCustomValue("")
              }
            }}
          >
            ✓
          </Button>
        </div>
      )}
    </div>
  )
}

// Типы аккаунтов с иконками
const accountTypeLabels: Record<string, string> = {
  cash: "💵 Наличные",
  card: "💳 Карта",
  bank: "🏦 Счёт",
  deposit: "📈 Вклад",
  investment: "📊 Инвестиции",
  crypto: "₿ Крипто",
}

export default function NewLogPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as LogType
  
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [financeType, setFinanceType] = useState<string>("expense")
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [targetAccountId, setTargetAccountId] = useState<string>("")
  
  // Состояния для зависимых списков финансов
  const [financeCategory, setFinanceCategory] = useState("")
  const [financeSubcategory, setFinanceSubcategory] = useState("")
  const [financeItem, setFinanceItem] = useState("")
  const [financeSupplier, setFinanceSupplier] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(
      type === "food" ? foodSchema :
      type === "workout" ? workoutSchema :
      financeSchema
    ),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
    } as FormData,
  })

  // Получаем категории для текущего типа финансов
  const currentFinanceCategories = Object.keys(financeCategories[financeType] || {})
  
  // Получаем подкатегории для выбранной категории
  const currentSubcategories = financeCategory && financeCategories[financeType]?.[financeCategory]
    ? Object.keys(financeCategories[financeType][financeCategory].subcategories)
    : []
  
  // Получаем товары/услуги для выбранной подкатегории
  const currentItems = financeCategory && financeSubcategory && financeCategories[financeType]?.[financeCategory]?.subcategories[financeSubcategory]
    ? financeCategories[financeType][financeCategory].subcategories[financeSubcategory]
    : []
  
  // Получаем поставщиков для категории
  const currentSuppliers = financeCategory ? (suppliers[financeCategory] || suppliers["default"]) : []

  // Сбрасываем зависимые поля при изменении типа финансов
  useEffect(() => {
    setFinanceCategory("")
    setFinanceSubcategory("")
    setFinanceItem("")
    setFinanceSupplier("")
  }, [financeType])

  // Сбрасываем подкатегорию и товар при изменении категории
  useEffect(() => {
    setFinanceSubcategory("")
    setFinanceItem("")
  }, [financeCategory])

  // Сбрасываем товар при изменении подкатегории
  useEffect(() => {
    setFinanceItem("")
  }, [financeSubcategory])

  useEffect(() => {
    async function loadData() {
      await initializeDatabase()
      const cats = await getCategoriesByType(type)
      
      // Сортируем категории в нужном порядке, добавляя остальные в конец
      let sortedCats = cats
      if (type === "food") {
        const orderCats = foodCategoryOrder
          .map(name => cats.find(c => c.name === name))
          .filter(Boolean) as Category[]
        const remainingCats = cats.filter(c => !foodCategoryOrder.includes(c.name))
        sortedCats = [...orderCats, ...remainingCats]
      } else if (type === "workout") {
        const orderCats = workoutCategoryOrder
          .map(name => cats.find(c => c.name === name))
          .filter(Boolean) as Category[]
        const remainingCats = cats.filter(c => !workoutCategoryOrder.includes(c.name))
        sortedCats = [...orderCats, ...remainingCats]
      }
      
      setCategories(sortedCats)
      
      // Устанавливаем значения по умолчанию для категорий
      if (sortedCats.length > 0) {
        const defaultCat = sortedCats[0]
        setSelectedCategoryId(defaultCat.id)
        setValue("category_id", defaultCat.id)
      }
      
      // Загружаем аккаунты для финансов
      if (type === "finance") {
        const accs = await db.accounts.toArray()
        setAccounts(accs)
        if (accs.length > 0) {
          setSelectedAccountId(accs[0].id)
          setValue("account_id", accs[0].id)
        }
      }
    }
    loadData()
  }, [type])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Объединяем дату и время в ISO-строку
      const dateTime = `${data.date}T${data.time}:00`
      
      // Для финансов формируем title из выбранных категорий
      let title = data.title || ""
      if (type === "finance") {
        const parts = [financeCategory, financeSubcategory, financeItem].filter(Boolean)
        if (parts.length > 0) {
          title = parts.join(" → ")
        } else {
          title = "Финансовая операция"
        }
      }
      
      const baseData = {
        type,
        date: dateTime,
        title: title,
        category_id: data.category_id || undefined,
        quantity: data.quantity,
        unit: data.unit,
        value: data.value,
        notes: data.notes,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      }

      let metadata: FoodMetadata | WorkoutMetadata | FinanceMetadata | undefined

      if (type === "food") {
        const foodData = data as z.infer<typeof foodSchema>
        metadata = {
          calories: foodData.calories,
          protein: foodData.protein,
          fat: foodData.fat,
          carbs: foodData.carbs,
        }
      } else if (type === "workout") {
        const workoutData = data as z.infer<typeof workoutSchema>
        metadata = {
          duration: workoutData.duration,
          intensity: workoutData.intensity,
        }
      } else if (type === "finance") {
        const financeData = data as z.infer<typeof financeSchema>
        metadata = {
          finance_type: financeData.finance_type as FinanceType,
          account_id: financeData.account_id,
          category: financeCategory,
          subcategory: financeSubcategory,
          item: financeItem,
          supplier: financeSupplier,
          target_account_id: financeType === "transfer" ? targetAccountId : undefined,
        } as FinanceMetadata & { category?: string; subcategory?: string; item?: string; supplier?: string; target_account_id?: string }
      }

      await createEntity(db.logs, {
        ...baseData,
        metadata,
      })

      // Обновляем балансы аккаунтов
      if (type === "finance" && data.value) {
        const amount = data.value
        
        if (financeType === "income" && selectedAccountId) {
          // Доход - увеличиваем баланс аккаунта
          const account = accounts.find(a => a.id === selectedAccountId)
          if (account) {
            await db.accounts.update(selectedAccountId, {
              balance: account.balance + amount,
              updated_at: new Date().toISOString(),
            })
          }
        } else if (financeType === "expense" && selectedAccountId) {
          // Расход - уменьшаем баланс аккаунта
          const account = accounts.find(a => a.id === selectedAccountId)
          if (account) {
            await db.accounts.update(selectedAccountId, {
              balance: account.balance - amount,
              updated_at: new Date().toISOString(),
            })
          }
        } else if (financeType === "transfer" && selectedAccountId && targetAccountId) {
          // Перевод - уменьшаем один, увеличиваем другой
          const fromAccount = accounts.find(a => a.id === selectedAccountId)
          const toAccount = accounts.find(a => a.id === targetAccountId)
          if (fromAccount && toAccount) {
            await Promise.all([
              db.accounts.update(selectedAccountId, {
                balance: fromAccount.balance - amount,
                updated_at: new Date().toISOString(),
              }),
              db.accounts.update(targetAccountId, {
                balance: toAccount.balance + amount,
                updated_at: new Date().toISOString(),
              }),
            ])
          }
        }
      }

      router.push("/logs")
    } catch (error) {
      console.error("Failed to create log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={`Новая запись: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6 overflow-x-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Основное</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    className="w-auto"
                    {...register("date")}
                  />
                  <Input
                    type="time"
                    className="w-auto"
                    {...register("time")}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Tabs для категорий питания и тренировок */}
              {(type === "food" || type === "workout") && categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Tabs 
                    value={selectedCategoryId} 
                    onValueChange={(value) => {
                      setSelectedCategoryId(value)
                      setValue("category_id", value)
                    }}
                  >
                    <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
                      {categories.map((cat) => (
                        <TabsTrigger 
                          key={cat.id} 
                          value={cat.id}
                          className={categoryColors[cat.name] || ""}
                        >
                          {cat.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Tabs для типа финансов */}
              {type === "finance" && (
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Tabs 
                    value={financeType} 
                    onValueChange={(value) => {
                      setFinanceType(value)
                      setValue("finance_type", value as "income" | "expense" | "transfer")
                    }}
                  >
                    <TabsList className="grid grid-cols-3">
                      <TabsTrigger value="income" className={financeTypeColors["income"]}>Доход</TabsTrigger>
                      <TabsTrigger value="expense" className={financeTypeColors["expense"]}>Расход</TabsTrigger>
                      <TabsTrigger value="transfer" className={financeTypeColors["transfer"]}>Перевод</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              )}

              {/* Сумма для финансов */}
              {type === "finance" && (
                <div className="space-y-2">
                  <Label htmlFor="value">Сумма</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="0 ₽"
                    className="text-center text-lg font-medium"
                    {...register("value", { valueAsNumber: true })}
                  />
                </div>
              )}

              {/* Выбор аккаунта для финансов */}
              {type === "finance" && accounts.length > 0 && (
                <div className="space-y-2">
                  <Label>{financeType === "transfer" ? "Откуда" : "Аккаунт"}</Label>
                  <div className="relative">
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                      value={selectedAccountId}
                      onChange={(e) => {
                        setSelectedAccountId(e.target.value)
                        setValue("account_id", e.target.value)
                      }}
                      style={{
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {accountTypeLabels[acc.type] || acc.type} • {acc.name} ({acc.balance.toLocaleString()} ₽)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  </div>
                </div>
              )}

              {/* Выбор целевого аккаунта для переводов */}
              {type === "finance" && financeType === "transfer" && accounts.length > 1 && (
                <div className="space-y-2">
                  <Label>Куда</Label>
                  <div className="relative">
                    <select
                      className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                      value={targetAccountId}
                      onChange={(e) => setTargetAccountId(e.target.value)}
                      style={{
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                      }}
                    >
                      <option value="" disabled>Выберите аккаунт</option>
                      {accounts.filter(acc => acc.id !== selectedAccountId).map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {accountTypeLabels[acc.type] || acc.type} • {acc.name} ({acc.balance.toLocaleString()} ₽)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                  </div>
                </div>
              )}

              {/* Зависимые выпадающие списки для финансов */}
              {type === "finance" && (
                <>
                  <ComboboxSelect
                    label="Категория"
                    options={currentFinanceCategories}
                    value={financeCategory}
                    onChange={setFinanceCategory}
                    placeholder="Выберите категорию"
                  />
                  
                  {financeCategory && (
                    <ComboboxSelect
                      label="Подкатегория"
                      options={currentSubcategories}
                      value={financeSubcategory}
                      onChange={setFinanceSubcategory}
                      placeholder="Выберите подкатегорию"
                    />
                  )}
                  
                  {financeSubcategory && currentItems.length > 0 && (
                    <ComboboxSelect
                      label="Товар/услуга"
                      options={currentItems}
                      value={financeItem}
                      onChange={(value) => {
                        setFinanceItem(value)
                        setValue("title", value)
                      }}
                      placeholder="Выберите товар/услугу"
                    />
                  )}
                  
                  {financeSubcategory && currentItems.length === 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="title">Товар/услуга *</Label>
                      <Input
                        id="title"
                        placeholder="Введите название товара/услуги"
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>
                  )}
                  
                  {financeCategory && currentSuppliers.length > 0 && (
                    <ComboboxSelect
                      label="Поставщик"
                      options={currentSuppliers}
                      value={financeSupplier}
                      onChange={setFinanceSupplier}
                      placeholder="Выберите поставщика"
                    />
                  )}
                </>
              )}

              {/* Название для не-финансовых типов */}
              {type !== "finance" && (
                <div className="space-y-2">
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    placeholder="Введите название"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>
                <ComboboxSelect
                  label="Единица"
                  options={["г", "кг", "мл", "л", "шт", "уп", "порция", "см", "м"]}
                  value={watch("unit") || ""}
                  onChange={(value) => setValue("unit", value)}
                  placeholder="Выберите единицу"
                />
              </div>

              {/* Значение для не-финансовых типов */}
              {type !== "finance" && (
                <div className="space-y-2">
                  <Label htmlFor="value">Значение</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder="Значение"
                    {...register("value", { valueAsNumber: true })}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Type-specific fields */}
          {type === "food" && (
            <Card>
              <CardHeader>
                <CardTitle>Пищевая ценность</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Калории</Label>
                    <Input
                      id="calories"
                      type="number"
                      {...register("calories", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Белки (г)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      {...register("protein", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fat">Жиры (г)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      {...register("fat", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Углеводы (г)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      {...register("carbs", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {type === "workout" && (
            <Card>
              <CardHeader>
                <CardTitle>Параметры тренировки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Длительность (мин)</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...register("duration", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Интенсивность</Label>
                    <div className="relative">
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-ms-expand]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden"
                        onChange={(e) =>
                          setValue("intensity", e.target.value as "low" | "medium" | "high")
                        }
                        defaultValue=""
                        style={{
                          backgroundImage: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                        }}
                      >
                        <option value="" disabled>Выберите</option>
                        <option value="low">Низкая</option>
                        <option value="medium">Средняя</option>
                        <option value="high">Высокая</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Дополнительно</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Textarea
                  id="notes"
                  placeholder="Ваши заметки..."
                  {...register("notes")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Теги</Label>
                <Input
                  id="tags"
                  placeholder="теги через запятую"
                  {...register("tags")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}