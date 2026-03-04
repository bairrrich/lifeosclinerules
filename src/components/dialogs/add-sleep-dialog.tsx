"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Moon } from "@/lib/icons"
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
import type { SleepLog } from "@/types"

interface AddSleepDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddSleepDialog({ open, onOpenChange, onSuccess }: AddSleepDialogProps) {
  const t = useTranslations("sleep")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    start_time: "22:00",
    end_time: "06:00",
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: "",
  })

  const qualityLabels: Record<number, string> = {
    1: "veryPoor",
    2: "poor",
    3: "okay",
    4: "good",
    5: "excellent",
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await createEntity(db.sleepLogs, {
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        quality: formData.quality,
        notes: formData.notes || undefined,
      } as Omit<SleepLog, "id" | "created_at" | "updated_at">)

      setFormData({
        date: new Date().toISOString().split("T")[0],
        start_time: "22:00",
        end_time: "06:00",
        quality: 3,
        notes: "",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save sleep log:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            {t("dialogs.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="date">{t("dialogs.dateLabel")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(new Date(formData.date), "LLL dd, y", { locale: dateFnsLocale })
                  ) : (
                    <span>{t("dialogs.dateLabel")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" side="bottom" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={(date) =>
                    setFormData({ ...formData, date: date ? format(date, "yyyy-MM-dd") : "" })
                  }
                  initialFocus
                  locale={dateFnsLocale}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">{t("dialogs.bedtimeLabel")}</Label>
              <Input
                id="start"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">{t("dialogs.wakeTimeLabel")}</Label>
              <Input
                id="end"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("dialogs.qualityLabel")}</Label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as const).map((q) => (
                <Button
                  key={q}
                  variant={formData.quality === q ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, quality: q })}
                  className="flex-1"
                >
                  {q}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {t(`quality.${qualityLabels[formData.quality]}`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("dialogs.notesLabel")}</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("dialogs.notesPlaceholder")}
            />
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
