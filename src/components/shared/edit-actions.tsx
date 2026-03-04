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

interface EditActionsProps {
  /** ID редактируемого элемента */
  id: string
  /** Тип элемента для навигации (logs, items, books, recipes, content) */
  type: string
  /** Название элемента для диалога удаления */
  title?: string
  /** Состояние загрузки сохранения */
  isSaving?: boolean
  /** Обработчик сохранения (должен вернуть Promise) */
  onSave: () => Promise<void>
  /** Обработчик удаления (должен вернуть Promise) */
  onDelete: () => Promise<void>
  /** Текст кнопки сохранения */
  saveText?: string
  /** Флаг, что компонент используется внутри формы */
  isInForm?: boolean
  /** Префикс пути (например, "logs" для /logs/finance/id) */
  pathPrefix?: string
}

/**
 * Переиспользуемый компонент кнопок действий для страниц редактирования
 *
 * Использование:
 * - Для финансовых операций: type="logs", id={id}, title={log.title}
 * - Для элементов каталога: type="items", id={id}, title={item.name}
 * - Для книг: type="books", id={id}, title={book.title}
 * - Для рецептов: type="recipes", id={id}, title={recipe.title}
 */
export function EditActions({
  id,
  type,
  title = "эту запись",
  isSaving = false,
  onSave,
  onDelete,
  saveText,
  isInForm = false,
  pathPrefix,
}: EditActionsProps) {
  const router = useRouter()
  const t = useTranslations("common")
  const tl = useTranslations("loading")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleCancel = () => {
    const prefix = pathPrefix || type
    router.push(`/${prefix}/${type}/${id}`)
  }

  const handleSave = async () => {
    await onSave()
  }

  const handleDelete = async () => {
    await onDelete()
    router.push(`/${type}`)
  }

  return (
    <>
      {/* Кнопки действий */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className="w-[160px] hover:!bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("cancel")}
        </Button>
        {isInForm ? (
          <Button
            type="submit"
            variant="outline"
            disabled={isSaving}
            className="w-[160px] hover:!bg-primary/10"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? tl("saving") : saveText || t("save")}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="w-[160px] hover:!bg-primary/10"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? tl("saving") : saveText || t("save")}
          </Button>
        )}
      </div>

      {/* Диалог подтверждения удаления */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("deleteDialog.description", { title: title || "эту запись" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
