"use client"

import { useEffect, useState } from "react"
import { Plus, Scale, Ruler, TrendingDown, TrendingUp, Trash2, Settings, Activity, Minus } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import type { BodyMeasurement, BodyMeasurementType } from "@/types"

const measurementTypes: { type: BodyMeasurementType; label: string; unit: string; icon: typeof Scale }[] = [
  { type: "height", label: "Рост", unit: "см", icon: Ruler },
  { type: "weight", label: "Вес", unit: "кг", icon: Scale },
  { type: "waist", label: "Талия", unit: "см", icon: Ruler },
  { type: "chest", label: "Грудь", unit: "см", icon: Ruler },
  { type: "hips", label: "Бёдра", unit: "см", icon: Ruler },
  { type: "biceps", label: "Бицепс", unit: "см", icon: Ruler },
  { type: "thigh", label: "Бедро", unit: "см", icon: Ruler },
  { type: "neck", label: "Шея", unit: "см", icon: Ruler },
  { type: "body_fat", label: "Жир", unit: "%", icon: TrendingDown },
]

export default function BodyPage() {
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

  function getChange(type: BodyMeasurementType): { value: number; trend: "up" | "down" | "same" } | null {
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

  // BMI Calculation
  function calculateBMI(): { value: number; category: string; color: string } | null {
    const height = getLatestMeasurement("height")
    const weight = getLatestMeasurement("weight")
    
    if (!height || !weight) return null
    
    const heightM = height.value / 100 // см в метры
    const bmi = weight.value / (heightM * heightM)
    
    let category: string
    let color: string
    
    if (bmi < 18.5) {
      category = "Недостаточный вес"
      color = "text-blue-500"
    } else if (bmi < 25) {
      category = "Нормальный вес"
      color = "text-green-500"
    } else if (bmi < 30) {
      category = "Избыточный вес"
      color = "text-yellow-500"
    } else {
      category = "Ожирение"
      color = "text-red-500"
    }
    
    return { value: Math.round(bmi * 10) / 10, category, color }
  }

  // Statistics for all types
  function getStats(type: BodyMeasurementType): { min: number; max: number; avg: number; count: number } | null {
    const typeMeasurements = getMeasurementsByType(type)
    if (typeMeasurements.length === 0) return null
    
    const values = typeMeasurements.map(m => m.value)
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10,
      count: values.length,
    }
  }

  const bmi = calculateBMI()
  const weightMeasurements = getMeasurementsByType("weight")

  return (
    <AppLayout title="Измерения">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* BMI Card */}
        <Card>
          <CardContent className="p-6">
            {bmi ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10`}>
                    <Activity className={`h-7 w-7 ${bmi.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{bmi.value}</div>
                    <div className="text-sm text-muted-foreground">BMI</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${bmi.color}`}>
                    {bmi.category}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getLatestMeasurement("height")?.value} см / {getLatestMeasurement("weight")?.value} кг
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Добавьте рост и вес для расчёта BMI</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats - All Types */}
        <div className="grid grid-cols-3 gap-2">
          {measurementTypes.map(({ type, label, unit, icon: Icon }) => {
            const latest = getLatestMeasurement(type)
            const change = getChange(type)

            return (
              <Card key={type}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {change && (
                      <div className={`flex items-center gap-1 text-xs ${
                        type === "body_fat" 
                          ? (change.trend === "down" ? "text-green-500" : "text-red-500")
                          : (change.trend === "down" ? "text-red-500" : "text-green-500")
                      }`}>
                        {change.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {change.value.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="text-xl font-bold">
                    {latest ? `${latest.value}` : "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Detailed Stats for Each Type */}
        {measurementTypes.map(({ type, label, unit, icon: Icon }) => {
          const stats = getStats(type)
          if (!stats || stats.count < 2) return null

          return (
            <Card key={`stats-${type}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium">{label}</h3>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {stats.count} записей
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-red-500">{stats.max}</div>
                    <div className="text-xs text-muted-foreground">Макс</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-500">{stats.avg}</div>
                    <div className="text-xs text-muted-foreground">Средн</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-500">{stats.min}</div>
                    <div className="text-xs text-muted-foreground">Мин</div>
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
              <h3 className="font-medium mb-3">Вес за последний месяц</h3>
              <div className="flex items-end justify-between h-24 gap-1">
                {weightMeasurements.slice(0, 14).reverse().map((m, i) => {
                  const minWeight = Math.min(...weightMeasurements.map((w) => w.value))
                  const maxWeight = Math.max(...weightMeasurements.map((w) => w.value))
                  const range = maxWeight - minWeight || 1
                  const height = ((m.value - minWeight) / range) * 80 + 20

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{weightMeasurements[weightMeasurements.length - 1]?.value || "-"} кг</span>
                <span>{weightMeasurements[0]?.value || "-"} кг</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Measurements */}
        <div>
          <h2 className="text-lg font-semibold mb-3">История</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Загрузка...
              </CardContent>
            </Card>
          ) : measurements.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                Нет записей. Добавьте первое измерение!
              </CardContent>
            </Card>
          ) : (
            measurementTypes.map(({ type, label, unit, icon: Icon }) => {
              const typeMeasurements = getMeasurementsByType(type)
              if (typeMeasurements.length === 0) return null

              return (
                <div key={type} className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {label}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {typeMeasurements.slice(0, 5).map((m) => (
                      <Card key={m.id} className="group">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <span className="font-medium">{m.value} {m.unit}</span>
                            {m.notes && (
                              <span className="text-sm text-muted-foreground ml-2">
                                {m.notes}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(m.date).toLocaleDateString("ru-RU", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                              onClick={() => openEditDialog(m)}
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

        {/* FAB */}
        <div className="fixed bottom-24 left-0 right-0 z-30 pointer-events-none">
          <div className="max-w-[960px] mx-auto px-4">
            <div className="flex justify-end pointer-events-auto">
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg"
                onClick={() => {
                  resetForm()
                  setIsAddDialogOpen(true)
                }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить измерение</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Тип измерения</Label>
                <div className="grid grid-cols-3 gap-2">
                  {measurementTypes.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      className="flex flex-col items-center py-2 h-auto"
                      onClick={() => setSelectedType(type)}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Значение</Label>
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
                    {measurementTypes.find((t) => t.type === selectedType)?.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Опционально"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={addMeasurement}>Добавить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Редактировать измерение</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Тип измерения</Label>
                <div className="grid grid-cols-3 gap-2">
                  {measurementTypes.map(({ type, label, icon: Icon }) => (
                    <Button
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      className="flex flex-col items-center py-2 h-auto"
                      onClick={() => setSelectedType(type)}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span className="text-xs">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-value">Значение</Label>
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
                    {measurementTypes.find((t) => t.type === selectedType)?.unit}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Заметки</Label>
                <Input
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Опционально"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={updateMeasurement}>Сохранить</Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Удалить измерение?</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              Вы уверены, что хотите удалить это измерение? Это действие нельзя отменить.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Отмена
              </Button>
              <Button variant="destructive" onClick={deleteMeasurement}>
                Удалить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}