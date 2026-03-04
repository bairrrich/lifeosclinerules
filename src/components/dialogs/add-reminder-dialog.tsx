"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Bell } from "@/lib/icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PageActions } from "@/components/shared/page-actions"
import { ReminderForm, getDefaultFormData } from "@/components/reminders"
import { db, createEntity } from "@/lib/db"
import type { Reminder, ReminderType, ReminderPriority } from "@/types"

interface AddReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddReminderDialog({ open, onOpenChange, onSuccess }: AddReminderDialogProps) {
  const t = useTranslations("reminders")
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState(getDefaultFormData())

  async function handleSave() {
    if (!formData.title.trim()) return

    setIsSaving(true)
    try {
      await createEntity(db.reminders, {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        time: formData.time,
        days: formData.days,
        priority: formData.priority,
        advance_minutes: formData.advance_minutes,
        repeat_type: formData.repeat_type,
        is_active: true,
        sound: formData.sound,
        vibration: formData.vibration,
        persistent: formData.persistent,
        related_id: formData.related_id,
        related_type: formData.related_type,
        streak: 0,
        longest_streak: 0,
        total_completed: 0,
      } as Omit<Reminder, "id" | "created_at" | "updated_at">)

      setFormData(getDefaultFormData())
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to save reminder:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t("dialogs.newTitle")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-x-hidden">
          <ReminderForm formData={formData} setFormData={setFormData} />
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
