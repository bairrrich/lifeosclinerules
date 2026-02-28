"use client"

import { useTranslations } from "next-intl"
import { Combobox } from "@/components/ui/combobox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DrinkRecipeMetadata, ServingTemperature } from "@/types"

// ============================================
// Функции для получения локализованных конфигураций
// ============================================

export function getDrinkTypes(t: any) {
  return [
    { value: "tea", label: t("drinkTypes.tea") },
    { value: "coffee", label: t("drinkTypes.coffee") },
    { value: "smoothie", label: t("drinkTypes.smoothie") },
    { value: "juice", label: t("drinkTypes.juice") },
    { value: "lemonade", label: t("drinkTypes.lemonade") },
    { value: "milkshake", label: t("drinkTypes.milkshake") },
    { value: "compote", label: t("drinkTypes.compote") },
    { value: "cocoa", label: t("drinkTypes.cocoa") },
  ]
}

export function getDrinkBases(t: any) {
  return [
    t("drinkBases.water"),
    t("drinkBases.milk"),
    t("drinkBases.cream"),
    t("drinkBases.juice"),
    t("drinkBases.tea"),
    t("drinkBases.coffee"),
    t("drinkBases.yogurt"),
    t("drinkBases.kefir"),
    t("drinkBases.plantMilk"),
    t("drinkBases.other"),
  ]
}

export function getServingTemperatures(t: any) {
  return [
    { value: "hot" as ServingTemperature, label: t("servingTemperatures.hot") },
    { value: "warm" as ServingTemperature, label: t("servingTemperatures.warm") },
    { value: "room" as ServingTemperature, label: t("servingTemperatures.room") },
    { value: "cold" as ServingTemperature, label: t("servingTemperatures.cold") },
    { value: "iced" as ServingTemperature, label: t("servingTemperatures.iced") },
  ]
}

// ============================================
// Интерфейсы
// ============================================

interface DrinkRecipeFormProps {
  metadata: DrinkRecipeMetadata
  onChange: (metadata: DrinkRecipeMetadata) => void
}

// ============================================
// Компонент
// ============================================

export function DrinkRecipeForm({ metadata, onChange }: DrinkRecipeFormProps) {
  const t = useTranslations("recipes")
  const updateField = <K extends keyof DrinkRecipeMetadata>(
    field: K,
    value: DrinkRecipeMetadata[K]
  ) => {
    onChange({ ...metadata, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("forms.drinkParameters")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тип напитка */}
        <div className="space-y-2">
          <Label>{t("fields.drinkType")}</Label>
          <Combobox
            options={getDrinkTypes(t).map((dt) => ({ id: dt.value, label: dt.label }))}
            value={metadata.drink_type || ""}
            onChange={(value) =>
              updateField("drink_type", (value as DrinkRecipeMetadata["drink_type"]) || undefined)
            }
            placeholder={t("forms.selectPlaceholder")}
            allowCustom={false}
            searchable={false}
          />
        </div>

        {/* Основа */}
        <div className="space-y-2">
          <Label>{t("fields.base")}</Label>
          <Combobox
            options={getDrinkBases(t).map((b) => ({ id: b, label: b }))}
            value={metadata.base || ""}
            onChange={(value) => updateField("base", (value as string) || undefined)}
            placeholder={t("forms.notSpecified")}
            allowCustom={false}
            searchable={false}
          />
        </div>

        {/* Температура подачи */}
        <div className="space-y-2">
          <Label>{t("fields.servingTemperature")}</Label>
          <div className="grid grid-cols-5 gap-2">
            {getServingTemperatures(t).map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => updateField("serving_temperature", st.value)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.serving_temperature === st.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Газированный */}
        <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent">
          <input
            type="checkbox"
            checked={metadata.is_carbonated || false}
            onChange={(e) => updateField("is_carbonated", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">{t("fields.isCarbonated")}</span>
        </label>

        {/* Объём порции */}
        <div className="space-y-2">
          <Label htmlFor="volume_ml">{t("fields.volumeMl")}</Label>
          <Input
            id="volume_ml"
            type="number"
            placeholder="250"
            value={metadata.volume_ml || ""}
            onChange={(e) => updateField("volume_ml", parseInt(e.target.value) || undefined)}
          />
        </div>

        {/* Кофеин */}
        <div className="space-y-2">
          <Label htmlFor="caffeine_mg">{t("fields.caffeineMg")}</Label>
          <Input
            id="caffeine_mg"
            type="number"
            placeholder="0"
            value={metadata.caffeine_mg || ""}
            onChange={(e) => updateField("caffeine_mg", parseInt(e.target.value) || undefined)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
