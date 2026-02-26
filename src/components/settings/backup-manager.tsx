"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Upload, Trash2, FileJson, FileSpreadsheet, Check, AlertTriangle, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { db } from "@/lib/db"

type ExportFormat = "json" | "csv"

// Ключи для localStorage
const AUTO_BACKUP_ENABLED_KEY = "life-os-auto-backup-enabled"
const AUTO_BACKUP_INTERVAL_KEY = "life-os-auto-backup-interval"
const LAST_BACKUP_KEY = "life-os-last-backup"

// Интервалы автобэкапа в часах
const BACKUP_INTERVALS = [
  { value: 1, label: "Каждый час" },
  { value: 6, label: "Каждые 6 часов" },
  { value: 12, label: "Каждые 12 часов" },
  { value: 24, label: "Каждый день" },
  { value: 168, label: "Каждую неделю" },
]

export function BackupManager() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showConfirmImport, setShowConfirmImport] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  
  // Автоматический бэкап
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [autoBackupInterval, setAutoBackupInterval] = useState(24)
  const [lastBackup, setLastBackup] = useState<string | null>(null)

  // Загрузка настроек автобэкапа
  useEffect(() => {
    const savedEnabled = localStorage.getItem(AUTO_BACKUP_ENABLED_KEY)
    const savedInterval = localStorage.getItem(AUTO_BACKUP_INTERVAL_KEY)
    const savedLastBackup = localStorage.getItem(LAST_BACKUP_KEY)
    
    if (savedEnabled === "true") {
      setAutoBackupEnabled(true)
    }
    if (savedInterval) {
      setAutoBackupInterval(parseInt(savedInterval))
    }
    if (savedLastBackup) {
      setLastBackup(savedLastBackup)
    }
  }, [])

  // Функция создания автобэкапа
  const createAutoBackup = useCallback(async () => {
    try {
      const data = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        autoBackup: true,
        logs: await db.logs.toArray(),
        items: await db.items.toArray(),
        content: await db.content.toArray(),
        categories: await db.categories.toArray(),
        tags: await db.tags.toArray(),
        accounts: await db.accounts.toArray(),
        units: await db.units.toArray(),
        books: await db.books.toArray(),
        userBooks: await db.userBooks.toArray(),
        authors: await db.authors.toArray(),
        bookAuthors: await db.bookAuthors.toArray(),
        genres: await db.genres.toArray(),
        bookGenres: await db.bookGenres.toArray(),
        bookQuotes: await db.bookQuotes.toArray(),
        bookReviews: await db.bookReviews.toArray(),
        recipeIngredients: await db.recipeIngredients.toArray(),
        recipeIngredientItems: await db.recipeIngredientItems.toArray(),
        recipeSteps: await db.recipeSteps.toArray(),
        goals: await db.goals.toArray(),
        habits: await db.habits.toArray(),
        habitLogs: await db.habitLogs.toArray(),
        streaks: await db.streaks.toArray(),
        sleepLogs: await db.sleepLogs.toArray(),
        waterLogs: await db.waterLogs.toArray(),
        moodLogs: await db.moodLogs.toArray(),
        bodyMeasurements: await db.bodyMeasurements.toArray(),
        reminders: await db.reminders.toArray(),
        templates: await db.templates.toArray(),
        recurringTransactions: await db.recurringTransactions.toArray(),
      }

      // Сохраняем в localStorage (ограничение ~5-10MB)
      const jsonStr = JSON.stringify(data)
      
      // Проверяем размер
      if (jsonStr.length > 4 * 1024 * 1024) { // 4MB лимит
        console.warn("Auto backup too large, skipping localStorage save")
        // Сохраняем метаданные о том, что бэкап был сделан
        localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
        setLastBackup(new Date().toISOString())
        return
      }

      localStorage.setItem("life-os-auto-backup-data", jsonStr)
      localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString())
      setLastBackup(new Date().toISOString())
      
      console.log("Auto backup created at", new Date().toISOString())
    } catch (error) {
      console.error("Auto backup failed:", error)
    }
  }, [])

  // Проверка необходимости автобэкапа
  useEffect(() => {
    if (!autoBackupEnabled) return

    const checkAndBackup = () => {
      const now = new Date()
      const lastBackupDate = lastBackup ? new Date(lastBackup) : null
      
      if (!lastBackupDate) {
        // Первым делом создаём бэкап
        createAutoBackup()
        return
      }

      const hoursSinceLastBackup = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastBackup >= autoBackupInterval) {
        createAutoBackup()
      }
    }

    // Проверяем сразу при загрузке
    checkAndBackup()

    // Проверяем каждые 10 минут
    const interval = setInterval(checkAndBackup, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [autoBackupEnabled, autoBackupInterval, lastBackup, createAutoBackup])

  // Включение/выключение автобэкапа
  const toggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled)
    localStorage.setItem(AUTO_BACKUP_ENABLED_KEY, String(enabled))
    
    if (enabled) {
      createAutoBackup()
    }
  }

  // Изменение интервала
  const updateInterval = (interval: number) => {
    setAutoBackupInterval(interval)
    localStorage.setItem(AUTO_BACKUP_INTERVAL_KEY, String(interval))
  }

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Полный экспорт всех данных в JSON
  const handleFullExport = async () => {
    setIsExporting(true)
    try {
      const data = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        logs: await db.logs.toArray(),
        items: await db.items.toArray(),
        content: await db.content.toArray(),
        categories: await db.categories.toArray(),
        tags: await db.tags.toArray(),
        accounts: await db.accounts.toArray(),
        units: await db.units.toArray(),
        books: await db.books.toArray(),
        userBooks: await db.userBooks.toArray(),
        authors: await db.authors.toArray(),
        bookAuthors: await db.bookAuthors.toArray(),
        genres: await db.genres.toArray(),
        bookGenres: await db.bookGenres.toArray(),
        bookQuotes: await db.bookQuotes.toArray(),
        bookReviews: await db.bookReviews.toArray(),
        recipeIngredients: await db.recipeIngredients.toArray(),
        recipeIngredientItems: await db.recipeIngredientItems.toArray(),
        recipeSteps: await db.recipeSteps.toArray(),
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
      
      showToast("success", "Данные успешно экспортированы")
    } catch (error) {
      console.error("Export failed:", error)
      showToast("error", "Ошибка при экспорте данных")
    } finally {
      setIsExporting(false)
    }
  }

  // CSV экспорт для конкретной таблицы
  const handleCSVExport = async (tableName: string) => {
    try {
      let data: unknown[] = []
      
      switch (tableName) {
        case "logs":
          data = await db.logs.toArray()
          break
        case "items":
          data = await db.items.toArray()
          break
        case "books":
          data = await db.books.toArray()
          break
        case "accounts":
          data = await db.accounts.toArray()
          break
        default:
          return
      }

      if (data.length === 0) {
        showToast("error", "Нет данных для экспорта")
        return
      }

      // Flatten metadata для CSV
      const flatData = data.map(item => {
        const flat: Record<string, unknown> = {}
        Object.entries(item as Record<string, unknown>).forEach(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            flat[key] = JSON.stringify(value)
          } else {
            flat[key] = value
          }
        })
        return flat
      })

      const headers = Object.keys(flatData[0])
      const csvContent = [
        headers.join(","),
        ...flatData.map(row => 
          headers.map(h => {
            const val = row[h]
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`
            }
            return val ?? ""
          }).join(",")
        )
      ].join("\n")

      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `life-os-${tableName}-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)

      showToast("success", `${tableName} экспортирован в CSV`)
    } catch (error) {
      console.error("CSV export failed:", error)
      showToast("error", "Ошибка при экспорте CSV")
    }
  }

  // Импорт с подтверждением
  const handleImportClick = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      setPendingFile(file)
      setShowConfirmImport(true)
    }
    input.click()
  }

  const confirmImport = async () => {
    if (!pendingFile) return
    
    setIsImporting(true)
    setShowConfirmImport(false)
    
    try {
      const text = await pendingFile.text()
      const data = JSON.parse(text)

      // Очищаем и импортируем данные
      await db.transaction("rw", [
        db.logs, db.items, db.content, db.categories, db.tags,
        db.accounts, db.units, db.books, db.userBooks, db.authors,
        db.bookAuthors, db.genres, db.bookGenres, db.bookQuotes,
        db.bookReviews, db.recipeIngredients, db.recipeIngredientItems, db.recipeSteps
      ], async () => {
        if (data.logs) await db.logs.bulkPut(data.logs)
        if (data.items) await db.items.bulkPut(data.items)
        if (data.content) await db.content.bulkPut(data.content)
        if (data.categories) await db.categories.bulkPut(data.categories)
        if (data.tags) await db.tags.bulkPut(data.tags)
        if (data.accounts) await db.accounts.bulkPut(data.accounts)
        if (data.units) await db.units.bulkPut(data.units)
        if (data.books) await db.books.bulkPut(data.books)
        if (data.userBooks) await db.userBooks.bulkPut(data.userBooks)
        if (data.authors) await db.authors.bulkPut(data.authors)
        if (data.bookAuthors) await db.bookAuthors.bulkPut(data.bookAuthors)
        if (data.genres) await db.genres.bulkPut(data.genres)
        if (data.bookGenres) await db.bookGenres.bulkPut(data.bookGenres)
        if (data.bookQuotes) await db.bookQuotes.bulkPut(data.bookQuotes)
        if (data.bookReviews) await db.bookReviews.bulkPut(data.bookReviews)
        if (data.recipeIngredients) await db.recipeIngredients.bulkPut(data.recipeIngredients)
        if (data.recipeIngredientItems) await db.recipeIngredientItems.bulkPut(data.recipeIngredientItems)
        if (data.recipeSteps) await db.recipeSteps.bulkPut(data.recipeSteps)
      })

      showToast("success", "Данные успешно импортированы")
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error("Import failed:", error)
      showToast("error", "Ошибка импорта. Проверьте формат файла.")
    } finally {
      setIsImporting(false)
      setPendingFile(null)
    }
  }

  // Очистка всех данных
  const handleClearAll = async () => {
    if (!confirm("Вы уверены? Все данные будут удалены без возможности восстановления!")) return
    
    try {
      await Promise.all([
        db.logs.clear(),
        db.items.clear(),
        db.content.clear(),
        db.categories.clear(),
        db.tags.clear(),
        db.accounts.clear(),
        db.units.clear(),
        db.books.clear(),
        db.userBooks.clear(),
        db.authors.clear(),
        db.bookAuthors.clear(),
        db.genres.clear(),
        db.bookGenres.clear(),
        db.bookQuotes.clear(),
        db.bookReviews.clear(),
        db.recipeIngredients.clear(),
        db.recipeIngredientItems.clear(),
        db.recipeSteps.clear(),
      ])
      
      showToast("success", "Все данные удалены")
      window.location.reload()
    } catch (error) {
      console.error("Clear failed:", error)
      showToast("error", "Ошибка при очистке данных")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Резервное копирование
          </CardTitle>
          <CardDescription>Экспорт и импорт данных приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Основные действия */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleFullExport} 
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Экспорт..." : "Экспорт JSON"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleImportClick} 
              disabled={isImporting}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Импорт..." : "Импорт JSON"}
            </Button>
          </div>

          {/* Автоматический бэкап */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Автобэкап</Label>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={autoBackupEnabled}
                  onChange={(e) => toggleAutoBackup(e.target.checked)}
                />
                <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {autoBackupEnabled && (
              <div className="space-y-2">
                <select
                  value={autoBackupInterval}
                  onChange={(e) => updateInterval(parseInt(e.target.value))}
                  className="w-full text-sm bg-muted border rounded-md px-3 py-2"
                >
                  {BACKUP_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
                
                {lastBackup && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3" />
                    Последний: {new Date(lastBackup).toLocaleString("ru-RU")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CSV экспорт */}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Экспорт в CSV (для Excel):</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCSVExport("logs")}
                className="text-xs"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Записи
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCSVExport("items")}
                className="text-xs"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Каталог
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCSVExport("books")}
                className="text-xs"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Книги
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleCSVExport("accounts")}
                className="text-xs"
              >
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Счета
              </Button>
            </div>
          </div>

          {/* Опасная зона */}
          <div className="pt-2 border-t">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleClearAll}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Очистить все данные
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Диалог подтверждения импорта */}
      <Dialog open={showConfirmImport} onOpenChange={setShowConfirmImport}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Подтвердите импорт
            </DialogTitle>
            <DialogDescription>
              Импорт данных может перезаписать существующие записи с такими же ID. 
              Вы уверены, что хотите продолжить?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmImport(false)}>
              Отмена
            </Button>
            <Button onClick={confirmImport}>
              <Upload className="h-4 w-4 mr-2" />
              Импортировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast уведомление */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}
    </>
  )
}