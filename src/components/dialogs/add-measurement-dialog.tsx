"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Dumbbell } from "@/lib/icons"
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
import { PageActions } from "@/components/shared/page-actions"
import { db, createEntity } from "@/lib/db"
import type { BodyMeasurementType } from "@/types"

interface AddMeasurementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const measurementTypes: {
  type: BodyMeasurementType
  label: string
  unit: string
  icon: typeof Dumbbell
}[] = [
  { type: "weight", label: "Weight", unit: "kg", icon: Dumbbell },
  { type: "bodyFat", label: "Body Fat", unit: "%", icon: Dumbbell },
  { type: "muscleMass", label: "Muscle Mass", unit: "kg", icon: Dumbbell },
  { type: "bmi", label: "BMI", unit: "", icon: Dumbbell },
  { type: "waist", label: "Waist", unit: "cm", icon: Dumbbell },
  { type: "hips", label: "Hips", unit: "cm", icon: Dumbbell },
  { type: "chest", label: "Chest", unit: "cm", icon: Dumbbell },
  { type: "biceps", label: "Biceps", unit: "cm", icon: Dumbbell },
  { type: "thigh", label: "Thigh", unit: "cm", icon: Dumbbell },
  { type: "calf", label: "Calf", unit: "cm", icon: Dumbbell },
  { type: "neck", label: "Neck", unit: "cm", icon: Dumbbell },
]

export function AddMeasurementDialog({ open, onOpenChange, onSuccess }: AddMeasurementDialogProps) {
  const t = useTranslations("body")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedType, setSelectedType] = useState<BodyMeasurementType>("weight")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")

  async function handleSave() {
    setIsSaving(true)
    try {
      await createEntity(db.bodyMeasurements, {
        date: new Date().toISOString().split("T")[0],
        type: selectedType,
        value: parseFloat(value),
        notes: notes || undefined,
      })

      setValue("")
      setNotes("")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save measurement:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {t("dialogs.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t("dialogs.typeLabel")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {measurementTypes.map((item) => (
                <Button
                  key={item.type}
                  variant={selectedType === item.type ? "default" : "outline"}
                  className="flex flex-col items-center py-2 h-auto"
                  onClick={() => setSelectedType(item.type)}
                >
                  <item.icon className="h-4 w-4 mb-1" />
                  <span className="text-xs">{t(`measurementTypes.${item.type}`)}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">{t("dialogs.valueLabel")}</Label>
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
                {t(`units.${measurementTypes.find((t) => t.type === selectedType)?.unit}`)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("dialogs.notesLabel")}</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
