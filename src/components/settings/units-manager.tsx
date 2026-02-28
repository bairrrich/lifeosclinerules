"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Ruler } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Button } from "@/components/ui/button"
import { CrudManager } from "@/components/shared"
import { useSettings, useUnitTypes } from "./settings-context"
import type { Unit } from "@/types"

export function UnitsManager() {
  const t = useTranslations("settings")
  const tCommon = useTranslations("common")
  const unitTypes = useUnitTypes()
  const { units, editingUnit, setEditingUnit, createUnit, updateUnitData, deleteUnitData } =
    useSettings()

  // Получаем название типа на русском
  const getTypeLabel = (type: Unit["type"]) => {
    return unitTypes.find((t) => t.value === type)?.label || type
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

  const renderForm = (
    item: Unit | null,
    onChange: (updates: Partial<Unit>) => void,
    onSave: () => void,
    onCancel: () => void
  ) => {
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="sr-only">{t("units.name")}</Label>
          <Input
            value={item?.name || ""}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t("units.name")}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="sr-only">{t("units.abbreviation")}</Label>
          <Input
            value={item?.abbreviation || ""}
            onChange={(e) => onChange({ abbreviation: e.target.value })}
            placeholder={t("units.abbreviation")}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="sr-only">{t("units.type")}</Label>
          <NativeSelect
            value={item?.type || "weight"}
            onChange={(e) => onChange({ type: e.target.value as Unit["type"] })}
            className="h-9"
          >
            {unitTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="col-span-3 flex gap-2">
          <Button size="sm" onClick={onSave}>
            {tCommon("save")}
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        </div>
      </div>
    )
  }

  const renderItem = (item: Unit, onEdit: () => void, onDelete: () => void) => {
    return (
      <div className="font-medium">
        {item.name} ({item.abbreviation})
      </div>
    )
  }

  const renderGroupHeader = (groupKey: string, groupItems: Unit[]) => {
    const type = groupKey as Unit["type"]
    return (
      <>
        <span className="text-lg">{getTypeIcon(type)}</span>
        <span className="font-medium text-sm">{getTypeLabel(type)}</span>
        <span className="text-xs text-muted-foreground">({groupItems.length})</span>
      </>
    )
  }

  return (
    <CrudManager
      title={t("units.title")}
      description={t("units.description")}
      icon={Ruler}
      items={units}
      editingItem={editingUnit}
      setEditingItem={setEditingUnit}
      onCreate={createUnit}
      onUpdate={(id: string) => updateUnitData(id, editingUnit!)}
      onDelete={(id: string) => deleteUnitData(id)}
      getKey={(item) => item.id}
      renderForm={renderForm}
      renderItem={renderItem}
      groupBy={(item) => item.type}
      renderGroupHeader={renderGroupHeader}
      emptyMessage={t("units.noUnits")}
    />
  )
}
