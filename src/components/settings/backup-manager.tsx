"use client"

import { Download, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

export function BackupManager() {
  const handleExport = async () => {
    try {
      const data = {
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
        genres: await db.genres.toArray(),
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
        if (data.accounts) await db.accounts.bulkPut(data.accounts)
        if (data.units) await db.units.bulkPut(data.units)
        if (data.books) await db.books.bulkPut(data.books)
        if (data.userBooks) await db.userBooks.bulkPut(data.userBooks)
        if (data.authors) await db.authors.bulkPut(data.authors)
        if (data.genres) await db.genres.bulkPut(data.genres)

        window.location.reload()
      } catch (error) {
        console.error("Import failed:", error)
        alert("Ошибка импорта. Проверьте формат файла.")
      }
    }
    input.click()
  }

  return (
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
  )
}