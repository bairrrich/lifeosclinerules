"use client"

import { ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DrinkRecipeMetadata, ServingTemperature } from "@/types"

// ============================================
// Константы
// ============================================

export const drinkTypes = [
  { value: "tea", label: "Чай" },
  { value: "coffee", label: "Кофе" },
  { value: "smoothie", label: "Смузи" },
  { value: "juice", label: "Сок" },
  { value: "lemonade", label: "Лимонад" },
  { value: "milkshake", label: "Молочный коктейль" },
  { value: "compote", label: "Компот" },
  { value: "cocoa", label: "Какао" },
]

export const drinkBases = [
  "Вода", "Молоко", "Сливки", "Сок", "Чай", "Кофе",
  "Йогурт", "Кефир", "Растительное молоко", "Другое"
]

export const servingTemperatures: { value: ServingTemperature; label: string }[] = [
  { value: "hot", label: "Горячий" },
  { value: "warm", label: "Тёплый" },
  { value: "room", label: "Комнатной температуры" },
  { value: "cold", label: "Холодный" },
  { value: "iced", label: "Ледяной" },
]

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
  const updateField = <K extends keyof DrinkRecipeMetadata>(field: K, value: DrinkRecipeMetadata[K]) => {
    onChange({ ...metadata, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Параметры напитка</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Тип напитка */}
        <div className="space-y-2">
          <Label>Тип напитка</Label>
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={metadata.drink_type || ""}
              onChange={(e) => updateField("drink_type", e.target.value as DrinkRecipeMetadata['drink_type'] || undefined)}
              style={{
                backgroundImage: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              }}
            >
              <option value="" disabled>Выберите тип</option>
              {drinkTypes.map((dt) => (
                <option key={dt.value} value={dt.value}>{dt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        {/* Основа */}
        <div className="space-y-2">
          <Label>Основа</Label>
          <div className="relative">
            <select
              className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={metadata.base || ""}
              onChange={(e) => updateField("base", e.target.value || undefined)}
              style={{
                backgroundImage: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
              }}
            >
              <option value="">Не указана</option>
              {drinkBases.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          </div>
        </div>

        {/* Температура подачи */}
        <div className="space-y-2">
          <Label>Температура подачи</Label>
          <div className="grid grid-cols-5 gap-2">
            {servingTemperatures.map((st) => (
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
          <span className="text-sm">Газированный напиток</span>
        </label>

        {/* Объём порции */}
        <div className="space-y-2">
          <Label htmlFor="volume_ml">Объём порции (мл)</Label>
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
          <Label htmlFor="caffeine_mg">Кофеин (мг)</Label>
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