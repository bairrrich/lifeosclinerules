"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Monitor, Download, Upload, Trash2, Database } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { db } from "@/lib/db"
import { seedDatabase, cleanupDuplicateCategories } from "@/lib/db/seed"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [stats, setStats] = useState({
    logs: 0,
    items: 0,
    content: 0,
  })

  useEffect(() => {
    async function loadStats() {
      const [logs, items, content] = await Promise.all([
        db.logs.count(),
        db.items.count(),
        db.content.count(),
      ])
      setStats({ logs, items, content })
    }
    loadStats()
  }, [])

  const handleExport = async () => {
    try {
      const data = {
        logs: await db.logs.toArray(),
        items: await db.items.toArray(),
        content: await db.content.toArray(),
        categories: await db.categories.toArray(),
        tags: await db.tags.toArray(),
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `life-os-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.logs) await db.logs.bulkPut(data.logs)
        if (data.items) await db.items.bulkPut(data.items)
        if (data.content) await db.content.bulkPut(data.content)
        if (data.categories) await db.categories.bulkPut(data.categories)
        if (data.tags) await db.tags.bulkPut(data.tags)

        window.location.reload()
      } catch (error) {
        console.error("Import failed:", error)
      }
    }
    input.click()
  }

  const handleClearData = async () => {
    if (confirm("Вы уверены? Все данные будут удалены без возможности восстановления!")) {
      await Promise.all([
        db.logs.clear(),
        db.items.clear(),
        db.content.clear(),
        db.categories.clear(),
        db.tags.clear(),
      ])
      window.location.reload()
    }
  }

  const handleSeedData = async () => {
    const result = await seedDatabase()
    if (result) {
      window.location.reload()
    } else {
      alert("База данных уже содержит данные. Сначала очистите данные.")
    }
  }

  const handleCleanupDuplicates = async () => {
    const count = await cleanupDuplicateCategories()
    if (count > 0) {
      alert(`Удалено ${count} дубликатов категорий`)
      window.location.reload()
    } else {
      alert("Дубликаты не найдены")
    }
  }

  return (
    <AppLayout title="Настройки">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle>Оформление</CardTitle>
            <CardDescription>Настройте внешний вид приложения</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тема</Label>
              <div className="flex gap-2">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Светлая
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  Темная
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Системная
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Данные</CardTitle>
            <CardDescription>Статистика хранилища</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted">
                <div className="text-2xl font-bold">{stats.logs}</div>
                <div className="text-sm text-muted-foreground">Записей</div>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <div className="text-2xl font-bold">{stats.items}</div>
                <div className="text-sm text-muted-foreground">Каталог</div>
              </div>
              <div className="p-4 rounded-xl bg-muted">
                <div className="text-2xl font-bold">{stats.content}</div>
                <div className="text-sm text-muted-foreground">Контент</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Data */}
        <Card>
          <CardHeader>
            <CardTitle>Тестовые данные</CardTitle>
            <CardDescription>Заполнить базу тестовыми данными</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleSeedData} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Заполнить тестовыми данными
            </Button>
            <Button variant="outline" onClick={handleCleanupDuplicates} className="w-full mt-2">
              Очистить дубликаты категорий
            </Button>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle>Резервное копирование</CardTitle>
            <CardDescription>Экспорт и импорт данных</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Экспорт
              </Button>
              <Button variant="outline" onClick={handleImport} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Опасная зона</CardTitle>
            <CardDescription>Необратимые действия</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все данные
            </Button>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>О приложении</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Life OS — единое приложение для учета различных аспектов жизни.</p>
            <p>Версия: 1.0.0</p>
            <p>Технологии: Next.js, Dexie, shadcn/ui</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}