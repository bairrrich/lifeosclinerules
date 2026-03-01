"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { db } from "@/lib/db"
import type { Unit } from "@/types"

/**
 * Хук для работы со справочником единиц измерения
 * Загружает единицы из базы данных и предоставляет утилиты для работы с ними
 */
export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Загрузка единиц из БД
  useEffect(() => {
    async function loadUnits() {
      try {
        const data = await db.units.toArray()
        setUnits(data)
      } catch (error) {
        console.error("Failed to load units:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUnits()
  }, [])

  // Получить единицы по типу
  const getUnitsByType = useCallback(
    (type: Unit["type"]) => {
      return units.filter((u) => u.type === type)
    },
    [units]
  )

  // Получить сокращение по id
  const getAbbreviation = useCallback(
    (id: string) => {
      return units.find((u) => u.id === id)?.abbreviation || id
    },
    [units]
  )

  // Получить название по id
  const getName = useCallback(
    (id: string) => {
      return units.find((u) => u.id === id)?.name || id
    },
    [units]
  )

  // Сгруппированные единицы по типу
  const groupedUnits = units.reduce(
    (acc, unit) => {
      if (!acc[unit.type]) {
        acc[unit.type] = []
      }
      acc[unit.type].push(unit)
      return acc
    },
    {} as Record<Unit["type"], Unit[]>
  )

  // Единицы для селекта (value = abbreviation для совместимости)
  const unitOptions = units.map((u) => ({
    value: u.abbreviation,
    label: u.name,
    abbreviation: u.abbreviation,
    type: u.type,
  }))

  return {
    units,
    isLoading,
    getUnitsByType,
    getAbbreviation,
    getName,
    groupedUnits,
    unitOptions,
  }
}

/**
 * Хук для получения локализованных единиц измерения
 * Использует переводы из next-intl для отображения
 */
export function useLocalizedUnits() {
  const t = useTranslations("entities")
  const tUnits = useTranslations("recipes.ingredients.units")

  // Получить перевод сокращения единицы
  const getUnitTranslation = useCallback(
    (abbreviation: string): string => {
      // Маппинг abbreviation на ключи переводов
      const unitKeyMap: Record<string, string> = {
        г: "g",
        кг: "kg",
        мг: "mg",
        мл: "ml",
        л: "l",
        "ч.л.": "tsp",
        "ст.л.": "tbsp",
        стакан: "cup",
        oz: "oz",
        капля: "drop",
        dash: "dash",
        шт: "pcs",
        "зубч.": "clove",
        "щеп.": "pinch",
        "по вкусу": "taste",
        "порц.": "servings",
        мин: "min",
        ч: "hour",
        сек: "sec",
        дн: "days",
        "₽": "RUB",
        $: "USD",
        "€": "EUR",
      }

      const key = unitKeyMap[abbreviation]
      if (key) {
        try {
          return tUnits(key)
        } catch {
          return abbreviation
        }
      }
      return abbreviation
    },
    [tUnits]
  )

  // Получить перевод названия единицы
  const getUnitNameTranslation = useCallback(
    (name: string): string => {
      // Маппинг name на ключи переводов
      const nameKeyMap: Record<string, string> = {
        грамм: "g",
        килограмм: "kg",
        миллиграмм: "mg",
        миллилитр: "ml",
        литр: "l",
        "чайная ложка": "tsp",
        "столовая ложка": "tbsp",
        стакан: "cup",
        унция: "oz",
        капля: "drop",
        деш: "dash",
        штука: "pcs",
        зубчик: "clove",
        щепотка: "pinch",
        "по вкусу": "taste",
        минута: "min",
        час: "hour",
        рубль: "RUB",
        доллар: "USD",
        евро: "EUR",
      }

      const key = nameKeyMap[name]
      if (key) {
        try {
          return tUnits(key)
        } catch {
          return name
        }
      }
      return name
    },
    [tUnits]
  )

  return {
    getUnitTranslation,
    getUnitNameTranslation,
  }
}

/**
 * Дефолтные единицы измерения (используются если БД пуста)
 */
export const defaultUnits: Unit[] = [
  // Вес
  { id: "g", name: "грамм", abbreviation: "г", type: "weight", created_at: "", updated_at: "" },
  {
    id: "kg",
    name: "килограмм",
    abbreviation: "кг",
    type: "weight",
    created_at: "",
    updated_at: "",
  },
  {
    id: "mg",
    name: "миллиграмм",
    abbreviation: "мг",
    type: "weight",
    created_at: "",
    updated_at: "",
  },

  // Объём
  {
    id: "ml",
    name: "миллилитр",
    abbreviation: "мл",
    type: "volume",
    created_at: "",
    updated_at: "",
  },
  { id: "l", name: "литр", abbreviation: "л", type: "volume", created_at: "", updated_at: "" },
  {
    id: "tsp",
    name: "чайная ложка",
    abbreviation: "ч.л.",
    type: "volume",
    created_at: "",
    updated_at: "",
  },
  {
    id: "tbsp",
    name: "столовая ложка",
    abbreviation: "ст.л.",
    type: "volume",
    created_at: "",
    updated_at: "",
  },
  {
    id: "cup",
    name: "стакан",
    abbreviation: "стакан",
    type: "volume",
    created_at: "",
    updated_at: "",
  },
  { id: "oz", name: "унция", abbreviation: "oz", type: "volume", created_at: "", updated_at: "" },
  {
    id: "drop",
    name: "капля",
    abbreviation: "капля",
    type: "volume",
    created_at: "",
    updated_at: "",
  },
  { id: "dash", name: "деш", abbreviation: "dash", type: "volume", created_at: "", updated_at: "" },

  // Штуки
  { id: "pcs", name: "штука", abbreviation: "шт", type: "count", created_at: "", updated_at: "" },
  {
    id: "clove",
    name: "зубчик",
    abbreviation: "зубч.",
    type: "count",
    created_at: "",
    updated_at: "",
  },
  {
    id: "pinch",
    name: "щепотка",
    abbreviation: "щепотка",
    type: "count",
    created_at: "",
    updated_at: "",
  },
  {
    id: "taste",
    name: "по вкусу",
    abbreviation: "по вкусу",
    type: "count",
    created_at: "",
    updated_at: "",
  },

  // Время
  { id: "min", name: "минута", abbreviation: "мин", type: "time", created_at: "", updated_at: "" },
  { id: "hour", name: "час", abbreviation: "ч", type: "time", created_at: "", updated_at: "" },

  // Деньги
  { id: "rub", name: "рубль", abbreviation: "₽", type: "money", created_at: "", updated_at: "" },
  { id: "usd", name: "доллар", abbreviation: "$", type: "money", created_at: "", updated_at: "" },
  { id: "eur", name: "евро", abbreviation: "€", type: "money", created_at: "", updated_at: "" },
]
