"use client"

import { useState } from "react"
import { useRouter } from "@/lib/navigation"
import { ArrowLeft, Save, Trash2 } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

export interface PageActionsProps {
  // === Для режима с диалогом удаления (как в EditActions) ===
  /** ID редактируемого элемента (для режима с диалогом) */
  id?: string
  /** Тип элемента для навигации: logs, items, books, recipes, content (для режима с диалогом) */
  type?: string
  /** Название элемента для диалога удаления (для режима с диалогом) */
  title?: string
  /** Префикс пути (например, "logs" для /logs/finance/id) (для режима с диалогом) */
  pathPrefix?: string
  /** Обработчик сохранения (для режима с диалогом) */
  onSave?: () => Promise<void>
  /** Обработчик удаления (для режима с диалогом) */
  onDelete?: () => Promise<void>

  // === Для режима без диалога (как в FormActions) ===
  /** Показывать ли кнопку удаления (для режима без диалога) */
  showDelete?: boolean
  /** Обработчик удаления (для режима без диалога) */
  onSimpleDelete?: () => void
  /** Состояние загрузки удаления */
  isDeleting?: boolean
  /** Обработчик отмены */
  onCancel: () => void
  /** Обработчик сохранения (для режима без диалога) */
  onSimpleSave?: () => void
  /** Состояние загрузки сохранения */
  isSaving?: boolean
  /** Текст кнопки сохранения */
  saveText?: string
  /** Текст кнопки удаления */
  deleteText?: string

  // === Общие настройки ===
  /** Тип отображения: 'page' для страниц, 'dialog' для диалогов */
  variant?: "page" | "dialog"
  /** Для диалога: использовать кнопку закрытия вместо возврата */
  showBackButton?: boolean
  /** Флаг, что компонент используется внутри формы (type="submit" для кнопки сохранения) */
  isInForm?: boolean
  /** Показывать диалог подтверждения удаления (по умолчанию false) */
  showDeleteDialog?: boolean
}

/**
 * Универсальный переиспользуемый компонент кнопок действий
 *
 * Режимы работы:
 * 1. **С диалогом удаления** (для страниц редактирования):
 *    - id, type, title, onSave, onDelete
 *    - showDeleteDialog={true}
 *
 * 2. **Без диалога** (для форм и диалогов):
 *    - showDelete, onSimpleDelete, onCancel, onSimpleSave
 *    - variant="page" | "dialog"
 *
 * Примеры использования:
 * ```tsx
 * // Для книг (с диалогом)
 * <PageActions
 *   id={bookId}
 *   type="books"
 *   title={book.title}
 *   onSave={handleSave}
 *   onDelete={handleDelete}
 *   onCancel={() => router.back()}
 *   showDeleteDialog={true}
 * />
 *
 * // Для рецептов (без диалога, страница)
 * <PageActions
 *   variant="page"
 *   showDelete={true}
 *   onSimpleDelete={handleDelete}
 *   onCancel={() => router.back()}
 *   onSimpleSave={handleSubmit(onSubmit)}
 *   isSaving={isLoading}
 * />
 *
 * // Для диалога
 * <PageActions
 *   variant="dialog"
 *   showDelete={true}
 *   onCancel={() => setOpen(false)}
 *   onSimpleSave={handleSave}
 * />
 * ```
 */
export function PageActions({
  // Режим с диалогом
  id,
  type,
  title = "эту запись",
  onSave,
  onDelete,
  pathPrefix,
  // Режим без диалога
  showDelete = false,
  onSimpleDelete,
  isDeleting = false,
  onCancel,
  onSimpleSave,
  isSaving = false,
  saveText,
  deleteText,
  // Общие
  variant = "page",
  showBackButton = true,
  isInForm = false,
  showDeleteDialog = false,
}: PageActionsProps) {
  const router = useRouter()
  const t = useTranslations("common")
  const tl = useTranslations("loading")
  const [showDialog, setShowDialog] = useState(false)

  // Обработчики для режима с диалогом
  const handleCancel = () => {
    if (id && type) {
      const prefix = pathPrefix || type
      router.push(`/${prefix}/${type}/${id}`)
    } else {
      onCancel()
    }
  }

  const handleSave = async () => {
    if (onSave) {
      await onSave()
    } else if (onSimpleSave) {
      onSimpleSave()
    }
  }

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete()
      router.push(`/${type}`)
    } else if (onSimpleDelete) {
      onSimpleDelete()
    }
    setShowDialog(false)
  }

  const openDeleteDialog = () => {
    if (showDeleteDialog) {
      setShowDialog(true)
    } else if (onSimpleDelete) {
      onSimpleDelete()
    }
  }

  const saveLabel = saveText || t("save")
  const deleteLabel = deleteText || t("delete")
  const cancelLabel = t("cancel")
  const savingLabel = isSaving ? tl("saving") : saveLabel
  const deletingLabel = isDeleting ? tl("deleting") : deleteLabel

  // Режим страницы (page)
  if (variant === "page") {
    return (
      <>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={openDeleteDialog}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="sm:w-[160px] w-[44px] h-[44px] hover:!bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{cancelLabel}</span>
          </Button>
          {onSimpleSave || onSave ? (
            isInForm ? (
              <Button
                type="submit"
                variant="outline"
                disabled={isSaving}
                className="w-[160px] h-[44px] hover:!bg-primary/10"
              >
                <Save className="h-4 w-4" />
                <span className="ml-2">{savingLabel}</span>
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                className="w-[160px] h-[44px] hover:!bg-primary/10"
              >
                <Save className="h-4 w-4" />
                <span className="ml-2">{savingLabel}</span>
              </Button>
            )
          ) : null}
        </div>

        {/* Диалог подтверждения удаления */}
        {showDeleteDialog && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogDescription>{t("deleteDialog.description", { title })}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  {t("cancel")}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {t("delete")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  // Режим диалога (dialog)
  return (
    <div className="flex justify-start gap-2">
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={openDeleteDialog}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onCancel}
          className="sm:w-[160px] w-[44px] h-[44px] hover:!bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-2">{cancelLabel}</span>
        </Button>
        {onSimpleSave || onSave ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            className="w-[160px] h-[44px] hover:!bg-primary/10"
          >
            <Save className="h-4 w-4" />
            <span className="ml-2">{savingLabel}</span>
          </Button>
        ) : null}
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
    <div className="flex justify-center sm:justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-[160px] h-[44px] hover:!bg-primary/10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="ml-2">{t("cancel")}</span>
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={onConfirm}
        disabled={isLoading}
        className="w-[160px] h-[44px] hover:!bg-primary/10"
      >
        <Trash2 className="h-4 w-4" />
        <span className="ml-2">{isLoading ? tl("deleting") : t("delete")}</span>
      </Button>
    </div>
  )
}
