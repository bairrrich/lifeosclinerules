"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Flame, Trophy, Target, TrendingUp } from "@/lib/icons"
import { Card, CardContent } from "@/components/ui/card"
import { db, initializeDatabase } from "@/lib/db"
import type { Streak, Habit, HabitLog } from "@/types"

export function StreakWidget() {
  const t = useTranslations("home.streakWidget")
  const [isLoading, setIsLoading] = useState(true)
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        const [streaksData, habitsData, logsData] = await Promise.all([
          db.streaks.toArray(),
          db.habits.where("is_active").equals(1).toArray(),
          db.habitLogs.toArray(),
        ])
        setStreaks(streaksData)
        setHabits(habitsData)
        setHabitLogs(logsData)
      } catch (error) {
        console.error("Failed to load streak data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return null
  }

  // Calculate stats
  const totalCurrentStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0)
  const bestStreak = Math.max(...streaks.map((s) => s.longest_streak), 0)
  const totalCompletions = habitLogs.filter((l) => l.completed).length
  const activeHabits = habits.length

  // Get top streak habits
  const topStreaks = habits
    .map((habit) => {
      const streak = streaks.find((s) => s.habit_id === habit.id)
      return {
        habit,
        streak: streak?.current_streak || 0,
      }
    })
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3)

  // Check if any habit completed today
  const today = new Date().toISOString().split("T")[0]
  const completedToday = habitLogs.filter((l) => l.date.startsWith(today) && l.completed).length

  if (activeHabits === 0) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCurrentStreak}</div>
              <div className="text-xs text-muted-foreground">{t("days")}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{bestStreak}</div>
              <div className="text-xs text-muted-foreground">{t("bestStreak")}</div>
            </div>
          </div>
        </div>

        {/* Progress today */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("completedToday")}</span>
            <span className="font-medium">
              {completedToday}/{activeHabits}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-[width] duration-500"
              style={{ width: `${activeHabits > 0 ? (completedToday / activeHabits) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Top streaks */}
        {topStreaks.length > 0 && (
          <div className="space-y-2">
            {topStreaks.map((item, index) => (
              <div key={item.habit.id} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? "bg-amber-500 text-white"
                      : index === 1
                        ? "bg-gray-300 text-gray-700"
                        : "bg-amber-700 text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="flex-1 text-sm truncate">{item.habit.name}</span>
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-sm font-medium">{item.streak}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>
              {activeHabits} {t("habits")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>
              {totalCompletions} {t("totalCompletions")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
