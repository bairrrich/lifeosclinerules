"use client"

import { useTranslations } from "next-intl"
import { Trash2, Database } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { seedDatabase, reseedDatabase, cleanupDuplicateCategories } from "@/lib/db/seed"

export function DangerZone() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")

  const handleClearData = async () => {
    if (confirm(t("dangerZone.confirmClear"))) {
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
      alert(tCommon("databaseNotEmpty"))
    }
  }

  const handleReseedData = async () => {
    if (confirm(t("dangerZone.confirmReseed"))) {
      await reseedDatabase()
      window.location.reload()
    }
  }

  const handleCleanupDuplicates = async () => {
    const count = await cleanupDuplicateCategories()
    if (count > 0) {
      alert(tCommon("duplicatesRemoved", { count }))
      window.location.reload()
    } else {
      alert(tCommon("noDuplicates"))
    }
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">{t("dangerZone.title")}</CardTitle>
        <CardDescription>{t("dangerZone.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" onClick={handleSeedData} className="w-full">
          <Database className="h-4 w-4 mr-2" />
          {t("dangerZone.seedData")}
        </Button>
        <Button variant="outline" onClick={handleReseedData} className="w-full">
          <Database className="h-4 w-4 mr-2" />
          {t("dangerZone.reseedData")}
        </Button>
        <Button variant="outline" onClick={handleCleanupDuplicates} className="w-full">
          {t("dangerZone.cleanupDuplicates")}
        </Button>
        <Button variant="destructive" onClick={handleClearData} className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          {t("dangerZone.clearAllData")}
        </Button>
      </CardContent>
    </Card>
  )
}
