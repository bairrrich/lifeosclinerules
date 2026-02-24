"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { db, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import { LogType, ContentType, ItemType } from "@/types"
import type { Account, Category, Unit } from "@/types"
import type { LucideIcon } from "lucide-react"
import { 
  Banknote, CreditCard, Landmark, TrendingUp, LineChart, Bitcoin,
  UtensilsCrossed, Dumbbell, Wallet,
  Pill, Bandage, Leaf, Sparkles, Apple
} from "lucide-react"

// Типы аккаунтов с иконками
export const accountTypes: { value: Account["type"]; label: string; icon: LucideIcon }[] = [
  { value: "cash", label: "Наличные", icon: Banknote },
  { value: "card", label: "Карта", icon: CreditCard },
  { value: "bank", label: "Счёт", icon: Landmark },
  { value: "deposit", label: "Вклад", icon: TrendingUp },
  { value: "investment", label: "Инвестиции", icon: LineChart },
  { value: "crypto", label: "Крипто", icon: Bitcoin },
]

// Типы единиц измерения
export const unitTypes = [
  { value: "weight", label: "Вес" },
  { value: "volume", label: "Объём" },
  { value: "count", label: "Штуки" },
  { value: "time", label: "Время" },
  { value: "money", label: "Деньги" },
]

// Маппинг типов логов
export const logTypeLabels: Record<string, { label: string; icon: LucideIcon }> = {
  [LogType.FOOD]: { label: "Питание", icon: UtensilsCrossed },
  [LogType.WORKOUT]: { label: "Тренировки", icon: Dumbbell },
  [LogType.FINANCE]: { label: "Финансы", icon: Wallet },
}

// Маппинг типов элементов каталога
export const itemTypeLabels: Record<string, { label: string; icon: LucideIcon }> = {
  [ItemType.VITAMIN]: { label: "Витамины", icon: Pill },
  [ItemType.MEDICINE]: { label: "Лекарства", icon: Bandage },
  [ItemType.HERB]: { label: "Травы", icon: Leaf },
  [ItemType.COSMETIC]: { label: "Косметика", icon: Sparkles },
  [ItemType.PRODUCT]: { label: "Продукты", icon: Apple },
}

// Интерфейс контекста
interface SettingsContextType {
  // Состояние
  mounted: boolean
  stats: {
    logs: number
    items: number
    content: number
    books: number
    recipes: number
    foodLogs: number
    workoutLogs: number
    financeLogs: number
    booksReading: number
    booksCompleted: number
    booksPlanned: number
  }
  accounts: Account[]
  categories: Category[]
  units: Unit[]
  
  // Редактирование
  editingAccount: Account | null
  setEditingAccount: (account: Account | null) => void
  editingCategory: Category | null
  setEditingCategory: (category: Category | null) => void
  editingUnit: Unit | null
  setEditingUnit: (unit: Unit | null) => void
  
  // CRUD аккаунты
  createAccount: (data: Partial<Account>) => Promise<void>
  updateAccountData: (id: string, data: Partial<Account>) => Promise<void>
  deleteAccountData: (id: string) => Promise<void>
  
  // CRUD категории
  createCategory: (data: Partial<Category>) => Promise<void>
  updateCategoryData: (id: string, data: Partial<Category>) => Promise<void>
  deleteCategoryData: (id: string) => Promise<void>
  
  // CRUD единицы
  createUnit: (data: Partial<Unit>) => Promise<void>
  updateUnitData: (id: string, data: Partial<Unit>) => Promise<void>
  deleteUnitData: (id: string) => Promise<void>
  
  // Перезагрузка
  reloadStats: () => Promise<void>
  reloadAccounts: () => Promise<void>
  reloadCategories: () => Promise<void>
  reloadUnits: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  const [stats, setStats] = useState({
    logs: 0,
    items: 0,
    content: 0,
    books: 0,
    recipes: 0,
    foodLogs: 0,
    workoutLogs: 0,
    financeLogs: 0,
    booksReading: 0,
    booksCompleted: 0,
    booksPlanned: 0,
  })
  
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)

  const reloadStats = async () => {
    const [
      logs, items, content, books,
      foodLogs, workoutLogs, financeLogs,
      recipes,
      userBooks
    ] = await Promise.all([
      db.logs.count(),
      db.items.count(),
      db.content.count(),
      db.books.count(),
      db.logs.where("type").equals(LogType.FOOD).count(),
      db.logs.where("type").equals(LogType.WORKOUT).count(),
      db.logs.where("type").equals(LogType.FINANCE).count(),
      db.content.where("type").equals(ContentType.RECIPE).count(),
      db.userBooks.toArray(),
    ])
    
    const booksReading = userBooks.filter(b => b.status === "reading").length
    const booksCompleted = userBooks.filter(b => b.status === "completed").length
    const booksPlanned = userBooks.filter(b => b.status === "planned").length
    
    setStats({ 
      logs, items, content, books,
      foodLogs, workoutLogs, financeLogs,
      recipes, booksReading, booksCompleted, booksPlanned 
    })
  }

  const reloadAccounts = async () => {
    const accs = await db.accounts.toArray()
    setAccounts(accs)
  }
  
  const reloadCategories = async () => {
    const cats = await db.categories.toArray()
    setCategories(cats)
  }
  
  const reloadUnits = async () => {
    const u = await db.units.toArray()
    setUnits(u)
  }

  useEffect(() => {
    const init = async () => {
      setMounted(true)
      await Promise.all([
        reloadStats(),
        reloadAccounts(),
        reloadCategories(),
        reloadUnits(),
      ])
    }
    init()
  }, [])

  // CRUD аккаунты
  const createAccount = async (data: Partial<Account>) => {
    await createEntity(db.accounts, data)
    reloadAccounts()
  }

  const updateAccountData = async (id: string, data: Partial<Account>) => {
    await updateEntity(db.accounts, id, data)
    setEditingAccount(null)
    reloadAccounts()
  }

  const deleteAccountData = async (id: string) => {
    await deleteEntity(db.accounts, id)
    reloadAccounts()
  }

  // CRUD категории
  const createCategory = async (data: Partial<Category>) => {
    await createEntity(db.categories, data)
    reloadCategories()
  }

  const updateCategoryData = async (id: string, data: Partial<Category>) => {
    await updateEntity(db.categories, id, data)
    setEditingCategory(null)
    reloadCategories()
  }

  const deleteCategoryData = async (id: string) => {
    await deleteEntity(db.categories, id)
    reloadCategories()
  }

  // CRUD единицы
  const createUnit = async (data: Partial<Unit>) => {
    await createEntity(db.units, data)
    reloadUnits()
  }

  const updateUnitData = async (id: string, data: Partial<Unit>) => {
    await updateEntity(db.units, id, data)
    setEditingUnit(null)
    reloadUnits()
  }

  const deleteUnitData = async (id: string) => {
    await deleteEntity(db.units, id)
    reloadUnits()
  }

  return (
    <SettingsContext.Provider value={{
      mounted,
      stats,
      accounts,
      categories,
      units,
      editingAccount,
      setEditingAccount,
      editingCategory,
      setEditingCategory,
      editingUnit,
      setEditingUnit,
      createAccount,
      updateAccountData,
      deleteAccountData,
      createCategory,
      updateCategoryData,
      deleteCategoryData,
      createUnit,
      updateUnitData,
      deleteUnitData,
      reloadStats,
      reloadAccounts,
      reloadCategories,
      reloadUnits,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }
  return context
}