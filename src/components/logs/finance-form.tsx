"use client"

import { useEffect, useState } from "react"
import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "next-intl"
import { DependentSelect } from "@/components/shared/forms"
import { cn } from "@/lib/utils"
import { financeColors } from "@/lib/theme-colors"
import type {
  FinanceType,
  Account,
  FinanceSubcategory,
  FinanceItem,
  FinanceSupplier,
} from "@/types"
import { db, getStaticEntityTranslation } from "@/lib/db"
import { useLocale } from "next-intl"
import { financeTypeColors } from "@/lib/theme-colors"

// ============================================
// Схема валидации

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

const financeSchema = baseLogSchema.extend({
  finance_type: z.enum(["income", "expense", "transfer"]),
  account_id: z.string().optional(),
  target_account_id: z.string().optional(),
})

export type FinanceFormData = z.infer<typeof financeSchema>

// ============================================
// Типы аккаунтов с иконками
// ============================================
export const accountTypeLabels: Record<string, string> = {
  cash: "💵 Cash",
  card: "💳 Card",
  bank: "🏦 Bank Account",
  deposit: "📈 Deposit",
  investment: "📊 Investment",
  crypto: "₿ Crypto",
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
  const t = useTranslations("logs")
  const tCommon = useTranslations("common")
  const tSettings = useTranslations("settings")
  const locale = useLocale()

  // Данные из БД
  const [financeSubcategories, setFinanceSubcategories] = useState<FinanceSubcategory[]>([])
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([])
  const [financeSuppliersList, setFinanceSuppliersList] = useState<FinanceSupplier[]>([])

  // Загрузка данных из БД
  useEffect(() => {
    async function loadData() {
      const [subcats, items, suppliers] = await Promise.all([
        db.financeSubcategories.toArray(),
        db.financeItems.toArray(),
        db.financeSuppliers.toArray(),
      ])
      setFinanceSubcategories(subcats)
      setFinanceItems(items)
      setFinanceSuppliersList(suppliers)
    }
    loadData()
  }, [])

  // Get account type label with translation
  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cash: tSettings("accounts.accountTypes.cash"),
      card: tSettings("accounts.accountTypes.card"),
      bank: tSettings("accounts.accountTypes.bank"),
      deposit: tSettings("accounts.accountTypes.deposit"),
      investment: tSettings("accounts.accountTypes.investment"),
      crypto: tSettings("accounts.accountTypes.crypto"),
    }
    const icons: Record<string, string> = {
      cash: "💵",
      card: "💳",
      bank: "🏦",
      deposit: "📈",
      investment: "📊",
      crypto: "₿",
    }

    const label = labels[type]
    const icon = icons[type]

    if (!label) {
      return type
    }

    return label
  }

  const getAccountTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      cash: "💵",
      card: "💳",
      bank: "🏦",
      deposit: "📈",
      investment: "📊",
      crypto: "₿",
    }
    return icons[type] || ""
  }

  // Emoji для финансовых категорий
  const categoryEmojis: Record<string, string> = {
    // Income
    salary: "💰",
    freelance: "💻",
    investments: "📈",
    other: "📦",
    // Expense
    product: "🛒",
    transport: "🚗",
    entertainment: "🎬",
    health: "💊",
    clothing: "👕",
    housing: "🏠",
    communication: "📱",
    education: "📚",
    // Transfer
    transfer: "💸",
    topUp: "➕",
  }

  // Emoji для подкатегорий
  const subcategoryEmojis: Record<string, string> = {
    main: "💼",
    bonus: "🎁",
    allowance: "💵",
    development: "💻",
    design: "🎨",
    consulting: "💡",
    dividends: "💹",
    interest: "🏦",
    coupons: "🎫",
    gifts: "🎁",
    refund: "↩️",
    // Products
    dairy: "🥛",
    meat: "🥩",
    fish: "🐟",
    vegetables: "🥬",
    fruits: "🍎",
    berries: "🍓",
    cereals: "🌾",
    bread: "🍞",
    drinks: "🥤",
    groceries: "🛒",
    confectionery: "🍬",
    frozen: "🧊",
    // Transport
    taxi: "🚕",
    public: "🚌",
    fuel: "⛽",
    // Entertainment
    cinema: "🎬",
    concerts: "🎵",
    cafe: "☕",
    subscriptions: "📺",
    // Health
    pharmacy: "💊",
    doctor: "🩺",
    gym: "💪",
    // Housing
    rent: "🏠",
    utilities: "💡",
    repair: "🔧",
    // Communication
    mobile: "📱",
    internet: "🌐",
    tv: "📺",
    // Education
    courses: "📖",
    books: "📚",
    tutor: "👨‍🏫",
    // Transfer
    toCard: "💳",
    toAccount: "🏦",
    toCash: "💵",
    fromCard: "💳",
    inCash: "💵",
  }

  const getCategoryEmoji = (category: string) => {
    return categoryEmojis[category] || ""
  }

  const getSubcategoryEmoji = (subcategory: string) => {
    return subcategoryEmojis[subcategory] || ""
  }

  // Получаем категории для текущего типа финансов из БД
  const [dbCategories, setDbCategories] = useState<any[]>([])

  useEffect(() => {
    async function loadCategories() {
      const cats = await db.categories.toArray()
      const financeCats = cats.filter(
        (c) => c.type === "finance" && (!c.finance_type || c.finance_type === financeType)
      )
      setDbCategories(financeCats)
    }
    loadCategories()
  }, [financeType])

  // Получаем уникальные категории из подкатегорий, фильтруем по загруженным категориям из БД
  const uniqueCategoryKeys = Array.from(
    new Set(financeSubcategories.map((s) => s.category_key))
  ).filter((key) => {
    // Если категории загружены из БД, фильтруем по ним (сравниваем без учёта регистра)
    if (dbCategories.length > 0) {
      return dbCategories.some((c) => c.name.toLowerCase() === key.toLowerCase())
    }
    // Иначе показываем все категории
    return true
  })

  const currentFinanceCategories = uniqueCategoryKeys.map((key) => ({
    value: key,
    label: `${getCategoryEmoji(key)} ${getStaticEntityTranslation("categories", key, locale, "finance")}`,
  }))

  // Устанавливаем первую категорию по умолчанию после загрузки данных
  useEffect(() => {
    if (
      !financeCategory &&
      currentFinanceCategories.length > 0 &&
      financeSubcategories.length > 0 &&
      dbCategories.length > 0
    ) {
      setFinanceCategory(currentFinanceCategories[0].value)
    }
  }, [
    currentFinanceCategories.length,
    financeSubcategories.length,
    dbCategories.length,
    financeCategory,
  ])

  // Получаем подкатегории для выбранной категории (фильтруем дубликаты)
  const categorySubcats = financeSubcategories.filter((s) => s.category_key === financeCategory)
  // Используем Set для уникальности subcategory_key
  const seenSubcats = new Set<string>()
  const uniqueSubcats = categorySubcats.filter((s) => {
    if (seenSubcats.has(s.subcategory_key)) return false
    seenSubcats.add(s.subcategory_key)
    return true
  })
  const currentSubcategories = uniqueSubcats.map((s) => ({
    value: s.subcategory_key,
    label: `${getSubcategoryEmoji(s.subcategory_key)} ${getStaticEntityTranslation("financeSubcategories", s.subcategory_key, locale)}`,
  }))

  // Получаем товары/услуги для выбранной подкатегории (фильтруем дубликаты)
  const subcategoryItems = financeItems.filter(
    (i) => i.category_key === financeCategory && i.subcategory_key === financeSubcategory
  )
  // Используем Set для уникальности item_key
  const seenItems = new Set<string>()
  const uniqueItems = subcategoryItems.filter((i) => {
    if (seenItems.has(i.item_key)) return false
    seenItems.add(i.item_key)
    return true
  })
  const currentItems = uniqueItems.map((i) => ({
    value: i.item_key,
    label: getStaticEntityTranslation("financeSubcategories", i.item_key, locale),
  }))

  // Получаем поставщиков для категории
  const categorySuppliers = financeSuppliersList.filter((s) => s.category_key === financeCategory)
  const currentSuppliers = categorySuppliers.map((s) => ({
    value: s.supplier_key,
    label: getStaticEntityTranslation("financeSuppliers", s.supplier_key, locale),
  }))

  return (
    <>
      {/* Название (опционально) */}
      <div className="space-y-2">
        <Label htmlFor="title">{t("finance.title")}</Label>
        <Input id="title" placeholder={t("finance.titlePlaceholder")} {...register("title")} />
      </div>

      {/* Тип финансов */}
      <div className="space-y-2">
        <Label>{t("finance.type")}</Label>
        <Tabs
          value={financeType}
          onValueChange={(value) => {
            setFinanceType(value)
            setValue("finance_type", value as "income" | "expense" | "transfer")

            // При смене типа на transfer устанавливаем целевой аккаунт
            if (value === "transfer" && accounts.length > 1) {
              const cashAccount = accounts.find((acc) => acc.type === "cash")
              const targetAcc = cashAccount || accounts[1]
              setTargetAccountId(targetAcc.id)
              setValue("target_account_id", targetAcc.id)
            } else if (value !== "transfer") {
              // Сбрасываем targetAccountId для income и expense
              setTargetAccountId("")
              setValue("target_account_id", "")
            }
          }}
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger
              value="income"
              className={cn(financeTypeColors["income"], "text-xs sm:text-sm min-w-0 px-1 sm:px-2")}
            >
              <span className="mr-1 flex-shrink-0">📈</span>
              <span className="truncate">{t("finance.types.income")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className={cn(
                financeTypeColors["expense"],
                "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
              )}
            >
              <span className="mr-1 flex-shrink-0">📉</span>
              <span className="truncate">{t("finance.types.expense")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="transfer"
              className={cn(
                financeTypeColors["transfer"],
                "text-xs sm:text-sm min-w-0 px-1 sm:px-2"
              )}
            >
              <span className="mr-1 flex-shrink-0">🔄</span>
              <span className="truncate">{t("finance.types.transfer")}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Сумма */}
      <div className="space-y-2">
        <Label htmlFor="value">{t("finance.amount")}</Label>
        <Input
          id="value"
          type="number"
          min="0"
          step="0.01"
          placeholder="0 ₽"
          autoFocus
          className={cn(
            "text-center text-lg font-medium",
            financeType === "income" && financeColors.income.text,
            financeType === "expense" && financeColors.expense.text,
            financeType === "transfer" && financeColors.transfer.text
          )}
          onKeyPress={(e) => {
            if (!/[0-9.,]/.test(e.key)) {
              e.preventDefault()
            }
          }}
          {...register("value", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Сумма не может быть отрицательной",
            },
          })}
        />
        {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
      </div>

      {/* Выбор аккаунта */}
      {accounts.length > 0 && (
        <div className="space-y-2">
          <Label>{financeType === "transfer" ? t("finance.from") : t("finance.account")}</Label>
          <Combobox
            options={accounts.map((acc) => ({
              id: acc.id,
              label: `${getAccountTypeIcon(acc.type)} ${acc.name} • ${(acc.balance || 0).toLocaleString()} ${acc.currency}`,
            }))}
            value={selectedAccountId}
            onChange={(value) => {
              setSelectedAccountId(value as string)
              setValue("account_id", value as string)
            }}
            placeholder={t("finance.account")}
            allowCustom={false}
            searchable={false}
            className="emoji"
          />
        </div>
      )}

      {/* Целевой аккаунт для переводов */}
      {financeType === "transfer" && accounts.length > 0 && (
        <div className="space-y-2">
          <Label>{t("finance.to")}</Label>
          <Combobox
            options={accounts.map((acc) => ({
              id: acc.id,
              label: `${getAccountTypeIcon(acc.type)} ${acc.name} • ${(acc.balance || 0).toLocaleString()} ${acc.currency}`,
            }))}
            value={targetAccountId}
            onChange={(value) => {
              setTargetAccountId(value as string)
              setValue("target_account_id", value as string)
            }}
            placeholder={t("finance.account")}
            allowCustom={false}
            searchable={false}
            className="emoji"
            disabled={accounts.length <= 1}
          />
        </div>
      )}

      {/* Зависимые выпадающие списки */}
      <DependentSelect
        className="emoji"
        levels={[
          {
            label: t("finance.category"),
            options: currentFinanceCategories,
            value: financeCategory,
            onChange: (value) => {
              setFinanceCategory(value)
              setFinanceSubcategory("")
              setFinanceItem("")
              setFinanceSupplier("")
            },
            placeholder: t("finance.category"),
          },
          {
            label: t("finance.subcategory"),
            options: currentSubcategories,
            value: financeSubcategory,
            onChange: (value) => {
              setFinanceSubcategory(value)
              setFinanceItem("")
              setFinanceSupplier("")
            },
            placeholder: t("finance.subcategory"),
          },
          {
            label: t("finance.item"),
            options: currentItems,
            value: financeItem,
            onChange: (value) => {
              setFinanceItem(value)
              setValue("title", value)
            },
            placeholder: t("finance.item"),
          },
        ]}
      />

      {/* Поставщик - зависит от категории */}
      <div className="space-y-2">
        <Combobox
          options={currentSuppliers.map((s) => ({ id: s.value, label: s.label }))}
          value={financeSupplier}
          onChange={(value) => setFinanceSupplier(value as string)}
          placeholder={t("finance.supplier")}
          allowCustom={true}
          searchable={false}
          className="emoji"
          disabled={!financeCategory}
        />
      </div>
    </>
  )
}
