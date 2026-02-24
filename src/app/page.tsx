"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Utensils,
  Dumbbell,
  Wallet,
  Pill,
  BookOpen,
  ChefHat,
  TrendingUp,
  Plus,
  Timer,
  DollarSign,
} from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { db, initializeDatabase } from "@/lib/db"
import type { Log } from "@/types"

// Quick action cards data
const quickActions = [
  {
    href: "/logs/food/new",
    label: "Питание",
    icon: Utensils,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    href: "/logs/workout/new",
    label: "Тренировка",
    icon: Dumbbell,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    href: "/logs/finance/new",
    label: "Финансы",
    icon: Wallet,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    href: "/books/new",
    label: "Книга",
    icon: BookOpen,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    href: "/recipes/new",
    label: "Рецепт",
    icon: ChefHat,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
]

// Navigation cards data
const sections = [
  {
    href: "/logs",
    title: "Учёт",
    description: "Питание, тренировки, финансы",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    href: "/items",
    title: "Каталог",
    description: "Витамины, лекарства, травы, продукты",
    icon: Pill,
    color: "text-purple-500",
  },
  {
    href: "/books",
    title: "Книги",
    description: "Библиотека и чтение",
    icon: BookOpen,
    color: "text-amber-500",
  },
  {
    href: "/recipes",
    title: "Рецепты",
    description: "Кулинарная книга",
    icon: ChefHat,
    color: "text-rose-500",
  },
]

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

const getTypeIcon = (type: string) => {
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

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    logs: 0,
    items: 0,
    books: 0,
    recipes: 0,
    todayLogs: 0,
    todayCalories: 0,
    todayWorkoutMinutes: 0,
    todayExpenses: 0,
  })
  const [recentLogs, setRecentLogs] = useState<Log[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        
        const [logs, items, books, recipes] = await Promise.all([
          db.logs.toArray(),
          db.items.toArray(),
          db.books.count(),
          db.content.where("type").equals("recipe").count(),
        ])
        
        const today = new Date().toISOString().split("T")[0]
        const todayLogs = logs.filter((log) => log.date.startsWith(today))
        
        // Подсчитываем статистику за сегодня
        let todayCalories = 0
        let todayWorkoutMinutes = 0
        let todayExpenses = 0
        
        todayLogs.forEach((log) => {
          // @ts-expect-error - metadata имеет разные типы для разных log.type
          if (log.type === "food" && log.metadata?.calories) {
            // @ts-expect-error - metadata имеет разные типы для разных log.type
            todayCalories += log.metadata.calories
          }
          // @ts-expect-error - metadata имеет разные типы для разных log.type
          if (log.type === "workout" && log.metadata?.duration) {
            // @ts-expect-error - metadata имеет разные типы для разных log.type
            todayWorkoutMinutes += log.metadata.duration
          }
          // @ts-expect-error - metadata имеет разные типы для разных log.type
          if (log.type === "finance" && log.value && log.metadata?.finance_type !== "income") {
            todayExpenses += log.value
          }
        })
        
        // Сортируем по дате и берём последние 5 записей
        const sortedLogs = [...logs].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        const recent = sortedLogs.slice(0, 5)
        
        setStats({
          logs: logs.length,
          items: items.length,
          books: books,
          recipes: recipes,
          todayLogs: todayLogs.length,
          todayCalories,
          todayWorkoutMinutes,
          todayExpenses,
        })
        setRecentLogs(recent)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  return (
    <AppLayout title="Life OS">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Utensils className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-muted-foreground">Ккал</span>
              </div>
              <div className="text-xl font-bold">{stats.todayCalories || "-"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Timer className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-muted-foreground">Мин</span>
              </div>
              <div className="text-xl font-bold">{stats.todayWorkoutMinutes || "-"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">Расход</span>
              </div>
              <div className="text-xl font-bold">
                {stats.todayExpenses ? `${stats.todayExpenses.toLocaleString()}₽` : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
          <div className="flex justify-center gap-3 flex-wrap">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.bgColor}`}
                >
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="hover:bg-accent transition-colors h-full">
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-muted`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl bg-muted text-center">
            <div className="text-lg font-bold">{stats.logs}</div>
            <div className="text-xs text-muted-foreground">Записей</div>
          </div>
          <div className="p-3 rounded-xl bg-muted text-center">
            <div className="text-lg font-bold">{stats.items}</div>
            <div className="text-xs text-muted-foreground">Каталог</div>
          </div>
          <div className="p-3 rounded-xl bg-muted text-center">
            <div className="text-lg font-bold">{stats.books}</div>
            <div className="text-xs text-muted-foreground">Книг</div>
          </div>
          <div className="p-3 rounded-xl bg-muted text-center">
            <div className="text-lg font-bold">{stats.recipes}</div>
            <div className="text-xs text-muted-foreground">Рецептов</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Последняя активность</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Загрузка...
              </CardContent>
            </Card>
          ) : stats.logs === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Нет записей. Начните вести учёт!
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {recentLogs.map((log) => {
                const TypeIcon = getTypeIcon(log.type)
                // Определяем цвет для финансов по типу транзакции
                let colorKey = log.type
                // @ts-expect-error - metadata имеет разные типы
                if (log.type === "finance" && log.metadata?.finance_type === "income") {
                  colorKey = "finance_income"
                // @ts-expect-error - metadata имеет разные типы
                } else if (log.type === "finance" && log.metadata?.finance_type === "expense") {
                  colorKey = "finance_expense"
                }
                return (
                  <Link key={log.id} href={`/logs/${log.type}/${log.id}`}>
                    <Card className="hover:bg-accent transition-colors">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${typeColors[colorKey] || 'bg-muted'}`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{log.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {typeLabels[log.type] || log.type} • {new Date(log.date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {log.value !== undefined && (
                          <div className="text-sm font-medium">
                            {log.type === 'finance' ? `${log.value.toLocaleString()} ₽` : log.value}
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
      </div>
    </AppLayout>
  )
}