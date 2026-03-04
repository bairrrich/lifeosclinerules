"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Battery, Brain } from "@/lib/icons"
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
import type { MoodType } from "@/types"

interface QuickMoodDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function QuickMoodDialog({ open, onOpenChange, onSuccess }: QuickMoodDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    mood: "good" as MoodType,
    energy: 3 as 1 | 2 | 3 | 4 | 5,
    stress: 3 as 1 | 2 | 3 | 4 | 5,
    activities: [] as string[],
    notes: "",
  })

  const t = useTranslations("mood")

  const moodConfig: Record<MoodType, { label: string; emoji: string }> = {
    great: { label: t("moods.great"), emoji: "😄" },
    good: { label: t("moods.good"), emoji: "🙂" },
    okay: { label: t("moods.okay"), emoji: "😐" },
    bad: { label: t("moods.bad"), emoji: "😕" },
    terrible: { label: t("moods.terrible"), emoji: "😢" },
  }

  const activityOptions = [
    { id: "work", label: t("activities.work") },
    { id: "exercise", label: t("activities.exercise") },
    { id: "social", label: t("activities.social") },
    { id: "hobby", label: t("activities.hobby") },
    { id: "rest", label: t("activities.rest") },
    { id: "walk", label: t("activities.walk") },
  ]

  async function handleSave() {
    setIsSaving(true)
    try {
      await createEntity(db.moodLogs, {
        date: new Date().toISOString(),
        mood: formData.mood,
        energy: formData.energy,
        stress: formData.stress,
        activities: formData.activities.length > 0 ? formData.activities : undefined,
        notes: formData.notes || undefined,
      })

      // Reset form
      setFormData({
        mood: "good",
        energy: 3,
        stress: 3,
        activities: [],
        notes: "",
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save mood:", error)
    } finally {
      setIsSaving(false)
    }
  }

  function toggleActivity(activity: string) {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter((a) => a !== activity)
        : [...prev.activities, activity],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{t("dialog.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Mood selection */}
          <div className="space-y-2">
            <Label className="text-center block">{t("dialog.mood")}</Label>
            <div className="flex justify-between gap-1">
              {(Object.keys(moodConfig) as MoodType[]).map((mood) => (
                <Button
                  key={mood}
                  variant={formData.mood === mood ? "default" : "outline"}
                  className="flex flex-col items-center px-2 py-2 h-auto flex-1"
                  onClick={() => setFormData({ ...formData, mood })}
                >
                  <span className="text-xl">{moodConfig[mood].emoji}</span>
                  <span className="text-[10px] mt-0.5">{moodConfig[mood].label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Battery className="h-4 w-4" /> {t("dialog.energy")}
            </Label>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as const).map((e) => (
                <Button
                  key={e}
                  variant={formData.energy === e ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, energy: e })}
                  className="flex-1 h-9"
                >
                  {e}
                </Button>
              ))}
            </div>
          </div>

          {/* Stress */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4" /> {t("dialog.stress")}
            </Label>
            <div className="flex gap-1">
              {([1, 2, 3, 4, 5] as const).map((s) => (
                <Button
                  key={s}
                  variant={formData.stress === s ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, stress: s })}
                  className="flex-1 h-9"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            <Label className="text-sm">{t("dialog.activities")}</Label>
            <div className="flex flex-wrap gap-1">
              {activityOptions.map((activity) => (
                <Button
                  key={activity.id}
                  variant={formData.activities.includes(activity.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(activity.id)}
                  className="h-8 text-xs"
                >
                  {activity.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="quick-notes" className="text-sm">
              {t("dialog.notes")}
            </Label>
            <Input
              id="quick-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("dialog.notesPlaceholder")}
              className="h-9"
            />
          </div>
        </div>

        {/* Actions */}
        <DialogFooter>
          <PageActions
            variant="dialog"
            onCancel={() => onOpenChange(false)}
            onSimpleSave={handleSave}
            isSaving={isSaving}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
