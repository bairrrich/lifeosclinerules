"use client"

import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  saveText = "Сохранить",
  deleteText = "Удалить",
  type = "dialog",
  showBackButton = true,
}: FormActionsProps) {
  if (type === "page") {
    return (
      <div className="flex justify-between gap-4">
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {isDeleting ? "Удаление..." : deleteText}
        </Button>
        <div className="flex gap-2">
          {showBackButton && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Отмена
            </Button>
          )}
          {onSave && (
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Сохранение..." : saveText}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Dialog variant
  return (
    <div className="flex justify-between gap-4 sm:justify-end sm:gap-2">
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <div className="flex gap-2 ml-auto">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Отмена
        </Button>
        {onSave && (
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Сохранение..." : saveText}
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
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Отмена
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Удаление..." : "Удалить"}
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
  saveText = "Создать",
}: {
  onCancel: () => void
  onSave?: () => void
  isSaving?: boolean
  saveText?: string
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Отмена
      </Button>
      {onSave && (
        <Button
          type="button"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Создание..." : saveText}
        </Button>
      )}
    </div>
  )
}