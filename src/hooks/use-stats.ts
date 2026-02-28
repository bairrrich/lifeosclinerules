"use client"

import { useEffect, useState } from "react"
import { db, initializeDatabase } from "@/lib/db"
import type { Streak, Habit, HabitLog } from "@/types"

export interface StatsData {
  // Habits
  activeHabits: number
  totalCompletions: number
  currentStreak: number
  bestStreak: number
  completedToday: number
  completionRate: number

  // Generic counts
  totalLogs: number
  totalItems: number
  totalRecipes: number
  totalBooks: number
}

/**
 * Хук для получения сводной статистики приложения
 */
export function useStats(): { data: StatsData | null; isLoading: boolean; error: Error | null } {
  const [data, setData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)
        await initializeDatabase()

        const [habits, habitLogs, streaks, logs, items, recipes, books] = await Promise.all([
          db.habits.where("is_active").equals(1).toArray(),
          db.habitLogs.toArray(),
          db.streaks.toArray(),
          db.logs.toArray(),
          db.items.toArray(),
          db.content
            .where("type")
            .equals("recipe" as any)
            .toArray(),
          db.content
            .where("type")
            .equals("book" as any)
            .toArray(),
        ])

        // Calculate habit stats
        const totalCompletions = habitLogs.filter((l) => l.completed).length
        const currentStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0)
        const bestStreak = Math.max(...streaks.map((s) => s.longest_streak), 0)

        const today = new Date().toISOString().split("T")[0]
        const completedToday = habitLogs.filter(
          (l) => l.date.startsWith(today) && l.completed
        ).length

        const activeHabits = habits.length
        const completionRate =
          activeHabits > 0 ? Math.round((completedToday / activeHabits) * 100) : 0

        setData({
          activeHabits,
          totalCompletions,
          currentStreak,
          bestStreak,
          completedToday,
          completionRate,
          totalLogs: logs.length,
          totalItems: items.length,
          totalRecipes: recipes.length,
          totalBooks: books.length,
        })

        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  return { data, isLoading, error }
}

/**
 * Хук для получения статистики по привычкам
 */
export function useHabitStats(): {
  activeHabits: number
  totalCompletions: number
  currentStreak: number
  bestStreak: number
  completedToday: number
  isLoading: boolean
} {
  const [stats, setStats] = useState({
    activeHabits: 0,
    totalCompletions: 0,
    currentStreak: 0,
    bestStreak: 0,
    completedToday: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHabitStats() {
      try {
        const [habits, habitLogs, streaks] = await Promise.all([
          db.habits.where("is_active").equals(1).toArray(),
          db.habitLogs.toArray(),
          db.streaks.toArray(),
        ])

        const totalCompletions = habitLogs.filter((l) => l.completed).length
        const currentStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0)
        const bestStreak = Math.max(...streaks.map((s) => s.longest_streak), 0)

        const today = new Date().toISOString().split("T")[0]
        const completedToday = habitLogs.filter(
          (l) => l.date.startsWith(today) && l.completed
        ).length

        setStats({
          activeHabits: habits.length,
          totalCompletions,
          currentStreak,
          bestStreak,
          completedToday,
        })
      } catch (error) {
        console.error("Failed to load habit stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadHabitStats()
  }, [])

  return { ...stats, isLoading }
}
