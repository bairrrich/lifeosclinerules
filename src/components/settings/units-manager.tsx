"use client"

import { useState } from "react"
import { Ruler, Plus, Edit2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSettings, unitTypes } from "./settings-context"
import type { Unit } from "@/types"

export function UnitsManager() {
  const {
    units,
    editingUnit,
    setEditingUnit,
    createUnit,
    updateUnitData,
    deleteUnitData,
  } = useSettings()

  const [newUnit, setNewUnit] = useState({
    name: "",
    abbreviation: "",
    type: "weight" as Unit["type"],
  })

  const handleCreate = async () => {
    if (!newUnit.name.trim() || !newUnit.abbreviation.trim()) return
    await createUnit({
      name: newUnit.name,
      abbreviation: newUnit.abbreviation,
      type: newUnit.type,
    })
    setNewUnit({ name: "", abbreviation: "", type: "weight" })
  }

  const handleUpdate = async () => {
    if (!editingUnit) return
    await updateUnitData(editingUnit.id, {
      name: editingUnit.name,
      abbreviation: editingUnit.abbreviation,
      type: editingUnit.type,
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Удалить единицу измерения?")) {
      await deleteUnitData(id)
    }
  }

  // Группируем единицы по типу
  const groupedUnits = units.reduce((acc, unit) => {
    if (!acc[unit.type]) {
      acc[unit.type] = []
    }
    acc[unit.type].push(unit)
    return acc
  }, {} as Record<Unit["type"], Unit[]>)

  // Получаем название типа на русском
  const getTypeLabel = (type: Unit["type"]) => {
    return unitTypes.find(t => t.value === type)?.label || type
  }

  // Получаем иконку для типа
  const getTypeIcon = (type: Unit["type"]) => {
    const icons: Record<Unit["type"], string> = {
      weight: "⚖️",
      volume: "🥛",
      count: "🔢",
      time: "⏱️",
      money: "💰",
    }
    return icons[type] || "📏"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-5 w-5" />
          Единицы измерения
        </CardTitle>
        <CardDescription>Справочник единиц измерения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список единиц по группам */}
        {units.length > 0 ? (
          <div className="space-y-4">
            {unitTypes.map((typeInfo) => {
              const groupUnits = groupedUnits[typeInfo.value as Unit["type"]]
              if (!groupUnits || groupUnits.length === 0) return null

              return (
                <div key={typeInfo.value} className="space-y-2">
                  {/* Заголовок группы */}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-lg">{getTypeIcon(typeInfo.value as Unit["type"])}</span>
                    <span className="font-medium text-sm">{typeInfo.label}</span>
                    <span className="text-xs text-muted-foreground">
                      ({groupUnits.length})
                    </span>
                  </div>

                  {/* Единицы группы */}
                  <div className="grid grid-cols-2 gap-2">
                    {groupUnits.map((unit) => (
                      <div key={unit.id} className="p-3 rounded-xl bg-muted">
                        {editingUnit?.id === unit.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1">
                              <Input
                                value={editingUnit.name}
                                onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                                placeholder="Название"
                                className="h-8"
                              />
                              <Input
                                value={editingUnit.abbreviation}
                                onChange={(e) => setEditingUnit({ ...editingUnit, abbreviation: e.target.value })}
                                placeholder="Сокращение"
                                className="h-8"
                              />
                            </div>
                            <select
                              className="flex h-8 rounded-lg border border-input bg-background px-2 py-1 text-xs w-full"
                              value={editingUnit.type}
                              onChange={(e) => setEditingUnit({ ...editingUnit, type: e.target.value as Unit["type"] })}
                            >
                              {unitTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <div className="flex gap-1">
                              <Button size="sm" className="h-7 text-xs" onClick={handleUpdate}>
                                Сохранить
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingUnit(null)}>
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{unit.name} ({unit.abbreviation})</div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingUnit(unit)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleDelete(unit.id)}>
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            Нет единиц измерения
          </div>
        )}

        {/* Форма добавления */}
        <div className="p-3 rounded-xl border-2 border-dashed space-y-2">
          <div className="text-sm font-medium">Добавить единицу</div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              value={newUnit.name}
              onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
              placeholder="Название"
            />
            <Input
              value={newUnit.abbreviation}
              onChange={(e) => setNewUnit({ ...newUnit, abbreviation: e.target.value })}
              placeholder="Сокращение"
            />
            <select
              className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
              value={newUnit.type}
              onChange={(e) => setNewUnit({ ...newUnit, type: e.target.value as Unit["type"] })}
            >
              {unitTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Button onClick={handleCreate} disabled={!newUnit.name.trim() || !newUnit.abbreviation.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}