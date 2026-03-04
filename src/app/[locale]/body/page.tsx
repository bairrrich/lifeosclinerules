"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "@/lib/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Plus, Scale, Ruler, TrendingDown, TrendingUp, Settings, Activity } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageActions, DeleteConfirmActions } from "@/components/shared/page-actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import { cn } from "@/lib/utils"
import { bodyColors } from "@/lib/theme-colors"
import type { BodyMeasurement, BodyMeasurementType } from "@/types"

const measurementTypes: {
  type: BodyMeasurementType
  label: string
  unit: string
  icon: typeof Scale
}[] = [
  { type: "height", label: "height", unit: "cm", icon: Ruler },
  { type: "weight", label: "weight", unit: "kg", icon: Scale },
  { type: "waist", label: "waist", unit: "cm", icon: Ruler },
  { type: "chest", label: "chest", unit: "cm", icon: Ruler },
  { type: "hips", label: "hips", unit: "cm", icon: Ruler },
  { type: "biceps", label: "biceps", unit: "cm", icon: Ruler },
  { type: "thigh", label: "thigh", unit: "cm", icon: Ruler },
  { type: "neck", label: "neck", unit: "cm", icon: Ruler },
  { type: "bodyFat", label: "bodyFat", unit: "percent", icon: TrendingDown },
  { type: "muscleMass", label: "muscleMass", unit: "percent", icon: TrendingUp },
]

export default function BodyPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <BodyContent />
    </Suspense>
  )
}

function BodyContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("body")
  const locale = useLocale()
  const [isLoading, setIsLoading] = useState(true)
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingMeasurement, setEditingMeasurement] = useState<BodyMeasurement | null>(null)
  const [selectedType, setSelectedType] = useState<BodyMeasurementType>("weight")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsAddDialogOpen(true)
      // Clear the query parameter after opening to allow re-opening the dialog
      const url = new URL(window.location.href)
      url.searchParams.delete("add")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  async function loadData() {
    try {
      await initializeDatabase()
      const data = await db.bodyMeasurements.orderBy("date").reverse().toArray()
      setMeasurements(data)
    } catch (error) {
      console.error("Failed to load body measurements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function addMeasurement() {
    if (!value || isNaN(Number(value))) return

    const typeConfig = measurementTypes.find((t) => t.type === selectedType)

    await createEntity(db.bodyMeasurements, {
      date: new Date().toISOString(),
      type: selectedType,
      value: Number(value),
      unit: typeConfig?.unit || "кг",
      notes: notes || undefined,
    })

    setIsAddDialogOpen(false)
    resetForm()
    loadData()
  }

  async function updateMeasurement() {
    if (!editingMeasurement || !value || isNaN(Number(value))) return

    const typeConfig = measurementTypes.find((t) => t.type === selectedType)

    await updateEntity(db.bodyMeasurements, editingMeasurement.id, {
      type: selectedType,
      value: Number(value),
      unit: typeConfig?.unit || "кг",
      notes: notes || undefined,
    })

    setIsEditDialogOpen(false)
    setEditingMeasurement(null)
    resetForm()
    loadData()
  }

  async function deleteMeasurement() {
    if (!editingMeasurement) return

    await deleteEntity(db.bodyMeasurements, editingMeasurement.id)

    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingMeasurement(null)
    resetForm()
    loadData()
  }

  function resetForm() {
    setSelectedType("weight")
    setValue("")
    setNotes("")
  }

  function openEditDialog(measurement: BodyMeasurement) {
    setEditingMeasurement(measurement)
    setSelectedType(measurement.type)
    setValue(String(measurement.value))
    setNotes(measurement.notes || "")
    setIsEditDialogOpen(true)
  }

  function getLatestMeasurement(type: BodyMeasurementType): BodyMeasurement | undefined {
    return measurements.find((m) => m.type === type)
  }

  function getPreviousMeasurement(type: BodyMeasurementType): BodyMeasurement | undefined {
    const typeMeasurements = measurements.filter((m) => m.type === type)
    return typeMeasurements[1]
  }

  function getChange(
    type: BodyMeasurementType
  ): { value: number; trend: "up" | "down" | "same" } | null {
    const latest = getLatestMeasurement(type)
    const previous = getPreviousMeasurement(type)

    if (!latest || !previous) return null

    const diff = latest.value - previous.value
    return {
      value: Math.abs(diff),
      trend: diff > 0 ? "up" : diff < 0 ? "down" : "same",
    }
  }

  function getMeasurementsByType(type: BodyMeasurementType): BodyMeasurement[] {
    return measurements.filter((m) => m.type === type).slice(0, 30)
  }

  function calculateBMI(): { value: number; category: string; color: string } | null {
    const height = getLatestMeasurement("height")
    const weight = getLatestMeasurement("weight")

    if (!height || !weight) return null

    const heightM = height.value / 100
    const bmi = weight.value / (heightM * heightM)

    let category: string
    let color: string

    if (bmi < 18.5) {
      category = "underweight"
      color = bodyColors.bmi.underweight.text
    } else if (bmi < 25) {
      category = "normal"
      color = bodyColors.bmi.normal.text
    } else if (bmi < 30) {
      category = "overweight"
      color = bodyColors.bmi.overweight.text
    } else {
      category = "obese"
      color = bodyColors.bmi.obese.text
    }

    return { value: Math.round(bmi * 10) / 10, category, color }
  }

  function getStats(
    type: BodyMeasurementType
  ): { min: number; max: number; avg: number; count: number } | null {
    const typeMeasurements = getMeasurementsByType(type)
    if (typeMeasurements.length === 0) return null

    const values = typeMeasurements.map((m) => m.value)
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
      count: values.length,
    }
  }

  const bmi = calculateBMI()
  const weightMeasurements = getMeasurementsByType("weight")

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* BMI Card */}
        <Card>
          <CardContent className="p-6">
            {bmi ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">
                    <Activity className={`h-7 w-7 ${bmi.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{bmi.value}</div>
                    <div className="text-sm text-muted-foreground">{t("bmi.title")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${bmi.color}`}>
                    {t(`bmi.${bmi.category}`)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getLatestMeasurement("height")?.value} {t("units.cm")} /{" "}
                    {getLatestMeasurement("weight")?.value} {t("units.kg")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("bmi.addHint")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {measurementTypes.map((item) => {
            const latest = getLatestMeasurement(item.type)
            const change = getChange(item.type)

            return (
              <Card key={item.type}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {change && (
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          item.type === "bodyFat"
                            ? change.trend === "down"
                              ? bodyColors.trend.down
                              : bodyColors.trend.up
                            : change.trend === "down"
                              ? bodyColors.trend.up
                              : bodyColors.trend.down
                        }`}
                      >
                        {change.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {change.value.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-bold">{latest ? `${latest.value}` : "-"}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(`measurementTypes.${item.type}`)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Stats */}
        {measurementTypes.map((item) => {
          const stats = getStats(item.type)
          if (!stats || stats.count < 2) return null

          return (
            <Card key={`stats-${item.type}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{t(`measurementTypes.${item.type}`)}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {stats.count} {t("stats.recordsCount", { count: stats.count })}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={cn("text-lg font-bold", bodyColors.stats.max)}>{stats.max}</div>
                    <div className="text-xs text-muted-foreground">{t("stats.max")}</div>
                  </div>
                  <div>
                    <div className={cn("text-lg font-bold", bodyColors.stats.avg)}>{stats.avg}</div>
                    <div className="text-xs text-muted-foreground">{t("stats.avg")}</div>
                  </div>
                  <div>
                    <div className={cn("text-lg font-bold", bodyColors.stats.min)}>{stats.min}</div>
                    <div className="text-xs text-muted-foreground">{t("stats.min")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Weight Chart */}
        {weightMeasurements.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">{t("body.weightChart")}</h3>
              <div className="flex items-end justify-between h-24 gap-1">
                {weightMeasurements
                  .slice(0, 14)
                  .reverse()
                  .map((m, i) => {
                    const minWeight = Math.min(...weightMeasurements.map((w) => w.value))
                    const maxWeight = Math.max(...weightMeasurements.map((w) => w.value))
                    const range = maxWeight - minWeight || 1
                    const height = ((m.value - minWeight) / range) * 80 + 20

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full rounded-t transition-[height] bg-[oklch(0.70_0.30_218)]"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    )
                  })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>
                  {weightMeasurements[weightMeasurements.length - 1]?.value || "-"} {t("units.kg")}
                </span>
                <span>
                  {weightMeasurements[0]?.value || "-"} {t("units.kg")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("history")}</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.loading")}
              </CardContent>
            </Card>
          ) : measurements.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.noRecords")}
              </CardContent>
            </Card>
          ) : (
            measurementTypes.map((item) => {
              const typeMeasurements = getMeasurementsByType(item.type)
              if (typeMeasurements.length === 0) return null

              return (
                <div key={item.type} className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <item.icon className="h-4 w-4" />
                    {t(`measurementTypes.${item.type}`)}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {typeMeasurements.slice(0, 5).map((m) => (
                      <Card key={m.id} className="group">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-medium">
                              {m.value} {t(`units.${m.unit}`)}
                            </span>
                            {m.notes && (
                              <span className="text-sm text-muted-foreground ml-2">{m.notes}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(m.date).toLocaleDateString(locale, {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => openEditDialog(m)}
                              aria-label="Редактировать измерение"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.addTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("dialogs.typeLabel")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {measurementTypes.map((item) => (
                    <Button
                      key={item.type}
                      variant={selectedType === item.type ? "default" : "outline"}
                      className="flex flex-col items-center py-2 h-auto"
                      onClick={() => setSelectedType(item.type)}
                    >
                      <item.icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{t(`measurementTypes.${item.type}`)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">{t("dialogs.valueLabel")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">
                    {t(`units.${measurementTypes.find((t) => t.type === selectedType)?.unit}`)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("dialogs.notesLabel")}</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("dialogs.notesPlaceholder")}
                />
              </div>
            </div>
            <PageActions
              variant="dialog"
              onCancel={() => setIsAddDialogOpen(false)}
              onSimpleSave={addMeasurement}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.editTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("dialogs.typeLabel")}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {measurementTypes.map((item) => (
                    <Button
                      key={item.type}
                      variant={selectedType === item.type ? "default" : "outline"}
                      className="flex flex-col items-center py-2 h-auto"
                      onClick={() => setSelectedType(item.type)}
                    >
                      <item.icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{t(`measurementTypes.${item.type}`)}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-value">{t("dialogs.valueLabel")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-value"
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="flex-1"
                  />
                  <span className="flex items-center text-muted-foreground">
                    {t(`units.${measurementTypes.find((t) => t.type === selectedType)?.unit}`)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">{t("dialogs.notesLabel")}</Label>
                <Input
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("dialogs.notesPlaceholder")}
                />
              </div>
            </div>
            <PageActions
              variant="dialog"
              showDelete={true}
              onSimpleDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSimpleSave={updateMeasurement}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.deleteTitle")}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">{t("dialogs.deleteConfirm")}</p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteMeasurement}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
