"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Trash2, Database, Check, AlertTriangle } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { DeleteConfirmActions } from "@/components/shared/page-actions"
import { db } from "@/lib/db"
import { seedDatabase } from "@/lib/seed"
import { priorityColors } from "@/lib/theme-colors"

export function DangerZone() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const [isSeeding, setIsSeeding] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Check if data already exists
  useEffect(() => {
    db.logs.count().then((count) => {
      setHasData(count > 0)
    })
  }, [])

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSeedData = async () => {
    if (confirm(t("dangerZone.confirmSeed"))) {
      setIsSeeding(true)
      try {
        await seedDatabase()
        showToast("success", tCommon("success"))
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        console.error("Error seeding data:", error)
        showToast("error", tCommon("error"))
      } finally {
        setIsSeeding(false)
      }
    }
  }

  const handleClearData = async () => {
    setIsClearing(true)
    try {
      await Promise.all([
        // Main tables
        db.logs.clear(),
        db.items.clear(),
        db.content.clear(),
        // Reference data
        db.categories.clear(),
        db.tags.clear(),
        db.units.clear(),
        db.accounts.clear(),
        db.exercises.clear(),
        // Recipes
        db.recipeIngredients.clear(),
        db.recipeIngredientItems.clear(),
        db.recipeSteps.clear(),
        // Books
        db.books.clear(),
        db.userBooks.clear(),
        db.authors.clear(),
        db.bookAuthors.clear(),
        db.series.clear(),
        db.genres.clear(),
        db.bookGenres.clear(),
        db.bookQuotes.clear(),
        db.bookReviews.clear(),
        // Goals and habits
        db.goals.clear(),
        db.habits.clear(),
        db.habitLogs.clear(),
        db.streaks.clear(),
        // Trackers
        db.sleepLogs.clear(),
        db.waterLogs.clear(),
        db.moodLogs.clear(),
        db.bodyMeasurements.clear(),
        // Reminders
        db.reminders.clear(),
        db.reminderLogs.clear(),
        // Templates
        db.templates.clear(),
        // Finance
        db.recurringTransactions.clear(),
        // Sync
        db.syncQueue.clear(),
        // Localization
        db.entityTranslations.clear(),
      ])
      showToast("success", tCommon("success"))
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error("Error clearing data:", error)
      showToast("error", tCommon("error"))
      setIsClearing(false)
    }
  }

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerZone.title")}</CardTitle>
          <CardDescription>{t("dangerZone.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            onClick={handleSeedData}
            disabled={isSeeding}
            className="w-full"
          >
            <Database className="h-4 w-4 mr-2" />
            {isSeeding
              ? t("dangerZone.seeding")
              : hasData
                ? t("dangerZone.reseedData")
                : t("dangerZone.seedData")}
          </Button>
          <Button variant="destructive" onClick={() => setShowClearDialog(true)} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            {t("dangerZone.clearAllData")}
          </Button>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dangerZone.clearDataTitle")}</DialogTitle>
            <DialogDescription>{t("dangerZone.clearDataDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DeleteConfirmActions
              onCancel={() => setShowClearDialog(false)}
              onConfirm={handleClearData}
              isLoading={isClearing}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast уведомление */}
      {toast && (
        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === "success"
              ? priorityColors.high.DEFAULT + " text-white"
              : priorityColors.critical.DEFAULT + " text-white"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}
    </>
  )
}
