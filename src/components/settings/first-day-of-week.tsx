"use client"

import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useEffect, useState } from "react"

const STORAGE_KEY = "first-day-of-week"

type FirstDayOfWeek = "sunday" | "monday"

export function FirstDayOfWeekSwitcher() {
  const t = useTranslations("settings")
  const locale = useLocale()
  const [firstDay, setFirstDay] = useState<FirstDayOfWeek>("monday")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY) as FirstDayOfWeek | null
    if (stored) {
      setFirstDay(stored)
    }
  }, [])

  const handleChange = (value: string | string[]) => {
    const newFirstDay = Array.isArray(value) ? value[0] : value
    setFirstDay(newFirstDay as FirstDayOfWeek)
    localStorage.setItem(STORAGE_KEY, newFirstDay)

    // Dispatch custom event for calendar components to listen
    window.dispatchEvent(
      new CustomEvent("first-day-of-week-change", { detail: { firstDay: newFirstDay } })
    )
  }

  if (!mounted) {
    return null
  }

  const options = [
    { id: "monday", label: t("firstDayOfWeek.monday") },
    { id: "sunday", label: t("firstDayOfWeek.sunday") },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("firstDayOfWeek.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>{t("firstDayOfWeek.label")}</Label>
          <Combobox
            options={options}
            value={firstDay}
            onChange={handleChange}
            allowCustom={false}
            searchable={false}
          />
        </div>
      </CardContent>
    </Card>
  )
}
