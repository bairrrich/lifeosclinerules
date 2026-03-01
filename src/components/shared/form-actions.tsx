"use client"

import { ArrowLeft, Save, Trash2, X, Plus } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface FormActionsProps {
  /** Показывать ли кнопку удаления */
  showDelete?: boolean
  /** Обработчик удаления */
  onDelete?: () => void
  /** Состояние загрузки удаления */
  isDeleting?: boolean
  /** Обработчик отмены */
  onCancel: () => void
  /** Обработчик сохранения */
  onSave?: () => void
  /** Состояние загрузки сохранения */
  isSaving?: boolean
  /** Текст кнопки сохранения */
  saveText?: string
  /** Текст кнопки удаления */
  deleteText?: string
  /** Тип: 'page' для страниц редактирования, 'dialog' для диалогов */
  type?: "page" | "dialog"
  /** Для диалога: использовать кнопку закрытия вместо возврата */
  showBackButton?: boolean
}

/**
 * Переиспользуемый компонент для кнопок действий формы
 *
 * Использование:
 * - type="page": Для отдельных страниц редактирования (кнопка назад + удалить + отмена + сохранить)
 * - type="dialog": Для диалогов (удалить + отмена + сохранить)
 */
export function FormActions({
  showDelete = false,
  onDelete,
  isDeleting = false,
  onCancel,
  onSave,
  isSaving = false,
  saveText,
  deleteText,
  type = "dialog",
  showBackButton = true,
}: FormActionsProps) {
  const t = useTranslations("common")
  const tl = useTranslations("loading")

  const saveLabel = saveText || t("save")
  const deleteLabel = deleteText || t("delete")
  const cancelLabel = t("cancel")
  const savingLabel = isSaving ? tl("saving") : saveLabel
  const deletingLabel = isDeleting ? tl("deleting") : deleteLabel

  if (type === "page") {
    return (
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="destructive"
          size="action-sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? tl("deleting") : deleteLabel}
        </Button>
        <div className="flex gap-2">
          {showBackButton && (
            <Button type="button" variant="outline" size="action-sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {cancelLabel}
            </Button>
          )}
          {onSave && (
            <Button type="submit" size="action-sm" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? tl("saving") : saveLabel}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Dialog variant
  return (
    <div className="flex justify-between gap-2">
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          size="action-sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">{isDeleting ? tl("deleting") : deleteLabel}</span>
        </Button>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="action-sm" onClick={onCancel}>
          <X className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">{cancelLabel}</span>
        </Button>
        {onSave && (
          <Button type="button" size="action-sm" onClick={onSave} disabled={isSaving}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{isSaving ? tl("saving") : saveLabel}</span>
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Компонент для диалогов с подтверждением удаления
 */
export function DeleteConfirmActions({
  onCancel,
  onConfirm,
  isLoading = false,
}: {
  onCancel: () => void
  onConfirm: () => void
  isLoading?: boolean
}) {
  const t = useTranslations("common")
  const tl = useTranslations("loading")

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" size="action-sm" onClick={onCancel}>
        {t("cancel")}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="action-sm"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? tl("deleting") : t("delete")}
      </Button>
    </div>
  )
}

/**
 * Компонент для форм создания (без удаления)
 */
export function CreateFormActions({
  onCancel,
  onSave,
  isSaving = false,
  saveText,
}: {
  onCancel: () => void
  onSave?: () => void
  isSaving?: boolean
  saveText?: string
}) {
  const t = useTranslations("common")
  const tl = useTranslations("loading")

  const saveLabel = saveText || t("create")

  return (
    <div className="flex gap-2">
      <Button type="button" variant="outline" size="action-sm" onClick={onCancel}>
        <X className="h-4 w-4" />
        <span className="hidden sm:inline ml-2">{t("cancel")}</span>
      </Button>
      {onSave && (
        <Button type="button" size="action-sm" onClick={onSave} disabled={isSaving}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">{isSaving ? tl("creating") : saveLabel}</span>
        </Button>
      )}
    </div>
  )
}
