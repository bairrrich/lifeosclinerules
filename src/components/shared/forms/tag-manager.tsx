"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Plus, X } from "@/lib/icons"
import { FormField } from "./form-field"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface TagManagerProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  addPlaceholder?: string
  label?: string
}

/**
 * Универсальный компонент управления тегами
 * Используется для добавления/удаления тегов в книгах, рецептах и других сущностях
 */
export function TagManager({
  tags,
  onChange,
  placeholder,
  addPlaceholder,
  label,
}: TagManagerProps) {
  const t = useTranslations("common")
  const [newTag, setNewTag] = useState("")

  const addTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <FormField label={label || t("tags")}>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder || addPlaceholder || t("tags.addPlaceholder")}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addTag}
          disabled={!newTag.trim()}
          aria-label={t("add")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </FormField>
  )
}
