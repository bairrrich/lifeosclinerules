"use client"

import { Trash2, Database } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { seedDatabase, reseedDatabase, cleanupDuplicateCategories } from "@/lib/db/seed"

export function DangerZone() {
  const handleClearData = async () => {
    if (confirm("Вы уверены? Все данные будут удалены без возможности восстановления!")) {
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
        db.genres.clear(),
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

  const handleReseedData = async () => {
    if (
      confirm("Пересоздать базу данных? Все текущие данные будут удалены и заменены тестовыми!")
    ) {
      await reseedDatabase()
      window.location.reload()
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
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Опасная зона</CardTitle>
        <CardDescription>Необратимые действия</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" onClick={handleSeedData} className="w-full">
          <Database className="h-4 w-4 mr-2" />
          Заполнить тестовыми данными
        </Button>
        <Button variant="outline" onClick={handleReseedData} className="w-full">
          <Database className="h-4 w-4 mr-2" />
          Пересоздать тестовые данные
        </Button>
        <Button variant="outline" onClick={handleCleanupDuplicates} className="w-full">
          Очистить дубликаты категорий
        </Button>
        <Button variant="destructive" onClick={handleClearData} className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Очистить все данные
        </Button>
      </CardContent>
    </Card>
  )
}
