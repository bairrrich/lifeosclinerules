"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle } from "@/lib/icons"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  onConfirm: () => Promise<void> | void
  onCancel?: () => void
  isLoading?: boolean
  icon?: React.ElementType
}

/**
 * Универсальный диалог подтверждения
 * Используется для подтверждений удаления и других опасных действий
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false,
  icon: Icon,
}: ConfirmationDialogProps) {
  const t = useTranslations("common")
  const tLoading = useTranslations("loading")

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const DefaultIcon = variant === "destructive" ? AlertTriangle : AlertTriangle
  const IconComponent = Icon || DefaultIcon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {IconComponent && (
              <div
                className={cn(
                  "p-2 rounded-full",
                  variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
                )}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel || t("cancel")}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? tLoading("loading") : confirmLabel || t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
