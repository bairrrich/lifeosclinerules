"use client"

import { useEffect, useState, useMemo } from "react"
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

  // Мемоизированные данные для выбранного периода
  const daysInRange = useMemo(() => {
    const days = parseInt(dateRange)
    const end = new Date()
    const start = subDays(end, days - 1)
    return eachDayOfInterval({ start, end })
  }, [dateRange])

  // Мемоизированные данные для графика калорий
  const caloriesData = useMemo(() => {
    return daysInRange.map((day) => {
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
  }, [daysInRange, foodLogs])

  // Мемоизированные данные для БЖУ
  const macrosData = useMemo(() => {
    return daysInRange.map((day) => {
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
  }, [daysInRange, foodLogs])

  // Мемоизированные данные для тренировок
  const workoutData = useMemo(() => {
    return daysInRange.map((day) => {
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
  }, [daysInRange, workoutLogs])

  // Мемоизированные данные для финансов
  const financeData = useMemo(() => {
    return daysInRange.map((day) => {
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
  }, [daysInRange, financeLogs])

  // Мемоизированная общая статистика с сравнением периодов
  const stats = useMemo(() => {
    const days = parseInt(dateRange)
    const startDate = format(daysInRange[0], "yyyy-MM-dd")
    const prevStartDate = format(subDays(daysInRange[0], days), "yyyy-MM-dd")
    const prevEndDate = format(subDays(daysInRange[0], 1), "yyyy-MM-dd")

    // Текущий период
    const periodFoodLogs = foodLogs.filter((log) => log.date >= startDate)
    const periodWorkoutLogs = workoutLogs.filter((log) => log.date >= startDate)
    const periodFinanceLogs = financeLogs.filter((log) => log.date >= startDate)

    // Предыдущий период
    const prevPeriodFoodLogs = foodLogs.filter((log) => 
      log.date >= prevStartDate && log.date <= prevEndDate
    )
    const prevPeriodWorkoutLogs = workoutLogs.filter((log) => 
      log.date >= prevStartDate && log.date <= prevEndDate
    )
    const prevPeriodFinanceLogs = financeLogs.filter((log) => 
      log.date >= prevStartDate && log.date <= prevEndDate
    )

    // Текущие значения
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

    // Предыдущие значения
    const prevTotalCalories = prevPeriodFoodLogs.reduce((sum, log) => {
      const metadata = log.metadata as FoodMetadata | undefined
      return sum + (metadata?.calories || 0)
    }, 0)

    const prevTotalWorkoutDuration = prevPeriodWorkoutLogs.reduce((sum, log) => {
      const metadata = log.metadata as WorkoutMetadata | undefined
      return sum + (metadata?.duration || 0)
    }, 0)

    const prevTotalIncome = prevPeriodFinanceLogs.reduce((sum, log) => {
      const metadata = log.metadata as FinanceMetadata | undefined
      return metadata?.finance_type === "income" ? sum + (log.value || 0) : sum
    }, 0)

    const prevTotalExpense = prevPeriodFinanceLogs.reduce((sum, log) => {
      const metadata = log.metadata as FinanceMetadata | undefined
      return metadata?.finance_type === "expense" ? sum + (log.value || 0) : sum
    }, 0)

    // Функция расчёта процента изменения
    const calcChange = (current: number, prev: number): { value: number; trend: 'up' | 'down' | 'same' } => {
      if (prev === 0) return { value: 0, trend: 'same' }
      const change = ((current - prev) / prev) * 100
      return {
        value: Math.round(change),
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'same'
      }
    }

    return {
      calories: Math.round(totalCalories),
      workouts: periodWorkoutLogs.length,
      workoutDuration: totalWorkoutDuration,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      // Тренды
      caloriesTrend: calcChange(totalCalories, prevTotalCalories),
      workoutsTrend: calcChange(periodWorkoutLogs.length, prevPeriodWorkoutLogs.length),
      incomeTrend: calcChange(totalIncome, prevTotalIncome),
      expenseTrend: calcChange(totalExpense, prevTotalExpense),
      // Средние значения
      avgCalories: Math.round(totalCalories / days),
      avgWorkoutDuration: Math.round(totalWorkoutDuration / Math.max(1, periodWorkoutLogs.length)),
    }
  }, [daysInRange, foodLogs, workoutLogs, financeLogs, dateRange])

  // Мемоизированные данные по категориям
  const categoryData = useMemo(() => {
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
  }, [foodLogs])

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

        {/* Summary Cards with Trends */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Utensils className="h-4 w-4" />
                <span className="text-sm">Калории</span>
                {stats.caloriesTrend.trend !== 'same' && (
                  <span className={`ml-auto text-xs flex items-center gap-0.5 ${
                    stats.caloriesTrend.trend === 'up' ? 'text-orange-500' : 'text-green-500'
                  }`}>
                    {stats.caloriesTrend.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stats.caloriesTrend.value)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{stats.calories.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                ~{stats.avgCalories} ккал/день
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Dumbbell className="h-4 w-4" />
                <span className="text-sm">Тренировки</span>
                {stats.workoutsTrend.trend !== 'same' && (
                  <span className={`ml-auto text-xs flex items-center gap-0.5 ${
                    stats.workoutsTrend.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stats.workoutsTrend.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stats.workoutsTrend.value)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{stats.workouts}</div>
              <div className="text-xs text-muted-foreground">
                {stats.workoutDuration} мин • ~{stats.avgWorkoutDuration} мин/трен
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Доход</span>
                {stats.incomeTrend.trend !== 'same' && (
                  <span className={`ml-auto text-xs flex items-center gap-0.5 ${
                    stats.incomeTrend.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stats.incomeTrend.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stats.incomeTrend.value)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-green-500">
                {stats.income.toLocaleString()} ₽
              </div>
              <div className="text-xs text-muted-foreground">vs прошлый период</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Расход</span>
                {stats.expenseTrend.trend !== 'same' && (
                  <span className={`ml-auto text-xs flex items-center gap-0.5 ${
                    stats.expenseTrend.trend === 'down' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stats.expenseTrend.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(stats.expenseTrend.value)}%
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-red-500">
                {stats.expense.toLocaleString()} ₽
              </div>
              <div className="text-xs text-muted-foreground">vs прошлый период</div>
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
                    <AreaChart data={caloriesData}>
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
                    <LineChart data={macrosData}>
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
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
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
                  {categoryData.map((entry, index) => (
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
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        itemStyle={{
                          color: "hsl(var(--foreground))",
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
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                        itemStyle={{
                          color: "hsl(var(--foreground))",
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
                    <AreaChart data={financeData}>
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