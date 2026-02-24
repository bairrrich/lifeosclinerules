"use client"

import { useEffect, useState } from "react"
import { format, subDays, eachDayOfInterval } from "date-fns"
import { ru } from "date-fns/locale"
import { Utensils, Dumbbell, Wallet, TrendingUp, TrendingDown } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import type { Log, FoodMetadata, WorkoutMetadata, FinanceMetadata } from "@/types"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Цвета для графиков
const COLORS = {
  calories: "#f97316",
  protein: "#3b82f6",
  fat: "#eab308",
  carbs: "#22c55e",
  income: "#22c55e",
  expense: "#ef4444",
  workout: "#8b5cf6",
}

const PIE_COLORS = ["#f97316", "#3b82f6", "#eab308", "#22c55e", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [foodLogs, setFoodLogs] = useState<Log[]>([])
  const [workoutLogs, setWorkoutLogs] = useState<Log[]>([])
  const [financeLogs, setFinanceLogs] = useState<Log[]>([])
  const [dateRange, setDateRange] = useState<"7" | "14" | "30">("7")

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const [allFood, allWorkout, allFinance] = await Promise.all([
          db.logs.where("type").equals("food").toArray(),
          db.logs.where("type").equals("workout").toArray(),
          db.logs.where("type").equals("finance").toArray(),
        ])
        setFoodLogs(allFood)
        setWorkoutLogs(allWorkout)
        setFinanceLogs(allFinance)
      } catch (error) {
        console.error("Failed to load analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Получаем даты для выбранного периода
  const getDaysInRange = () => {
    const days = parseInt(dateRange)
    const end = new Date()
    const start = subDays(end, days - 1)
    return eachDayOfInterval({ start, end })
  }

  // Данные для графика калорий по дням
  const getCaloriesByDay = () => {
    const days = getDaysInRange()
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd")
      const dayLogs = foodLogs.filter((log) => log.date.startsWith(dayStr))
      const totalCalories = dayLogs.reduce((sum, log) => {
        const metadata = log.metadata as FoodMetadata | undefined
        return sum + (metadata?.calories || 0)
      }, 0)
      return {
        date: format(day, "dd.MM", { locale: ru }),
        calories: totalCalories,
      }
    })
  }

  // Данные для графика БЖУ по дням
  const getMacrosByDay = () => {
    const days = getDaysInRange()
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd")
      const dayLogs = foodLogs.filter((log) => log.date.startsWith(dayStr))
      const totals = dayLogs.reduce(
        (acc, log) => {
          const metadata = log.metadata as FoodMetadata | undefined
          return {
            protein: acc.protein + (metadata?.protein || 0),
            fat: acc.fat + (metadata?.fat || 0),
            carbs: acc.carbs + (metadata?.carbs || 0),
          }
        },
        { protein: 0, fat: 0, carbs: 0 }
      )
      return {
        date: format(day, "dd.MM", { locale: ru }),
        ...totals,
      }
    })
  }

  // Данные для графика тренировок
  const getWorkoutStats = () => {
    const days = getDaysInRange()
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd")
      const dayLogs = workoutLogs.filter((log) => log.date.startsWith(dayStr))
      const totalDuration = dayLogs.reduce((sum, log) => {
        const metadata = log.metadata as WorkoutMetadata | undefined
        return sum + (metadata?.duration || 0)
      }, 0)
      return {
        date: format(day, "dd.MM", { locale: ru }),
        duration: totalDuration,
        count: dayLogs.length,
      }
    })
  }

  // Данные для графика финансов
  const getFinanceByDay = () => {
    const days = getDaysInRange()
    return days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd")
      const dayLogs = financeLogs.filter((log) => log.date.startsWith(dayStr))
      const totals = dayLogs.reduce(
        (acc, log) => {
          const metadata = log.metadata as FinanceMetadata | undefined
          const amount = log.value || 0
          if (metadata?.finance_type === "income") {
            return { ...acc, income: acc.income + amount }
          } else if (metadata?.finance_type === "expense") {
            return { ...acc, expense: acc.expense + amount }
          }
          return acc
        },
        { income: 0, expense: 0 }
      )
      return {
        date: format(day, "dd.MM", { locale: ru }),
        income: totals.income,
        expense: totals.expense,
      }
    })
  }

  // Общая статистика
  const getTotalStats = () => {
    const days = getDaysInRange()
    const startDate = format(days[0], "yyyy-MM-dd")

    const periodFoodLogs = foodLogs.filter((log) => log.date >= startDate)
    const periodWorkoutLogs = workoutLogs.filter((log) => log.date >= startDate)
    const periodFinanceLogs = financeLogs.filter((log) => log.date >= startDate)

    const totalCalories = periodFoodLogs.reduce((sum, log) => {
      const metadata = log.metadata as FoodMetadata | undefined
      return sum + (metadata?.calories || 0)
    }, 0)

    const totalWorkoutDuration = periodWorkoutLogs.reduce((sum, log) => {
      const metadata = log.metadata as WorkoutMetadata | undefined
      return sum + (metadata?.duration || 0)
    }, 0)

    const totalIncome = periodFinanceLogs.reduce((sum, log) => {
      const metadata = log.metadata as FinanceMetadata | undefined
      return metadata?.finance_type === "income" ? sum + (log.value || 0) : sum
    }, 0)

    const totalExpense = periodFinanceLogs.reduce((sum, log) => {
      const metadata = log.metadata as FinanceMetadata | undefined
      return metadata?.finance_type === "expense" ? sum + (log.value || 0) : sum
    }, 0)

    return {
      calories: Math.round(totalCalories),
      workouts: periodWorkoutLogs.length,
      workoutDuration: totalWorkoutDuration,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
    }
  }

  // Распределение по категориям питания
  const getFoodByCategory = () => {
    const categoryTotals: Record<string, number> = {}
    foodLogs.forEach((log) => {
      const category = log.title || "Другое"
      const metadata = log.metadata as FoodMetadata | undefined
      categoryTotals[category] = (categoryTotals[category] || 0) + (metadata?.calories || 0)
    })
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }

  const stats = getTotalStats()

  if (isLoading) {
    return (
      <AppLayout title="Аналитика">
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              Загрузка...
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Аналитика">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2">
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as "7" | "14" | "30")}>
            <TabsList>
              <TabsTrigger value="7">7 дней</TabsTrigger>
              <TabsTrigger value="14">14 дней</TabsTrigger>
              <TabsTrigger value="30">30 дней</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Utensils className="h-4 w-4" />
                <span className="text-sm">Калории</span>
              </div>
              <div className="text-2xl font-bold">{stats.calories.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">за период</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Dumbbell className="h-4 w-4" />
                <span className="text-sm">Тренировки</span>
              </div>
              <div className="text-2xl font-bold">{stats.workouts}</div>
              <div className="text-xs text-muted-foreground">{stats.workoutDuration} мин</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Доход</span>
              </div>
              <div className="text-2xl font-bold text-green-500">
                {stats.income.toLocaleString()} ₽
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Расход</span>
              </div>
              <div className="text-2xl font-bold text-red-500">
                {stats.expense.toLocaleString()} ₽
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="food">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="food">
              <Utensils className="h-4 w-4 mr-2" />
              Питание
            </TabsTrigger>
            <TabsTrigger value="workout">
              <Dumbbell className="h-4 w-4 mr-2" />
              Тренировки
            </TabsTrigger>
            <TabsTrigger value="finance">
              <Wallet className="h-4 w-4 mr-2" />
              Финансы
            </TabsTrigger>
          </TabsList>

          {/* Food Charts */}
          <TabsContent value="food" className="space-y-4 mt-4">
            {/* Calories Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Калории по дням</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getCaloriesByDay()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke={COLORS.calories}
                        fill={COLORS.calories}
                        fillOpacity={0.2}
                        name="Калории"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Macros Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">БЖУ по дням</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMacrosByDay()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="protein"
                        stroke={COLORS.protein}
                        strokeWidth={2}
                        name="Белки"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="fat"
                        stroke={COLORS.fat}
                        strokeWidth={2}
                        name="Жиры"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="carbs"
                        stroke={COLORS.carbs}
                        strokeWidth={2}
                        name="Углеводы"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">По категориям</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getFoodByCategory()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getFoodByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {getFoodByCategory().map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workout Charts */}
          <TabsContent value="workout" className="space-y-4 mt-4">
            {/* Duration Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Длительность тренировок (мин)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWorkoutStats()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="duration" fill={COLORS.workout} name="Минуты" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Workout Count */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Количество тренировок</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getWorkoutStats()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" fill="#10b981" name="Тренировки" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Finance Charts */}
          <TabsContent value="finance" className="space-y-4 mt-4">
            {/* Income/Expense Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Доходы и расходы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={getFinanceByDay()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => `${Number(value).toLocaleString()} ₽`}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke={COLORS.income}
                        fill={COLORS.income}
                        fillOpacity={0.2}
                        name="Доход"
                      />
                      <Area
                        type="monotone"
                        dataKey="expense"
                        stroke={COLORS.expense}
                        fill={COLORS.expense}
                        fillOpacity={0.2}
                        name="Расход"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Баланс за период</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Доходы</div>
                    <div className="text-xl font-bold text-green-500">
                      +{stats.income.toLocaleString()} ₽
                    </div>
                  </div>
                  <div className="text-2xl text-muted-foreground">−</div>
                  <div>
                    <div className="text-sm text-muted-foreground">Расходы</div>
                    <div className="text-xl font-bold text-red-500">
                      −{stats.expense.toLocaleString()} ₽
                    </div>
                  </div>
                  <div className="text-2xl text-muted-foreground">=</div>
                  <div>
                    <div className="text-sm text-muted-foreground">Баланс</div>
                    <div className={`text-xl font-bold ${stats.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {stats.balance >= 0 ? "+" : ""}{stats.balance.toLocaleString()} ₽
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}