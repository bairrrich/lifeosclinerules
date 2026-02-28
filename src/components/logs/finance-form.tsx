"use client"

import { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { z } from "zod"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { DependentSelect } from "@/components/shared/forms"
import type { FinanceType, Account } from "@/types"
import { financeSuppliers } from "@/lib/finance-categories"

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
  const tFinCat = useTranslations("financeCategories")

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

    // Если перевод не найден, используем ключ типа
    if (!label) {
      return icon ? `${icon} ${type}` : type
    }

    return icon ? `${icon} ${label}` : label
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

  // Получение emoji для категории
  const getCategoryEmoji = (category: string) => {
    return categoryEmojis[category] || ""
  }

  // Получение emoji для подкатегории
  const getSubcategoryEmoji = (subcategory: string) => {
    return subcategoryEmojis[subcategory] || ""
  }

  // Структура финансовых категорий с ключами переводов
  const financeCategoriesStructure: Record<
    string,
    Record<string, { subcategories: Record<string, string[]> }>
  > = {
    income: {
      salary: { subcategories: { main: [], bonus: [], allowance: [] } },
      freelance: { subcategories: { development: [], design: [], consulting: [] } },
      investments: { subcategories: { dividends: [], interest: [], coupons: [] } },
      other: { subcategories: { gifts: [], refund: [], other: [] } },
    },
    expense: {
      product: {
        subcategories: {
          dairy: ["milk", "cheese", "cottageCheese", "sourCream", "kefir", "yogurt", "butter"],
          meat: ["beef", "pork", "lamb", "chicken", "turkey", "duck"],
          fish: ["trout", "herring", "salmon", "cod", "carp", "pikeperch", "mackerel"],
          vegetables: [
            "potato",
            "carrot",
            "onion",
            "beet",
            "cucumber",
            "tomato",
            "cabbage",
            "pepper",
          ],
          fruits: ["apples", "bananas", "oranges", "tangerines", "pears", "grape", "kiwi"],
          berries: ["strawberry", "raspberry", "blueberry", "currant", "cherry", "cranberry"],
          cereals: ["rice", "buckwheat", "oatmeal", "semolina", "millet", "barley"],
          bread: ["whiteBread", "blackBread", "baton", "buns", "lavash"],
          drinks: ["tea", "coffee", "juices", "water", "soda", "kvass"],
          groceries: ["pasta", "sugar", "salt", "flour", "vegetableOil", "vinegar"],
          confectionery: ["chocolate", "candy", "cookies", "cakes", "honey", "jam"],
          frozen: ["dumplings", "vareniki", "vegetableMix", "frozenBerries", "iceCream"],
        },
      },
      transport: {
        subcategories: {
          taxi: ["yandexTaxi", "uber", "sitimobil"],
          public: ["metro", "bus", "tram"],
          fuel: ["lukoil", "gazprom", "rosneft"],
        },
      },
      entertainment: {
        subcategories: {
          cinema: [],
          concerts: [],
          cafe: [],
          subscriptions: ["netflix", "yandexPlus", "youtubePremium"],
        },
      },
      health: {
        subcategories: {
          pharmacy: ["aptekaRu", "rigla", "zivika", "gordrav"],
          doctor: [],
          gym: [],
        },
      },
      clothing: { subcategories: { shoes: [], outerwear: [], casual: [] } },
      housing: { subcategories: { rent: [], utilities: [], repair: [] } },
      communication: {
        subcategories: {
          mobile: ["mts", "beeline", "megafon", "tele2"],
          internet: ["rostelecom", "domRu"],
          tv: [],
        },
      },
      education: { subcategories: { courses: [], books: [], tutor: [] } },
      other: { subcategories: { gifts: [], other: [] } },
    },
    transfer: {
      transfer: {
        subcategories: {
          toCard: ["sberbank", "tinkoff", "alfa"],
          toAccount: [],
          toCash: [],
        },
      },
      topUp: {
        subcategories: {
          fromCard: ["sberbank", "tinkoff", "alfa"],
          inCash: [],
        },
      },
    },
  }

  // Маппинг категорий для suppliers
  const categoryToSupplierKey: Record<string, string> = {
    product: "product",
    transport: "transport",
    entertainment: "entertainment",
    health: "health",
    communication: "communication",
  }

  // Получаем категории для текущего типа финансов
  const currentFinanceCategoriesObj = financeCategoriesStructure[financeType] || {}
  const currentFinanceCategories = Object.keys(currentFinanceCategoriesObj).map((key) => ({
    value: key,
    label: `${getCategoryEmoji(key)} ${tFinCat(key)}`,
  }))

  // Получаем подкатегории для выбранной категории
  const currentSubcategoriesObj = financeCategory
    ? currentFinanceCategoriesObj[financeCategory]?.subcategories || {}
    : {}
  const currentSubcategories = Object.keys(currentSubcategoriesObj).map((key) => ({
    value: key,
    label: `${getSubcategoryEmoji(key)} ${tFinCat(`subcategories.${key}`)}`,
  }))

  // Получаем товары/услуги для выбранной подкатегории
  const currentItemsObj =
    financeCategory && financeSubcategory ? currentSubcategoriesObj[financeSubcategory] || [] : []
  const currentItems = currentItemsObj.map((key) => ({
    value: key,
    label: tFinCat(`items.${key}`),
  }))

  // Получаем поставщиков для категории
  const supplierKey = financeCategory ? categoryToSupplierKey[financeCategory] : null
  const currentSuppliersObj = supplierKey
    ? financeSuppliers[supplierKey] || financeSuppliers["default"]
    : []
  const currentSuppliers = currentSuppliersObj.map((key) => ({
    value: key,
    label: tFinCat(`suppliers.${key}`),
  }))

  return (
    <>
      {/* Сумма */}
      <div className="space-y-2">
        <Label htmlFor="value">{t("finance.amount")}</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          placeholder="0 ₽"
          className="text-center text-lg font-medium"
          {...register("value", { valueAsNumber: true })}
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
              label: `${getAccountTypeLabel(acc.type)} • ${acc.name} (${acc.balance.toLocaleString()} ${acc.currency})`,
            }))}
            value={selectedAccountId}
            onChange={(value) => {
              setSelectedAccountId(value as string)
              setValue("account_id", value as string)
            }}
            placeholder={t("finance.account")}
            allowCustom={false}
            searchable={true}
            className="emoji"
          />
        </div>
      )}

      {/* Сообщение если нет аккаунтов */}
      {accounts.length === 0 && (
        <div className="space-y-2">
          <Label>{t("finance.account")} *</Label>
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive font-medium">{t("finance.noAccounts")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("finance.createAccountInSettings")}
            </p>
          </div>
        </div>
      )}

      {/* Выбор целевого аккаунта для переводов */}
      {financeType === "transfer" && accounts.length > 1 && (
        <div className="space-y-2">
          <Label>{t("finance.to")}</Label>
          <Combobox
            options={accounts
              .filter((acc) => acc.id !== selectedAccountId)
              .map((acc) => ({
                id: acc.id,
                label: `${getAccountTypeLabel(acc.type)} • ${acc.name} (${acc.balance.toLocaleString()} ${acc.currency})`,
              }))}
            value={targetAccountId}
            onChange={(value) => setTargetAccountId(value as string)}
            placeholder={t("finance.account")}
            allowCustom={false}
            searchable={true}
            className="emoji"
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

      <div className="space-y-2">
        <Label>{t("finance.supplier")}</Label>
        <Combobox
          options={currentSuppliers.map((s) => ({ id: s.value, label: s.label }))}
          value={financeSupplier}
          onChange={(value) => setFinanceSupplier(value as string)}
          placeholder={t("finance.supplier")}
          allowCustom={true}
          searchable={false}
          className="emoji"
        />
      </div>
    </>
  )
}
