"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X, Quote, BookOpen } from "@/lib/icons"
import { ArrayManager } from "@/components/shared/forms"
import type { BookQuote } from "@/types"

interface BookQuotesProps {
  quotes: BookQuote[]
  onChange: (quotes: BookQuote[]) => void
}

export function BookQuotes({ quotes, onChange }: BookQuotesProps) {
  const t = useTranslations("books.quotes")
  const tCommon = useTranslations("common")
  const [newQuote, setNewQuote] = useState("")
  const [newPage, setNewPage] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = (): BookQuote => ({
    id: crypto.randomUUID(),
    user_book_id: "",
    text: newQuote.trim(),
    page: newPage ? parseInt(newPage) : undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  const renderQuote = (
    quote: BookQuote,
    index: number,
    onUpdate: (field: keyof BookQuote, value: any) => void
  ) => {
    return (
      <div className="space-y-2">
        <Textarea
          placeholder={t("text")}
          value={quote.text}
          onChange={(e) => onUpdate("text", e.target.value)}
          className="min-h-[60px] resize-none"
        />
        <div className="flex items-center gap-2">
          <BookOpen className="h-3 w-3 text-muted-foreground" />
          <Input
            type="number"
            placeholder={t("page")}
            value={quote.page || ""}
            onChange={(e) => onUpdate("page", parseInt(e.target.value) || undefined)}
            className="w-24 h-8 text-xs"
          />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ArrayManager
          items={quotes}
          onChange={onChange}
          renderItem={renderQuote}
          onAdd={handleAdd}
          emptyMessage={t("noQuotes")}
          addButtonText={t("addQuote")}
          showDragHandle={false}
          allowReorder={true}
        />
      </CardContent>
    </Card>
  )
}
