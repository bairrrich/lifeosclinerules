"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Edit, Calendar, Wallet, TrendingDown, TrendingUp, Repeat } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db, initializeDatabase } from "@/lib/db"
import type { RecurringTransaction, Account } from "@/types"
import { cn } from "@/lib/utils"

const frequencyLabels: Record<string, string> = {
  daily: "Ежедневно",
  weekly: "Еженедельно",
  biweekly: "Раз в 2 недели",
  monthly: "Ежемесячно",
  quarterly: "Ежеквартально",
  yearly: "Ежегодно",
}

export function RecurringTransactions() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [category, setCategory] = useState("")
  const [frequency, setFrequency] = useState<
    "monthly" | "weekly" | "daily" | "biweekly" | "quarterly" | "yearly"
  >("monthly")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [accountId, setAccountId] = useState("")
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const [recurringData, accountsData] = await Promise.all([
        db.recurringTransactions.where("is_active").equals(1).toArray(),
        db.accounts.toArray(),
      ])
      setRecurring(recurringData as RecurringTransaction[])
      setAccounts(accountsData)
      if (accountsData.length > 0) {
        setAccountId(accountsData[0].id)
      }
    } catch (error) {
      console.error("Failed to load recurring transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function calculateNextDue(recurring: RecurringTransaction): string {
    const now = new Date()
    const start = new Date(recurring.start_date)

    if (start > now) {
      return recurring.start_date
    }

    let next = new Date(start)

    switch (recurring.frequency) {
      case "daily":
        while (next <= now) {
          next.setDate(next.getDate() + 1)
        }
        break
      case "weekly":
        while (next <= now) {
          next.setDate(next.getDate() + 7)
        }
        break
      case "biweekly":
        while (next <= now) {
          next.setDate(next.getDate() + 14)
        }
        break
      case "monthly":
        const day = recurring.day_of_month || 1
        next = new Date(now.getFullYear(), now.getMonth(), day)
        if (next <= now) {
          next = new Date(now.getFullYear(), now.getMonth() + 1, day)
        }
        break
      case "quarterly":
        while (next <= now) {
          next.setMonth(next.getMonth() + 3)
        }
        break
      case "yearly":
        while (next <= now) {
          next.setFullYear(next.getFullYear() + 1)
        }
        break
    }

    return next.toISOString().split("T")[0]
  }

  async function saveRecurring() {
    if (!title || !amount) return

    const now = new Date().toISOString()
    const nextDue = calculateNextDueForNew()

    const data: Omit<RecurringTransaction, "id" | "created_at" | "updated_at"> = {
      title,
      amount: parseFloat(amount),
      type,
      category: category || undefined,
      account_id: accountId || undefined,
      frequency,
      day_of_month: frequency === "monthly" ? parseInt(dayOfMonth) : undefined,
      start_date: startDate,
      next_due: nextDue,
      is_active: true,
    }

    if (editingId) {
      await db.recurringTransactions.update(editingId, {
        ...data,
        updated_at: now,
      })
    } else {
      await db.recurringTransactions.add({
        ...data,
        id: crypto.randomUUID(),
        created_at: now,
        updated_at: now,
      })
    }

    resetForm()
    loadData()
  }

  function calculateNextDueForNew(): string {
    const now = new Date()
    const start = new Date(startDate)

    if (start > now) {
      return startDate
    }

    let next = new Date(start)

    switch (frequency) {
      case "monthly":
        const day = parseInt(dayOfMonth) || 1
        next = new Date(now.getFullYear(), now.getMonth(), day)
        if (next <= now) {
          next = new Date(now.getFullYear(), now.getMonth() + 1, day)
        }
        break
      case "weekly":
        while (next <= now) {
          next.setDate(next.getDate() + 7)
        }
        break
      case "daily":
        next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case "biweekly":
        while (next <= now) {
          next.setDate(next.getDate() + 14)
        }
        break
      case "quarterly":
        while (next <= now) {
          next.setMonth(next.getMonth() + 3)
        }
        break
      case "yearly":
        while (next <= now) {
          next.setFullYear(next.getFullYear() + 1)
        }
        break
    }

    return next.toISOString().split("T")[0]
  }

  function editRecurring(item: RecurringTransaction) {
    setEditingId(item.id)
    setTitle(item.title)
    setAmount(item.amount.toString())
    setType(item.type)
    setCategory(item.category || "")
    setFrequency(item.frequency as typeof frequency)
    setDayOfMonth(item.day_of_month?.toString() || "1")
    setAccountId(item.account_id || "")
    setStartDate(item.start_date)
    setDialogOpen(true)
  }

  async function deleteRecurring(id: string) {
    if (!confirm("Удалить повторяющуюся транзакцию?")) return
    await db.recurringTransactions.delete(id)
    loadData()
  }

  function resetForm() {
    setEditingId(null)
    setTitle("")
    setAmount("")
    setType("expense")
    setCategory("")
    setFrequency("monthly")
    setDayOfMonth("1")
    setStartDate(new Date().toISOString().split("T")[0])
    setDialogOpen(false)
  }

  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Загрузка...</div>
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Повторяющиеся операции
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Редактировать" : "Новая повторяющаяся операция"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Type */}
              <div className="flex gap-2">
                <Button
                  variant={type === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("expense")}
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Расход
                </Button>
                <Button
                  variant={type === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("income")}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Доход
                </Button>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label>Название</Label>
                <Input
                  placeholder="Аренда, Зарплата..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Сумма</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label>Периодичность</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(frequencyLabels).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={frequency === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFrequency(key as typeof frequency)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Day of Month (for monthly) */}
              {frequency === "monthly" && (
                <div className="space-y-2">
                  <Label>День месяца</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-20"
                  />
                </div>
              )}

              {/* Account */}
              {accounts.length > 0 && (
                <div className="space-y-2">
                  <Label>Аккаунт</Label>
                  <select
                    className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Дата начала</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* Save */}
              <Button className="w-full" onClick={saveRecurring}>
                {editingId ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      {recurring.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Нет повторяющихся операций
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recurring.map((item) => {
            const account = accounts.find((a) => a.id === item.account_id)
            const nextDue = calculateNextDue(item)

            return (
              <Card key={item.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      item.type === "expense" ? "bg-red-500/10" : "bg-green-500/10"
                    )}
                  >
                    {item.type === "expense" ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {frequencyLabels[item.frequency]} • След: {nextDue}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "font-medium",
                        item.type === "expense" ? "text-red-500" : "text-green-500"
                      )}
                    >
                      {item.type === "expense" ? "-" : "+"}
                      {item.amount.toLocaleString()} ₽
                    </div>
                    {account && <div className="text-xs text-muted-foreground">{account.name}</div>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editRecurring(item)}
                      aria-label="Редактировать транзакцию"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecurring(item.id)}
                      aria-label="Удалить транзакцию"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
