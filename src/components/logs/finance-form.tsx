"use client"

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ComboboxSelect } from "./combobox-select"
import type { FinanceType, Account } from "@/types"

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

const financeSchema = baseLogSchema.extend({
  finance_type: z.enum(["income", "expense", "transfer"]),
  account_id: z.string().optional(),
})

export type FinanceFormData = z.infer<typeof financeSchema>

// ============================================
// Константы
// ============================================

// Финансовые категории по типам
export const financeCategories: Record<string, Record<string, { subcategories: Record<string, string[]> }>> = {
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
export const suppliers: Record<string, string[]> = {
  "Продукты": ["Магнит", "Пятёрочка", "Азбука Вкуса", "Перекрёсток", "Яндекс.Еда", "Самокат"],
  "Транспорт": ["Яндекс.Такси", "Uber", "Ситимобил", "Лукойл", "Газпром"],
  "Развлечения": ["Netflix", "Яндекс.Плюс", "YouTube Premium", "Кинотеатр"],
  "Здоровье": ["Аптека.ру", "Ригла", "Живика", "Горздрав"],
  "Связь": ["МТС", "Билайн", "Мегафон", "Tele2", "Ростелеком"],
  "default": [],
}

// Типы аккаунтов с иконками
export const accountTypeLabels: Record<string, string> = {
  cash: "💵 Наличные",
  card: "💳 Карта",
  bank: "🏦 Счёт",
  deposit: "📈 Вклад",
  investment: "📊 Инвестиции",
  crypto: "₿ Крипто",
}

// ============================================
// Интерфейсы
// ============================================

interface FinanceFormProps {
  register: UseFormRegister<FinanceFormData>
  watch: UseFormWatch<FinanceFormData>
  setValue: UseFormSetValue<FinanceFormData>
  errors: Record<string, { message?: string }>
  accounts: Account[]
  financeType: string
  setFinanceType: (value: string) => void
  selectedAccountId: string
  setSelectedAccountId: (value: string) => void
  targetAccountId: string
  setTargetAccountId: (value: string) => void
  financeCategory: string
  setFinanceCategory: (value: string) => void
  financeSubcategory: string
  setFinanceSubcategory: (value: string) => void
  financeItem: string
  setFinanceItem: (value: string) => void
  financeSupplier: string
  setFinanceSupplier: (value: string) => void
}

// ============================================
// Компонент
// ============================================

export function FinanceForm({
  register,
  watch,
  setValue,
  errors,
  accounts,
  financeType,
  setFinanceType,
  selectedAccountId,
  setSelectedAccountId,
  targetAccountId,
  setTargetAccountId,
  financeCategory,
  setFinanceCategory,
  financeSubcategory,
  setFinanceSubcategory,
  financeItem,
  setFinanceItem,
  financeSupplier,
  setFinanceSupplier,
}: FinanceFormProps) {
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

  return (
    <>
      {/* Сумма */}
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
        {errors.value && (
          <p className="text-sm text-destructive">{errors.value.message}</p>
        )}
      </div>

      {/* Выбор аккаунта */}
      {accounts.length > 0 && (
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

      {/* Сообщение если нет аккаунтов */}
      {accounts.length === 0 && (
        <div className="space-y-2">
          <Label>Аккаунт *</Label>
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">Нет доступных аккаунтов</p>
            <p className="text-sm text-muted-foreground mt-1">
              Создайте аккаунт в настройках для ведения учёта финансов
            </p>
          </div>
        </div>
      )}

      {/* Выбор целевого аккаунта для переводов */}
      {financeType === "transfer" && accounts.length > 1 && (
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

      {/* Зависимые выпадающие списки */}
      <ComboboxSelect
        label="Категория"
        options={currentFinanceCategories}
        value={financeCategory}
        onChange={(value) => {
          setFinanceCategory(value)
          setFinanceSubcategory("")
          setFinanceItem("")
          setFinanceSupplier("")
        }}
        placeholder="Выберите категорию"
      />
      
      <ComboboxSelect
        label="Подкатегория"
        options={currentSubcategories}
        value={financeSubcategory}
        onChange={(value) => {
          setFinanceSubcategory(value)
          setFinanceItem("")
        }}
        placeholder="Выберите подкатегорию"
      />
      
      {currentItems.length > 0 ? (
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
      ) : (
        <div className="space-y-2">
          <Label htmlFor="title">Товар/услуга</Label>
          <Input
            id="title"
            placeholder="Введите название товара/услуги"
            {...register("title")}
          />
        </div>
      )}
      
      <ComboboxSelect
        label="Поставщик"
        options={currentSuppliers}
        value={financeSupplier}
        onChange={setFinanceSupplier}
        placeholder="Выберите поставщика"
      />
    </>
  )
}