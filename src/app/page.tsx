"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Utensils,
  Dumbbell,
  Wallet,
  BookOpen,
  ChefHat,
  Timer,
  DollarSign,
  Droplet,
  Moon,
  Smile,
  Scale,
  Target,
  Flame,
  Bell,
  Copy,
  TrendingUp,
} from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { StatCardSkeleton, ListSkeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { StreakWidget } from "@/components/shared/streak-widget"
import { Onboarding } from "@/components/shared/onboarding"
import { db, initializeDatabase } from "@/lib/db"
import type { Log, Goal, WaterLog, HabitLog } from "@/types"

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

// Tracker links
const trackerLinks = [
  {
    href: "/water",
    label: "Вода",
    icon: Droplet,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    href: "/sleep",
    label: "Сон",
    icon: Moon,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    href: "/mood",
    label: "Настроение",
    icon: Smile,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    href: "/body",
    label: "Измерения",
    icon: Scale,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    href: "/habits",
    label: "Привычки",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    href: "/goals",
    label: "Цели",
    icon: Target,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    href: "/reminders",
    label: "Напоминания",
    icon: Bell,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    href: "/templates",
    label: "Шаблоны",
    icon: Copy,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
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

// Круговой прогресс-бар
function CircularProgress({
  value,
  max,
  size = 80,
  strokeWidth = 6,
  color = "stroke-primary",
  bgColor = "stroke-muted",
  children,
}: {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const progress = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference - progress * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${color} transition-all duration-500`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  )
}

// Виджет прогресса цели
function GoalProgressWidget({
  goal,
  current,
  icon: Icon,
  color,
  unit,
}: {
  goal: number
  current: number
  icon: React.ElementType
  color: string
  unit: string
}) {
  const percentage = goal > 0 ? Math.round((current / goal) * 100) : 0
  const isComplete = current >= goal

  return (
    <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50">
      <CircularProgress
        value={current}
        max={goal}
        size={70}
        strokeWidth={5}
        color={isComplete ? "stroke-green-500" : color}
      >
        <Icon
          className={`h-5 w-5 ${isComplete ? "text-green-500" : color.replace("stroke-", "text-")}`}
        />
      </CircularProgress>
      <div className="text-center">
        <div className="text-sm font-semibold">
          {current.toLocaleString()} / {goal.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">{unit}</div>
        <div
          className={`text-xs font-medium ${isComplete ? "text-green-500" : "text-muted-foreground"}`}
        >
          {percentage}%
        </div>
      </div>
    </div>
  )
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

  // Цели на сегодня
  const [goals, setGoals] = useState<{
    calories: { target: number; current: number }
    water: { target: number; current: number }
    workout: { target: number; current: number }
    habits: { completed: number; total: number }
  }>({
    calories: { target: 2000, current: 0 },
    water: { target: 2000, current: 0 },
    workout: { target: 30, current: 0 },
    habits: { completed: 0, total: 0 },
  })

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        const today = new Date().toISOString().split("T")[0]

        // Оптимизированные запросы с использованием индексов
        const [
          logsCount,
          itemsCount,
          books,
          recipes,
          todayLogs,
          recentLogs,
          activeGoals,
          waterLogs,
          habitLogs,
        ] = await Promise.all([
          db.logs.count(),
          db.items.count(),
          db.books.count(),
          db.content.where("type").equals("recipe").count(),
          // Используем индекс date для фильтрации по сегодня
          db.logs.where("date").startsWith(today).toArray(),
          // Используем orderBy + reverse вместо сортировки на клиенте
          db.logs.orderBy("date").reverse().limit(5).toArray(),
          // Загружаем активные цели
          db.goals.where("is_active").equals(1).toArray(),
          // Загружаем воду за сегодня
          db.waterLogs.where("date").equals(today).toArray(),
          // Загружаем привычки за сегодня
          db.habitLogs.where("date").equals(today).toArray(),
        ])

        // Подсчитываем статистику за сегодня
        let todayCalories = 0
        let todayWorkoutMinutes = 0
        let todayExpenses = 0

        todayLogs.forEach((log) => {
          if (log.type === "food" && log.metadata?.calories) {
            todayCalories += log.metadata.calories
          }
          if (log.type === "workout" && log.metadata?.duration) {
            todayWorkoutMinutes += log.metadata.duration
          }
          if (log.type === "finance" && log.value && log.metadata?.finance_type !== "income") {
            todayExpenses += log.value
          }
        })

        // Подсчитываем воду
        const todayWater = waterLogs.reduce((sum, log) => sum + (log.amount_ml || 0), 0)

        // Получаем цели из базы или используем дефолтные
        const caloriesGoal = activeGoals.find((g) => g.type === "calories")
        const waterGoal = activeGoals.find((g) => g.type === "water")
        const workoutGoal = activeGoals.find((g) => g.type === "workout")

        setGoals({
          calories: {
            target: caloriesGoal?.target_value || 2000,
            current: todayCalories,
          },
          water: {
            target: waterGoal?.target_value || 2000,
            current: todayWater,
          },
          workout: {
            target: workoutGoal?.target_value || 30,
            current: todayWorkoutMinutes,
          },
          habits: {
            completed: habitLogs.filter((h) => h.completed).length,
            total: habitLogs.length,
          },
        })

        setStats({
          logs: logsCount,
          items: itemsCount,
          books: books,
          recipes: recipes,
          todayLogs: todayLogs.length,
          todayCalories,
          todayWorkoutMinutes,
          todayExpenses,
        })
        setRecentLogs(recentLogs)
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
      <Onboarding />
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Goals Progress Widgets */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Прогресс на сегодня</h2>
          <div className="grid grid-cols-3 gap-3">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              <>
                <GoalProgressWidget
                  goal={goals.calories.target}
                  current={goals.calories.current}
                  icon={Utensils}
                  color="stroke-orange-500"
                  unit="ккал"
                />
                <GoalProgressWidget
                  goal={goals.water.target}
                  current={goals.water.current}
                  icon={Droplet}
                  color="stroke-blue-500"
                  unit="мл"
                />
                <GoalProgressWidget
                  goal={goals.workout.target}
                  current={goals.workout.current}
                  icon={Dumbbell}
                  color="stroke-purple-500"
                  unit="мин"
                />
              </>
            )}
          </div>
        </div>

        {/* Today Stats */}
        <div className="grid grid-cols-3 gap-3">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Streak Widget */}
        {!isLoading && <StreakWidget />}

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

        {/* Database Stats */}
        <div className="grid grid-cols-4 gap-2">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Trackers */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Трекеры</h2>
          <div className="grid grid-cols-3 gap-2">
            {trackerLinks.map((tracker) => (
              <Link
                key={tracker.href}
                href={tracker.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted hover:bg-accent transition-colors"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${tracker.bgColor}`}
                >
                  <tracker.icon className={`h-5 w-5 ${tracker.color}`} />
                </div>
                <span className="text-xs font-medium">{tracker.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Последняя активность</h2>
          {isLoading ? (
            <ListSkeleton count={3} />
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
      </div>
    </AppLayout>
  )
}
