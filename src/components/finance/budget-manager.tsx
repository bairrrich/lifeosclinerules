"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Wallet, AlertTriangle } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { CrudManager } from "@/components/shared"
import { Progress } from "@/components/ui/progress"
import { db, initializeDatabase, getAllEntities, getLocalizedEntityName } from "@/lib/db"
import type { Category, Log, Budget } from "@/types"
import { priorityColors } from "@/lib/theme-colors"

// Ключ для localStorage бюджетов
const BUDGETS_KEY = "life-os-budgets"

export function BudgetManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [expenses, setExpenses] = useState<Log[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [budgetAmount, setBudgetAmount] = useState("")
  const [localizedCategoryNames, setLocalizedCategoryNames] = useState<Record<string, string>>({})

  const t = useTranslations("finance")
  const tCommon = useTranslations("common")
  const locale = useLocale()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0]

      const [allCategories, allLogs] = await Promise.all([
        getAllEntities(db.categories),
        db.logs.where("type").equals("finance").toArray(),
      ])

      // Фильтруем категории для финансов
      const financeCategories = allCategories.filter((c) => c.type === "finance")
      setCategories(financeCategories)

      // Загружаем локализованные названия категорий
      const localizedNames: Record<string, string> = {}
      for (const category of financeCategories) {
        localizedNames[category.id] = await getLocalizedEntityName(
          "category",
          category.id,
          locale,
          category.name,
          "finance"
        )
      }
      setLocalizedCategoryNames(localizedNames)

      // Фильтруем расходы за текущий месяц
      const monthExpenses = allLogs.filter(
        (log) =>
          log.date >= startOfMonth &&
          log.type === "finance" &&
          (log.metadata as any)?.finance_type === "expense"
      )
      setExpenses(monthExpenses)

      // Загружаем бюджеты из localStorage
      const savedBudgets = localStorage.getItem(BUDGETS_KEY)
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets))
      }
    } catch (error) {
      console.error("Failed to load budget data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function saveBudgets(newBudgets: Budget[]) {
    setBudgets(newBudgets)
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(newBudgets))
  }

  const handleCreate = async (item: Budget) => {
    // item будет пустым объектом, используем локальные состояния
    if (!selectedCategoryId || !budgetAmount) return

    const newBudget: Budget = {
      id: `budget-${Date.now()}`,
      category_id: selectedCategoryId,
      category_name: categories.find((c) => c.id === selectedCategoryId)?.name || "",
      amount: parseFloat(budgetAmount),
      period: "monthly",
    }
    const newBudgets = [
      ...budgets.filter((b) => b.category_id !== newBudget.category_id),
      newBudget,
    ]
    saveBudgets(newBudgets)
    resetForm()
  }

  const handleUpdate = async (id: string, updates: Partial<Budget>) => {
    const newBudgets = budgets.map((b) => (b.id === id ? { ...b, ...updates } : b))
    saveBudgets(newBudgets)
    resetForm()
  }

  const handleDelete = async (id: string) => {
    const newBudgets = budgets.filter((b) => b.id !== id)
    saveBudgets(newBudgets)
  }

  const resetForm = () => {
    setSelectedCategoryId("")
    setBudgetAmount("")
  }

  // Для формы используем локальные состояния
  const handleFormChange = (updates: Partial<Budget>) => {
    if (updates.category_id) setSelectedCategoryId(updates.category_id)
    if (updates.amount !== undefined) setBudgetAmount(updates.amount.toString())
  }

  // Рассчитать расходы по категории за месяц
  const getExpensesForCategory = (categoryId: string): number => {
    return expenses
      .filter((e) => e.category_id === categoryId)
      .reduce((sum, e) => sum + (e.value || 0), 0)
  }

  // Доступные категории для бюджета
  const availableCategories = categories.filter((c) => !budgets.some((b) => b.category_id === c.id))

  const renderForm = (
    item: Budget | null,
    onChange: (updates: Partial<Budget>) => void,
    onSave: () => void,
    onCancel: () => void,
    isCreating?: boolean
  ) => {
    // Для нового бюджета показываем все категории
    const formAvailableCategories = isCreating
      ? categories
      : categories.filter(
          (c) => !budgets.some((b) => b.category_id === c.id) || item?.category_id === c.id
        )

    // Используем локальные состояния для обоих режимов
    const value = {
      category_id: selectedCategoryId,
      amount: budgetAmount ? parseFloat(budgetAmount) : undefined,
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="sr-only">{t("budgets.category")}</Label>
            <Combobox
              options={formAvailableCategories.map((cat) => ({
                id: cat.id,
                label: localizedCategoryNames[cat.id] || cat.name,
              }))}
              value={value.category_id || ""}
              onChange={(catValue) => {
                handleFormChange({ category_id: catValue as string })
                onChange({ category_id: catValue as string })
              }}
              placeholder={t("budgets.selectCategory")}
              allowCustom={false}
              searchable={false}
            />
          </div>
          <div className="space-y-1">
            <Label className="sr-only">{t("budgets.limit")}</Label>
            <Input
              type="number"
              placeholder="10000"
              value={value.amount?.toString() || ""}
              onChange={(e) => {
                handleFormChange({ amount: Number(e.target.value) })
                onChange({ amount: Number(e.target.value) })
              }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="action-sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="action-sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: Budget, onEdit: () => void, onDelete: () => void) => {
    const spent = getExpensesForCategory(item.category_id)
    const percentage = item.amount > 0 ? Math.min((spent / item.amount) * 100, 100) : 0
    const isOverBudget = spent > item.amount
    const remaining = item.amount - spent

    const handleEdit = () => {
      setSelectedCategoryId(item.category_id)
      setBudgetAmount(item.amount.toString())
      onEdit()
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {localizedCategoryNames[item.category_id] || item.category_name}
            </span>
            {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isOverBudget ? "text-red-500" : "text-muted-foreground"}`}>
              {spent.toLocaleString()} / {item.amount.toLocaleString()} {t("budgets.currency")}
            </span>
          </div>
        </div>
        <Progress
          value={percentage}
          className={`h-2 ${isOverBudget ? priorityColors.low.light : ""}`}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {percentage.toFixed(0)}% {t("budgets.used")}
          </span>
          <span className={isOverBudget ? "text-red-500" : ""}>
            {isOverBudget
              ? `${t("budgets.overBudget")} ${Math.abs(remaining).toLocaleString()} ${t("budgets.currency")}`
              : `${t("budgets.remaining")} ${remaining.toLocaleString()} ${t("budgets.currency")}`}
          </span>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="text-center text-muted-foreground py-4">{t("recurring.loading")}</div>
  }

  return (
    <CrudManager
      title={t("budgets.title")}
      description={t("budgets.description")}
      icon={Wallet}
      items={budgets}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      getKey={(item) => item.id}
      renderForm={renderForm}
      renderItem={renderItem}
      emptyMessage={t("budgets.empty")}
    />
  )
}
