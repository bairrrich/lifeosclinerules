"use client"

import { useState } from "react"
import { Download, FileJson, FileSpreadsheet, Loader2 } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

export function ExportManager() {
  const [isExporting, setIsExporting] = useState(false)

  async function exportToJson() {
    setIsExporting(true)
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: "1.0.0",

        // Логи
        logs: await db.logs.toArray(),
        foodLogs: await db.logs.where("type").equals("food").toArray(),
        workoutLogs: await db.logs.where("type").equals("workout").toArray(),
        financeLogs: await db.logs.where("type").equals("finance").toArray(),

        // Трекеры
        sleepLogs: await db.sleepLogs.toArray(),
        waterLogs: await db.waterLogs.toArray(),
        moodLogs: await db.moodLogs.toArray(),
        bodyMeasurements: await db.bodyMeasurements.toArray(),

        // Привычки
        habits: await db.habits.toArray(),
        habitLogs: await db.habitLogs.toArray(),
        streaks: await db.streaks.toArray(),

        // Цели
        goals: await db.goals.toArray(),

        // Напоминания
        reminders: await db.reminders.toArray(),

        // Шаблоны
        templates: await db.templates.toArray(),

        // Справочники
        categories: await db.categories.toArray(),
        tags: await db.tags.toArray(),
        units: await db.units.toArray(),
        accounts: await db.accounts.toArray(),

        // Каталог
        items: await db.items.toArray(),

        // Контент
        content: await db.content.toArray(),

        // Книги
        books: await db.books.toArray(),
        userBooks: await db.userBooks.toArray(),
        authors: await db.authors.toArray(),
        bookAuthors: await db.bookAuthors.toArray(),
        series: await db.series.toArray(),
        genres: await db.genres.toArray(),
        bookGenres: await db.bookGenres.toArray(),
        bookQuotes: await db.bookQuotes.toArray(),
        bookReviews: await db.bookReviews.toArray(),

        // Рецепты
        recipeIngredients: await db.recipeIngredients.toArray(),
        recipeIngredientItems: await db.recipeIngredientItems.toArray(),
        recipeSteps: await db.recipeSteps.toArray(),

        // Упражнения
        exercises: await db.exercises.toArray(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `life-os-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Ошибка экспорта")
    } finally {
      setIsExporting(false)
    }
  }

  async function exportToCsv() {
    setIsExporting(true)
    try {
      // Экспорт основных данных в CSV
      const logs = await db.logs.toArray()

      if (logs.length === 0) {
        alert("Нет данных для экспорта")
        setIsExporting(false)
        return
      }

      // CSV для логов
      const logsCsv = [
        ["id", "type", "date", "title", "quantity", "unit", "value", "notes"].join(","),
        ...logs.map((log) =>
          [
            log.id,
            log.type,
            log.date,
            `"${log.title.replace(/"/g, '""')}"`,
            log.quantity || "",
            log.unit || "",
            log.value || "",
            `"${(log.notes || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n")

      downloadCsv(logsCsv, "logs")

      // CSV для привычек
      const habits = await db.habits.toArray()
      const habitLogs = await db.habitLogs.toArray()

      if (habits.length > 0) {
        const habitsCsv = [
          ["id", "name", "start_date", "end_date", "is_active"].join(","),
          ...habits.map((h) =>
            [
              h.id,
              `"${h.name.replace(/"/g, '""')}"`,
              h.start_date || "",
              h.end_date || "",
              h.is_active ? "1" : "0",
            ].join(",")
          ),
        ].join("\n")

        downloadCsv(habitsCsv, "habits")
      }

      // CSV для сна
      const sleepLogs = await db.sleepLogs.toArray()
      if (sleepLogs.length > 0) {
        const sleepCsv = [
          ["date", "start_time", "end_time", "duration_min", "quality", "notes"].join(","),
          ...sleepLogs.map((s) =>
            [
              s.date,
              s.start_time,
              s.end_time,
              s.duration_min,
              s.quality,
              `"${(s.notes || "").replace(/"/g, '""')}"`,
            ].join(",")
          ),
        ].join("\n")

        downloadCsv(sleepCsv, "sleep")
      }

      // CSV для измерений
      const measurements = await db.bodyMeasurements.toArray()
      if (measurements.length > 0) {
        const measurementsCsv = [
          ["date", "type", "value", "unit", "notes"].join(","),
          ...measurements.map((m) =>
            [
              m.date.split("T")[0],
              m.type,
              m.value,
              m.unit,
              `"${(m.notes || "").replace(/"/g, '""')}"`,
            ].join(",")
          ),
        ].join("\n")

        downloadCsv(measurementsCsv, "body-measurements")
      }

      alert("CSV файлы экспортированы")
    } catch (error) {
      console.error("CSV export failed:", error)
      alert("Ошибка экспорта CSV")
    } finally {
      setIsExporting(false)
    }
  }

  function downloadCsv(content: string, name: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `life-os-${name}-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Экспорт данных
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Экспортируйте свои данные для резервного копирования или анализа в других приложениях.
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={exportToJson}
            disabled={isExporting}
            className="flex-1"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            JSON
          </Button>

          <Button variant="outline" onClick={exportToCsv} disabled={isExporting} className="flex-1">
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
