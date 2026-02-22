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
} from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db, initializeDatabase } from "@/lib/db"
import type { Log, Item, Content } from "@/types"

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
    href: "/items/vitamins/new",
    label: "Витамины",
    icon: Pill,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
]

// Navigation cards data
const sections = [
  {
    href: "/logs",
    title: "Учет",
    description: "Питание, тренировки, финансы",
    icon: TrendingUp,
    stats: ["food", "workout", "finance"],
  },
  {
    href: "/items",
    title: "Каталог",
    description: "Витамины, лекарства, травы",
    icon: Pill,
    stats: ["vitamin", "medicine", "herb"],
  },
  {
    href: "/content",
    title: "Контент",
    description: "Книги и рецепты",
    icon: BookOpen,
    stats: ["book", "recipe"],
  },
]

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    logs: 0,
    items: 0,
    content: 0,
    todayLogs: 0,
  })

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()
        
        const [logs, items, content] = await Promise.all([
          db.logs.toArray(),
          db.items.toArray(),
          db.content.toArray(),
        ])
        
        const today = new Date().toISOString().split("T")[0]
        const todayLogs = logs.filter((log) => log.date.startsWith(today))
        
        setStats({
          logs: logs.length,
          items: items.length,
          content: content.length,
          todayLogs: todayLogs.length,
        })
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
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.todayLogs}</div>
              <div className="text-sm text-muted-foreground">Сегодня</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.logs}</div>
              <div className="text-sm text-muted-foreground">Записей</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.items}</div>
              <div className="text-sm text-muted-foreground">Каталог</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.content}</div>
              <div className="text-sm text-muted-foreground">Контент</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Быстрые действия</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${action.bgColor}`}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <span className="text-xs font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="flex flex-col gap-2">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="hover:bg-accent transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Последняя активность</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Загрузка...
              </CardContent>
            </Card>
          ) : stats.logs === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Нет записей. Начните вести учет!
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Последние записи появятся здесь
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  )
}