"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Target } from "@/lib/icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PageActions } from "@/components/shared/page-actions"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { db, createEntity } from "@/lib/db"
import type { Habit } from "@/types"

interface AddHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddHabitDialog({ open, onOpenChange, onSuccess }: AddHabitDialogProps) {
  const t = useTranslations("habits")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily" as "daily" | "weekly" | "custom",
    start_date: new Date().toISOString().split("T")[0],
  })

  async function handleSave() {
    setIsSaving(true)
    try {
      await createEntity(db.habits, {
        name: formData.name,
        habit_type: "positive" as "positive" | "negative",
        frequency: formData.frequency,
        start_date: formData.start_date,
        is_active: true,
      })

      setFormData({
        name: "",
        frequency: "daily",
        start_date: new Date().toISOString().split("T")[0],
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save habit:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("dialogs.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">{t("dialogs.nameLabel")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("dialogs.namePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("dialogs.frequencyLabel")}</Label>
            <div className="flex gap-2">
              <Button
                variant={formData.frequency === "daily" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, frequency: "daily" })}
                className="flex-1"
              >
                {t("frequencies.daily")}
              </Button>
              <Button
                variant={formData.frequency === "weekly" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, frequency: "weekly" })}
                className="flex-1"
              >
                {t("frequencies.weekly")}
              </Button>
              <Button
                variant={formData.frequency === "custom" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, frequency: "custom" })}
                className="flex-1"
              >
                {t("frequencies.custom")}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start-date">{t("dialogs.startDateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.start_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.start_date ? (
                    format(new Date(formData.start_date), "LLL dd, y", { locale: dateFnsLocale })
                  ) : (
                    <span>{t("dialogs.startDateLabel")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={formData.start_date ? new Date(formData.start_date) : undefined}
                  onSelect={(date) =>
                    setFormData({
                      ...formData,
                      start_date: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  initialFocus
                  locale={dateFnsLocale}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="flex justify-center sm:justify-center">
          <PageActions
            variant="dialog"
            onCancel={() => {
              onOpenChange(false)
            }}
            onSimpleSave={handleSave}
            isSaving={isSaving}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
