"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Utensils, Dumbbell, Wallet, Search } from "@/lib/icons"
import type { LucideIcon } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BudgetManager } from "@/components/finance"
import { db, initializeDatabase } from "@/lib/db"
import { LogType } from "@/types"
import type { Log } from "@/types"

const logTypes: { type: LogType; label: string; icon: LucideIcon }[] = [
  { type: LogType.FOOD, label: "Питание", icon: Utensils },
  { type: LogType.WORKOUT, label: "Тренировки", icon: Dumbbell },
  { type: LogType.FINANCE, label: "Финансы", icon: Wallet },
]

export default function LogsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [logs, setLogs] = useState<Log[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState<LogType | "all">("all")

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
    food: "Питание",
    workout: "Тренировка",
    finance: "Финансы",
  }

  const typeColors: Record<string, string> = {
    food: "bg-orange-500/10 text-orange-600",
    workout: "bg-blue-500/10 text-blue-600",
    finance: "bg-green-500/10 text-green-600",
    finance_income: "bg-emerald-500/10 text-emerald-600",
    finance_expense: "bg-red-500/10 text-red-600",
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

  // Статистика
  const stats = {
    total: logs.length,
    food: logs.filter((l) => l.type === LogType.FOOD).length,
    workout: logs.filter((l) => l.type === LogType.WORKOUT).length,
    finance: logs.filter((l) => l.type === LogType.FINANCE).length,
  }

  return (
    <AppLayout title="Учет">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.food}</div>
            <div className="text-xs text-muted-foreground">Питание</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.workout}</div>
            <div className="text-xs text-muted-foreground">Тренировки</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.finance}</div>
            <div className="text-xs text-muted-foreground">Финансы</div>
          </Card>
        </div>

        {/* Type Filters */}
        <Tabs value={activeType} onValueChange={(value) => setActiveType(value as LogType | "all")}>
          <TabsList className="grid grid-cols-4 w-full h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
              Все
            </TabsTrigger>
            {logTypes.map((lt) => (
              <TabsTrigger
                key={lt.type}
                value={lt.type}
                className="text-xs sm:text-sm px-2 sm:px-4 py-2"
              >
                <lt.icon className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">{lt.label}</span>
                <span className="sm:hidden text-[10px]">{lt.label.slice(0, 4)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск записей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Budget Manager - показываем только на вкладке Финансы */}
        {activeType === LogType.FINANCE && <BudgetManager />}

        {/* Logs List */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {logs.length === 0 ? "Нет записей. Начните вести учёт!" : "Ничего не найдено"}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredLogs.map((log) => {
              const TypeIcon = getTypeIcon(log.type)
              // Определяем цвет для финансов по типу транзакции
              let colorKey: string = log.type
              if (log.type === "finance" && log.metadata?.finance_type === "income") {
                colorKey = "finance_income"
              } else if (log.type === "finance" && log.metadata?.finance_type === "expense") {
                colorKey = "finance_expense"
              }
              return (
                <Link key={log.id} href={`/logs/${log.type}/${log.id}`}>
                  <Card className="hover:bg-accent transition-colors">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${typeColors[colorKey] || "bg-muted"}`}
                      >
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{log.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[log.type] || log.type} •{" "}
                          {new Date(log.date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {log.value !== undefined && (
                        <div className="text-sm font-medium">
                          {log.type === "finance" ? `${log.value.toLocaleString()} ₽` : log.value}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
