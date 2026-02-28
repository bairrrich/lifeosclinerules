"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { Wallet, Plus, Pencil, Trash2, AlertTriangle } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { FormSection } from "@/components/shared/forms"
import { EmptyState } from "@/components/shared"
import {
  db,
  initializeDatabase,
  createEntity,
  updateEntity,
  deleteEntity,
  getAllEntities,
  getLocalizedEntityName,
} from "@/lib/db"
import type { Category, Log, Budget } from "@/types"

// Ключ для localStorage бюджетов
const BUDGETS_KEY = "life-os-budgets"

export function BudgetManager() {
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Log[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
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

  function handleAddBudget() {
    if (!selectedCategoryId || !budgetAmount) return

    const category = categories.find((c) => c.id === selectedCategoryId)
    if (!category) return

    const newBudget: Budget = {
      id: editingBudget?.id || `budget-${Date.now()}`,
      category_id: selectedCategoryId,
      category_name: category.name,
      amount: parseFloat(budgetAmount),
      period: "monthly",
    }

    let newBudgets: Budget[]
    if (editingBudget) {
      newBudgets = budgets.map((b) => (b.id === editingBudget.id ? newBudget : b))
    } else {
      newBudgets = [...budgets.filter((b) => b.category_id !== selectedCategoryId), newBudget]
    }

    saveBudgets(newBudgets)
    resetForm()
  }

  function handleDeleteBudget(budgetId: string) {
    const newBudgets = budgets.filter((b) => b.id !== budgetId)
    saveBudgets(newBudgets)
  }

  function resetForm() {
    setSelectedCategoryId("")
    setBudgetAmount("")
    setEditingBudget(null)
    setIsAddDialogOpen(false)
  }

  function openEditDialog(budget: Budget) {
    setEditingBudget(budget)
    setSelectedCategoryId(budget.category_id)
    setBudgetAmount(budget.amount.toString())
    setIsAddDialogOpen(true)
  }

  // Рассчитать расходы по категории за месяц
  function getExpensesForCategory(categoryId: string): number {
    return expenses
      .filter((e) => e.category_id === categoryId)
      .reduce((sum, e) => sum + (e.value || 0), 0)
  }

  // Доступные категории для бюджета
  const availableCategories = categories.filter(
    (c) => !budgets.some((b) => b.category_id === c.id) || editingBudget?.category_id === c.id
  )

  if (isLoading) {
    return (
      <FormSection title={t("budgets.title")} icon={Wallet}>
        <div className="text-center text-muted-foreground py-4">{t("recurring.loading")}</div>
      </FormSection>
    )
  }

  return (
    <FormSection
      title={t("budgets.title")}
      description={t("budgets.description")}
      icon={Wallet}
      actions={
        budgets.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("budgets.add")}
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <EmptyState
            title={t("budgets.empty")}
            action={{
              label: t("budgets.addFirst"),
              onClick: () => setIsAddDialogOpen(true),
              icon: Plus,
            }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {budgets.map((budget) => {
                const spent = getExpensesForCategory(budget.category_id)
                const percentage =
                  budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
                const isOverBudget = spent > budget.amount
                const remaining = budget.amount - spent

                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {localizedCategoryNames[budget.category_id] || budget.category_name}
                        </span>
                        {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${isOverBudget ? "text-red-500" : "text-muted-foreground"}`}
                        >
                          {spent.toLocaleString()} / {budget.amount.toLocaleString()}{" "}
                          {t("budgets.currency")}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openEditDialog(budget)}
                          aria-label={t("budgets.edit")}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleDeleteBudget(budget.id)}
                          aria-label={tCommon("delete")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      className={`h-2 ${isOverBudget ? "bg-red-100" : ""}`}
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
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t("budgets.add")}
            </Button>
          </>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBudget ? t("budgets.edit") : t("budgets.new")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("budgets.category")}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  disabled={!!editingBudget}
                >
                  <option value="">{t("budgets.selectCategory")}</option>
                  {availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {localizedCategoryNames[cat.id] || cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>
                  {t("budgets.limit")} ({t("budgets.currency")})
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleAddBudget}>
                {editingBudget ? tCommon("save") : tCommon("add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormSection>
  )
}
