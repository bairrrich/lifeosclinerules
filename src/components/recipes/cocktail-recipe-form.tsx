"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "@/lib/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import type { CocktailRecipeMetadata, CocktailMethod, GlassType, IceType } from "@/types"

// ============================================
// Функции для получения локализованных конфигураций
// ============================================

export function getCocktailMethods(t: any) {
  return [
    {
      value: "shaken" as CocktailMethod,
      label: t("cocktailDetails.methods.shaken"),
      description: t("cocktailDetails.methodDescriptions.shaken"),
    },
    {
      value: "stirred" as CocktailMethod,
      label: t("cocktailDetails.methods.stirred"),
      description: t("cocktailDetails.methodDescriptions.stirred"),
    },
    {
      value: "blended" as CocktailMethod,
      label: t("cocktailDetails.methods.blended"),
      description: t("cocktailDetails.methodDescriptions.blended"),
    },
    {
      value: "built" as CocktailMethod,
      label: t("cocktailDetails.methods.built"),
      description: t("cocktailDetails.methodDescriptions.built"),
    },
    {
      value: "muddled" as CocktailMethod,
      label: t("cocktailDetails.methods.muddled"),
      description: t("cocktailDetails.methodDescriptions.muddled"),
    },
    {
      value: "layered" as CocktailMethod,
      label: t("cocktailDetails.methods.layered"),
      description: t("cocktailDetails.methodDescriptions.layered"),
    },
  ]
}

export function getGlassTypes(t: any) {
  return [
    { value: "highball" as GlassType, label: t("cocktailDetails.glassTypes.highball") },
    { value: "lowball" as GlassType, label: t("cocktailDetails.glassTypes.lowball") },
    { value: "martini" as GlassType, label: t("cocktailDetails.glassTypes.martini") },
    { value: "coupe" as GlassType, label: t("cocktailDetails.glassTypes.coupe") },
    { value: "margarita" as GlassType, label: t("cocktailDetails.glassTypes.margarita") },
    { value: "hurricane" as GlassType, label: t("cocktailDetails.glassTypes.hurricane") },
    { value: "shot" as GlassType, label: t("cocktailDetails.glassTypes.shot") },
    { value: "wine" as GlassType, label: t("cocktailDetails.glassTypes.wine") },
    { value: "champagne" as GlassType, label: t("cocktailDetails.glassTypes.champagne") },
    { value: "mug" as GlassType, label: t("cocktailDetails.glassTypes.mug") },
    { value: "collins" as GlassType, label: t("cocktailDetails.glassTypes.collins") },
    { value: "rocks" as GlassType, label: t("cocktailDetails.glassTypes.rocks") },
  ]
}

export function getIceTypes(t: any) {
  return [
    { value: "cubed" as IceType, label: t("cocktailDetails.iceTypes.cubed") },
    { value: "crushed" as IceType, label: t("cocktailDetails.iceTypes.crushed") },
    { value: "sphere" as IceType, label: t("cocktailDetails.iceTypes.sphere") },
    { value: "none" as IceType, label: t("cocktailDetails.iceTypes.none") },
  ]
}

export function getBaseSpirits(t: any) {
  return [
    t("cocktailDetails.baseSpirits.vodka"),
    t("cocktailDetails.baseSpirits.gin"),
    t("cocktailDetails.baseSpirits.rumWhite"),
    t("cocktailDetails.baseSpirits.rumDark"),
    t("cocktailDetails.baseSpirits.tequila"),
    t("cocktailDetails.baseSpirits.whiskey"),
    t("cocktailDetails.baseSpirits.bourbon"),
    t("cocktailDetails.baseSpirits.cognac"),
    t("cocktailDetails.baseSpirits.brandy"),
    t("cocktailDetails.baseSpirits.liqueur"),
    t("cocktailDetails.baseSpirits.absinthe"),
    t("cocktailDetails.baseSpirits.other"),
  ]
}

export function getIBACategories(t: any) {
  return [
    t("cocktailDetails.ibaCategories.unforgettables"),
    t("cocktailDetails.ibaCategories.contemporaryClassics"),
    t("cocktailDetails.ibaCategories.newEraDrinks"),
    t("cocktailDetails.ibaCategories.tequila"),
    t("cocktailDetails.ibaCategories.vodka"),
    t("cocktailDetails.ibaCategories.gin"),
    t("cocktailDetails.ibaCategories.rum"),
    t("cocktailDetails.ibaCategories.whiskey"),
    t("cocktailDetails.ibaCategories.brandy"),
    t("cocktailDetails.ibaCategories.liqueur"),
  ]
}

export function getCocktailTools(t: any) {
  return [
    t("cocktailDetails.tools.shaker"),
    t("cocktailDetails.tools.bostonShaker"),
    t("cocktailDetails.tools.jigger"),
    t("cocktailDetails.tools.muddler"),
    t("cocktailDetails.tools.barSpoon"),
    t("cocktailDetails.tools.strainer"),
    t("cocktailDetails.tools.hawthorneStrainer"),
    t("cocktailDetails.tools.julepStrainer"),
    t("cocktailDetails.tools.pestle"),
    t("cocktailDetails.tools.cone"),
    t("cocktailDetails.tools.other"),
  ]
}

export function getGarnishOptions(t: any) {
  return [
    t("cocktailDetails.garnish.lemon"),
    t("cocktailDetails.garnish.lime"),
    t("cocktailDetails.garnish.orange"),
    t("cocktailDetails.garnish.grapefruit"),
    t("cocktailDetails.garnish.mint"),
    t("cocktailDetails.garnish.basil"),
    t("cocktailDetails.garnish.olives"),
    t("cocktailDetails.garnish.cherry"),
    t("cocktailDetails.garnish.pineapple"),
    t("cocktailDetails.garnish.strawberry"),
    t("cocktailDetails.garnish.sugarRim"),
    t("cocktailDetails.garnish.salt"),
    t("cocktailDetails.garnish.lemonZest"),
    t("cocktailDetails.garnish.orangeZest"),
    t("cocktailDetails.garnish.cucumber"),
    t("cocktailDetails.garnish.other"),
  ]
}

// ============================================
// Интерфейсы
// ============================================

interface CocktailRecipeFormProps {
  metadata: CocktailRecipeMetadata
  onChange: (metadata: CocktailRecipeMetadata) => void
}

// ============================================
// Компонент
// ============================================

export function CocktailRecipeForm({ metadata, onChange }: CocktailRecipeFormProps) {
  const t = useTranslations("recipes")

  const updateField = <K extends keyof CocktailRecipeMetadata>(
    field: K,
    value: CocktailRecipeMetadata[K]
  ) => {
    onChange({ ...metadata, [field]: value })
  }

  const toggleArrayItem = (field: "garnish" | "tools", item: string) => {
    const current = metadata[field] || []
    if (current.includes(item)) {
      updateField(
        field,
        current.filter((i) => i !== item)
      )
    } else {
      updateField(field, [...current, item])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("cocktailDetails.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Алкогольный / Безалкогольный */}
        <div className="space-y-2">
          <Label>{t("fields.drinkType")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateField("is_alcoholic", true)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                metadata.is_alcoholic
                  ? "bg-purple-500 text-white border-purple-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              🍸 {t("cocktailDetails.alcoholic")}
            </button>
            <button
              type="button"
              onClick={() => updateField("is_alcoholic", false)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                !metadata.is_alcoholic
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-background hover:bg-accent"
              }`}
            >
              🍹 {t("cocktailDetails.nonAlcoholic")}
            </button>
          </div>
        </div>

        {/* Крепость (если алкогольный) */}
        {metadata.is_alcoholic && (
          <>
            <div className="space-y-2">
              <Label htmlFor="alcohol_percent">{t("fields.alcoholPercent")}</Label>
              <Input
                id="alcohol_percent"
                type="number"
                placeholder="12"
                min={0}
                max={80}
                value={metadata.alcohol_percent || ""}
                onChange={(e) =>
                  updateField("alcohol_percent", parseFloat(e.target.value) || undefined)
                }
              />
            </div>

            {/* Базовый спирт */}
            <div className="space-y-2">
              <Label>{t("fields.baseSpirit")}</Label>
              <Combobox
                options={getBaseSpirits(t).map((s) => ({ id: s, label: s }))}
                value={metadata.base_spirit || ""}
                onChange={(value) => updateField("base_spirit", (value as string) || undefined)}
                placeholder={t("forms.notSpecified")}
                allowCustom={false}
                searchable={false}
              />
            </div>

            {/* IBA категория */}
            <div className="space-y-2">
              <Label>{t("fields.ibaCategory")}</Label>
              <Combobox
                options={getIBACategories(t).map((c) => ({ id: c, label: c }))}
                value={metadata.iba_category || ""}
                onChange={(value) => updateField("iba_category", (value as string) || undefined)}
                placeholder={t("forms.notSpecified")}
                allowCustom={false}
                searchable={false}
              />
            </div>
          </>
        )}

        {/* Метод приготовления */}
        <div className="space-y-2">
          <Label>{t("fields.cocktailMethod")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {getCocktailMethods(t).map((cm) => (
              <button
                key={cm.value}
                type="button"
                onClick={() => updateField("cocktail_method", cm.value)}
                className={`px-2 py-2 text-xs rounded-lg border transition-colors ${
                  metadata.cocktail_method === cm.value
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-background hover:bg-accent"
                }`}
                title={cm.description}
              >
                {cm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Бокал */}
        <div className="space-y-2">
          <Label>{t("fields.glassType")}</Label>
          <Combobox
            options={getGlassTypes(t).map((gt) => ({ id: gt.value, label: gt.label }))}
            value={metadata.glass_type || ""}
            onChange={(value) => updateField("glass_type", (value as GlassType) || undefined)}
            placeholder={t("forms.notSpecified")}
            allowCustom={false}
            searchable={false}
          />
        </div>

        {/* Тип льда */}
        <div className="space-y-2">
          <Label>{t("fields.iceType")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {getIceTypes(t).map((it) => (
              <button
                key={it.value}
                type="button"
                onClick={() => updateField("ice_type", it.value)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.ice_type === it.value
                    ? "bg-cyan-500 text-white border-cyan-500"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>

        {/* Цвет */}
        <div className="space-y-2">
          <Label htmlFor="color">{t("fields.color")}</Label>
          <Input
            id="color"
            placeholder={t("placeholders.color")}
            value={metadata.color || ""}
            onChange={(e) => updateField("color", e.target.value || undefined)}
          />
        </div>

        {/* Гарнир */}
        <div className="space-y-2">
          <Label>{t("fields.garnish")}</Label>
          <div className="grid grid-cols-4 gap-2">
            {getGarnishOptions(t).map((g, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleArrayItem("garnish", g)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.garnish?.includes(g)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Инструменты */}
        <div className="space-y-2">
          <Label>{t("fields.tools")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {getCocktailTools(t).map((t, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleArrayItem("tools", t)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  metadata.tools?.includes(t)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
