"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  Plus,
  Trash2,
  Edit,
  Calendar,
  Wallet,
  TrendingDown,
  TrendingUp,
  Repeat,
  Calendar as CalendarIcon,
} from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { db, initializeDatabase } from "@/lib/db"
import type { RecurringTransaction, Account } from "@/types"

export function RecurringTransactions() {
  const t = useTranslations("finance.recurring")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS
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
    if (!confirm(t("deleteConfirm"))) return
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
    return <div className="text-center py-4 text-muted-foreground">{t("loading")}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            <div>
              <CardTitle>{t("title")}</CardTitle>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="action-sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                {t("add")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? t("edit") : t("title")}</DialogTitle>
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
                    {t("expense")}
                  </Button>
                  <Button
                    variant={type === "income" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setType("income")}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {t("income")}
                  </Button>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label>{t("form.title")}</Label>
                  <Input
                    placeholder={t("form.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label>{t("form.amount")}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                {/* Frequency */}
                <div className="space-y-2">
                  <Label>{t("form.frequency")}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"].map(
                      (key) => (
                        <Button
                          key={key}
                          variant={frequency === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFrequency(key as typeof frequency)}
                        >
                          {t(`frequency.${key}`)}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {/* Day of Month (for monthly) */}
                {frequency === "monthly" && (
                  <div className="space-y-2">
                    <Label>{t("form.dayOfMonth")}</Label>
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
                    <Label>{t("form.account")}</Label>
                    <Combobox
                      options={accounts.map((acc) => ({ id: acc.id, label: acc.name }))}
                      value={accountId}
                      onChange={(value) => setAccountId(value as string)}
                      allowCustom={false}
                      searchable={false}
                    />
                  </div>
                )}

                {/* Start Date */}
                <div className="space-y-2">
                  <Label>{t("form.startDate")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(new Date(startDate), "LLL dd, y", { locale: dateFnsLocale })
                        ) : (
                          <span>{t("form.startDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" side="bottom" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={(date) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                        initialFocus
                        locale={dateFnsLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Save */}
                <Button className="w-full" onClick={saveRecurring}>
                  {editingId ? t("form.save") : t("form.create")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* List */}
        {recurring.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{t("empty")}</div>
        ) : (
          <div className="space-y-2">
            {recurring.map((item) => {
              const account = accounts.find((a) => a.id === item.account_id)
              const nextDue = calculateNextDue(item)

              return (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border">
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
                      {t(`frequency.${item.frequency}`)} • {t("nextDue")}: {nextDue}
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
                      {item.amount.toLocaleString()} {account?.currency || "₽"}
                    </div>
                    {account && <div className="text-xs text-muted-foreground">{account.name}</div>}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => editRecurring(item)}
                      aria-label={t("edit")}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecurring(item.id)}
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
