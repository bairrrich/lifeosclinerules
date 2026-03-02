"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, Minus, Droplet, Coffee, CupSoda, GlassWater, Settings } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { db, initializeDatabase, createEntity } from "@/lib/db"
import type { WaterLog, Goal } from "@/types"
import { moduleColors, waterDrinkColors } from "@/lib/theme-colors"
import { WaterReminderSettings } from "@/components/water/water-reminder-settings"

const waterAmounts = [150, 200, 250, 300, 500]

function getDrinkTypes(t: any) {
  return [
    { type: "water", label: t("types.water"), icon: Droplet, color: waterDrinkColors.water.text },
    { type: "tea", label: t("types.tea"), icon: GlassWater, color: waterDrinkColors.tea.text },
    { type: "coffee", label: t("types.coffee"), icon: Coffee, color: waterDrinkColors.coffee.text },
    { type: "other", label: t("types.other"), icon: CupSoda, color: waterDrinkColors.other.text },
  ]
}

export default function WaterPage() {
  const t = useTranslations("water")
  const [isLoading, setIsLoading] = useState(true)
  const [todayLogs, setTodayLogs] = useState<WaterLog[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [selectedAmount, setSelectedAmount] = useState(250)
  const [selectedType, setSelectedType] = useState<"water" | "tea" | "coffee" | "other">("water")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      await initializeDatabase()
      const today = new Date().toISOString().split("T")[0]

      const [logs, goals] = await Promise.all([
        db.waterLogs.where("date").startsWith(today).toArray(),
        db.goals.where("type").equals("water").first(),
      ])

      setTodayLogs(logs)
      setGoal(goals || null)
    } catch (error) {
      console.error("Failed to load water data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function addWater(amount: number, type: string) {
    const now = new Date()

    await createEntity(db.waterLogs, {
      date: now.toISOString().split("T")[0],
      amount_ml: amount,
      time: now.toTimeString().slice(0, 5),
      type: type as "water" | "tea" | "coffee" | "other",
    })

    // Обновляем цель
    if (goal) {
      const newValue = (goal.current_value || 0) + amount
      await db.goals.update(goal.id, {
        current_value: newValue,
        updated_at: new Date().toISOString(),
      })
    }

    loadData()
  }

  async function removeLog(logId: string) {
    const log = todayLogs.find((l) => l.id === logId)
    if (!log) return

    await db.waterLogs.delete(logId)

    // Обновляем цель
    if (goal) {
      const newValue = Math.max(0, (goal.current_value || 0) - log.amount_ml)
      await db.goals.update(goal.id, {
        current_value: newValue,
        updated_at: new Date().toISOString(),
      })
    }

    loadData()
  }

  const totalMl = todayLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const progress = goal ? Math.min(100, (totalMl / goal.target_value) * 100) : 0

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Circle */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * progress) / 100}
                    className={`transition-[stroke-dashoffset] duration-500 ${
                      progress >= 100 ? "text-green-500" : "text-blue-500"
                    }`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Droplet
                    className={`h-8 w-8 mb-1 ${progress >= 100 ? "text-green-500" : "text-blue-500"}`}
                  />
                  <span className="text-3xl font-bold">{totalMl}</span>
                  <span className="text-sm text-muted-foreground">{t("unit")}</span>
                </div>
              </div>

              {goal && (
                <div className="mt-4 text-center">
                  <p className="text-muted-foreground">
                    {t("goal", { target: goal.target_value })}
                  </p>
                  {progress >= 100 && (
                    <p className="text-green-500 font-medium mt-1">{t("goalReached")}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Add */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getDrinkTypes(t).map((dt) => (
                  <Button
                    key={dt.type}
                    variant={selectedType === dt.type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedType(dt.type as typeof selectedType)}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 h-10"
                  >
                    <dt.icon
                      className={`h-4 w-4 flex-shrink-0 ${selectedType === dt.type ? "" : dt.color}`}
                    />
                    <span className="text-xs sm:text-sm">{t(`types.${dt.type}`)}</span>
                  </Button>
                ))}
              </div>

              {/* Amount Selection */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {waterAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => setSelectedAmount(amount)}
                    className="text-xs sm:text-sm h-10"
                  >
                    {amount} {t("unit")}
                  </Button>
                ))}
              </div>

              {/* Add Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => addWater(selectedAmount, selectedType)}
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("add", { amount: selectedAmount })}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Today's Log */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("today")}</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.loading")}
              </CardContent>
            </Card>
          ) : todayLogs.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.noRecords")}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {todayLogs.map((log) => {
                const drinkType =
                  getDrinkTypes(t).find((d) => d.type === log.type) || getDrinkTypes(t)[0]
                const IconComponent = drinkType.icon

                return (
                  <Card key={log.id} className="group">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${moduleColors.water.light}`}
                      >
                        <IconComponent className={`h-5 w-5 ${drinkType.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {log.amount_ml} {t("unit")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {drinkType.label} • {log.time}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeLog(log.id)}
                        aria-label={t("delete")}
                      >
                        <Minus className="h-4 w-4 text-destructive" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Water Reminders */}
        <WaterReminderSettings />
      </div>
    </AppLayout>
  )
}
