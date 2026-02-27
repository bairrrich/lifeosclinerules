"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Quote, BookOpen } from "@/lib/icons"
import type { BookQuote } from "@/types"

interface BookQuotesProps {
  quotes: BookQuote[]
  onChange: (quotes: BookQuote[]) => void
}

export function BookQuotes({ quotes, onChange }: BookQuotesProps) {
  const [newQuote, setNewQuote] = useState("")
  const [newPage, setNewPage] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const addQuote = () => {
    if (!newQuote.trim()) return

    const quote: BookQuote = {
      id: crypto.randomUUID(),
      user_book_id: "", // Будет заполнен при сохранении
      text: newQuote.trim(),
      page: newPage ? parseInt(newPage) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    onChange([...quotes, quote])
    setNewQuote("")
    setNewPage("")
    setIsAdding(false)
  }

  const removeQuote = (id: string) => {
    onChange(quotes.filter((q) => q.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Quote className="h-5 w-5" />
          Цитаты
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Список цитат */}
        {quotes.length > 0 && (
          <div className="space-y-3">
            {quotes.map((quote, index) => (
              <div
                key={quote.id || index}
                className="relative p-3 bg-muted/50 rounded-lg border-l-4 border-primary/50"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeQuote(quote.id || "")}
                  aria-label="Удалить цитату"
                >
                  <X className="h-4 w-4" />
                </Button>
                <p className="text-sm italic pr-8">{quote.text}</p>
                {quote.page && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>стр. {quote.page}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Добавление новой цитаты */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="quote_text">Текст цитаты</Label>
              <Textarea
                id="quote_text"
                placeholder="Введите цитату..."
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                className="min-h-[80px]"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote_page">Страница (опц.)</Label>
              <Input
                id="quote_page"
                type="number"
                placeholder="123"
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                className="w-24"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false)
                  setNewQuote("")
                  setNewPage("")
                }}
              >
                Отмена
              </Button>
              <Button type="button" size="sm" onClick={addQuote} disabled={!newQuote.trim()}>
                Добавить
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить цитату
          </Button>
        )}

        {quotes.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">Нет добавленных цитат</p>
        )}
      </CardContent>
    </Card>
  )
}
