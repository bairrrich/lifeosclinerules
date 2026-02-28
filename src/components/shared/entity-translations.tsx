"use client"

import { useState, useEffect } from "react"
import { useLocale } from "next-intl"
import { Languages } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { db, getLocalizedEntityName, saveEntityTranslation, getEntityTranslations } from "@/lib/db"

export interface EntityTranslationsProps {
  entityType: "category" | "unit" | "account"
  entityId: string
  defaultName: string
}

export function EntityTranslations({ entityType, entityId, defaultName }: EntityTranslationsProps) {
  const locale = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [translations, setTranslations] = useState<{ en?: string; ru?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTranslations()
    }
  }, [isOpen])

  async function loadTranslations() {
    const trans = await getEntityTranslations(entityType, entityId)
    setTranslations(trans)
  }

  async function handleSave() {
    setIsLoading(true)
    try {
      if (translations.en) {
        await saveEntityTranslation(entityType, entityId, "en", translations.en)
      }
      if (translations.ru) {
        await saveEntityTranslation(entityType, entityId, "ru", translations.ru)
      }
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Переводы: {defaultName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>English</Label>
            <Input
              placeholder={defaultName}
              value={translations.en || ""}
              onChange={(e) => setTranslations({ ...translations, en: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Русский</Label>
            <Input
              placeholder={defaultName}
              value={translations.ru || ""}
              onChange={(e) => setTranslations({ ...translations, ru: e.target.value })}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
