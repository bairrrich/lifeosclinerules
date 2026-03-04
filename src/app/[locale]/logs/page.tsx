"use client"

import { useEffect, useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Utensils, Dumbbell, Wallet, Search } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetManager } from "@/components/finance"
import { db, initializeDatabase, getStaticEntityTranslation } from "@/lib/db"
import { LogType } from "@/types"
import type { Log } from "@/types"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { logTypeColors, statColors } from "@/lib/theme-colors"

export default function LogsPage() {
  const t = useTranslations("logs")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<LogType | "all">("all")

  // Локализация заголовка финансовой операции
  const localizeFinanceTitle = (title: string): string => {
    const parts = title.split(" - ")
    const translatedParts = parts.map((part, index) => {
      if (part === "Transfer") return t("types.transfer")
      if (index === 0) {
        // Category
        return getStaticEntityTranslation("categories", part, locale, "finance")
      } else {
        // Subcategory or item
        return getStaticEntityTranslation("financeSubcategories", part, locale)
      }
    })
    return translatedParts.join(" - ")
  }

  const logTypes = [
    { type: LogType.FOOD, label: t("types.food"), icon: Utensils },
    { type: LogType.WORKOUT, label: t("types.workout"), icon: Dumbbell },
    { type: LogType.FINANCE, label: t("types.finance"), icon: Wallet },
  ]

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const allLogs = await db.logs.orderBy("date").reverse().toArray()
        setLogs(allLogs)
      } catch (error) {
        console.error("Failed to load logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeType === "all" || log.type === activeType
    return matchesSearch && matchesType
  })

  const typeLabels: Record<string, string> = {
    food: t("types.food"),
    workout: t("types.workout"),
    finance: t("types.finance"),
  }

  const typeColors: Record<string, string> = {
    food: logTypeColors.food.DEFAULT,
    workout: logTypeColors.workout.DEFAULT,
    finance: logTypeColors.finance.DEFAULT,
    finance_income: logTypeColors.finance_income.DEFAULT,
    finance_expense: logTypeColors.finance_expense.DEFAULT,
    finance_transfer: logTypeColors.finance_transfer.DEFAULT,
  }

  const getTypeIcon = (type: LogType): LucideIcon => {
    switch (type) {
      case "food":
        return Utensils
      case "workout":
        return Dumbbell
      case "finance":
        return Wallet
      default:
        return Utensils
    }
  }

  // Статистика с useMemo для оптимизации
  const stats = useMemo(
    () => ({
      total: logs.length,
      food: logs.filter((l) => l.type === LogType.FOOD).length,
      workout: logs.filter((l) => l.type === LogType.WORKOUT).length,
      finance: logs.filter((l) => l.type === LogType.FINANCE).length,
    }),
    [logs]
  )

  // Группировка по периодам (месяцам)
  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce(
      (acc, log) => {
        const month = log.date.substring(0, 7) // "2024-03"
        if (!acc[month]) acc[month] = []
        acc[month].push(log)
        return acc
      },
      {} as Record<string, Log[]>
    )
  }, [filteredLogs])

  // Сортировка периодов (новые сначала)
  const sortedPeriods = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a))

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{t("stats.total")}</div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className={cn("text-xl sm:text-2xl font-bold", statColors.food)}>{stats.food}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{t("types.food")}</div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className={cn("text-xl sm:text-2xl font-bold", statColors.workout)}>
              {stats.workout}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{t("types.workout")}</div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className={cn("text-xl sm:text-2xl font-bold", statColors.finance)}>
              {stats.finance}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{t("types.finance")}</div>
          </Card>
        </div>

        {/* Type Filters */}
        <Tabs
          value={activeType}
          onValueChange={(value) => setActiveType(value as LogType | "all")}
          aria-label={t("filters.typeLabel")}
        >
          <TabsList
            className="grid grid-cols-4 w-full h-auto"
            role="tablist"
            aria-label={t("filters.typeLabel")}
          >
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm px-2 sm:px-4 py-2"
              role="tab"
              aria-selected={activeType === "all"}
              aria-controls="panel-all"
              id="tab-all"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">{t("filters.all")}</span>
            </TabsTrigger>
            {logTypes.map((lt) => (
              <TabsTrigger
                key={lt.type}
                value={lt.type}
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
                role="tab"
                aria-selected={activeType === lt.type}
                aria-controls={`panel-${lt.type}`}
                id={`tab-${lt.type}`}
              >
                <lt.icon className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">{lt.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Budget Manager - показываем только на вкладке Финансы */}
        {activeType === LogType.FINANCE && <BudgetManager />}

        {/* Logs List with Period Grouping */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {tCommon("loading")}
            </CardContent>
          </Card>
        ) : sortedPeriods.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {logs.length === 0 ? t("empty.noLogs") : tCommon("noResults")}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-6">
            {sortedPeriods.map((period) => {
              const periodLogs = groupedLogs[period]
              const periodDate = new Date(period + "-01")
              const periodLabel = periodDate.toLocaleDateString(locale, {
                year: "numeric",
                month: "long",
              })

              return (
                <div key={period} className="space-y-2">
                  <h3 className="text-lg font-semibold sticky top-0 bg-background/80 backdrop-blur-sm py-2 z-10">
                    {periodLabel}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {periodLogs.map((log) => {
                      const TypeIcon = getTypeIcon(log.type)
                      // Определяем цвет для финансов по типу транзакции
                      let colorKey: string = log.type
                      if (log.type === "finance" && log.metadata?.finance_type === "income") {
                        colorKey = "finance_income"
                      } else if (
                        log.type === "finance" &&
                        log.metadata?.finance_type === "expense"
                      ) {
                        colorKey = "finance_expense"
                      } else if (
                        log.type === "finance" &&
                        log.metadata?.finance_type === "transfer"
                      ) {
                        colorKey = "finance_transfer"
                      }
                      return (
                        <Link
                          key={log.id}
                          href={`/logs/${log.type}/${log.id}`}
                          aria-label={`Запись: ${log.title}`}
                        >
                          <Card className="hover:bg-accent transition-colors">
                            <CardContent className="p-3 flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-xl ${typeColors[colorKey] || "bg-muted"}`}
                                aria-hidden="true"
                              >
                                <TypeIcon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">
                                  {log.type === "finance"
                                    ? localizeFinanceTitle(log.title)
                                    : log.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {typeLabels[log.type] || log.type} •{" "}
                                  {new Date(log.date).toLocaleDateString(locale, {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                  {" | "}
                                  {new Date(log.date).toLocaleTimeString(locale, {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              {log.value !== undefined && (
                                <div
                                  className={`text-sm font-medium ${
                                    log.type === "finance" && log.metadata
                                      ? (log.metadata as any).finance_type === "income"
                                        ? "text-[oklch(0.74_0.30_138)]"
                                        : (log.metadata as any).finance_type === "expense"
                                          ? "text-destructive"
                                          : "text-[oklch(0.65_0.25_260)]"
                                      : ""
                                  }`}
                                >
                                  {log.type === "finance"
                                    ? `${log.value.toLocaleString()} ₽`
                                    : log.value}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
