"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { MultiCombobox, type ComboboxOption } from "@/components/ui/multi-combobox"
import type { Book, BookFormat, Author, Genre } from "@/types"

// Форматы книг
export const bookFormats: { value: BookFormat; label: string }[] = [
  { value: "paperback", label: "Мягкая обложка" },
  { value: "hardcover", label: "Твёрдая обложка" },
  { value: "ebook", label: "Электронная книга" },
  { value: "audiobook", label: "Аудиокнига" },
]

// Языки
export const languages = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "Английский" },
  { value: "de", label: "Немецкий" },
  { value: "fr", label: "Французский" },
  { value: "es", label: "Испанский" },
  { value: "it", label: "Итальянский" },
  { value: "ja", label: "Японский" },
  { value: "zh", label: "Китайский" },
  { value: "other", label: "Другой" },
]

interface BookFormProps {
  data?: Partial<Book>
  authors: Author[]
  genres: Genre[]
  selectedAuthorIds: string[]
  selectedGenreIds: string[]
  onAuthorsChange: (selectedIds: string[], newAuthors?: string[]) => void
  onGenresChange: (selectedIds: string[], newGenres?: string[]) => void
  onChange: (data: Partial<Book>) => void
}

export function BookForm({
  data,
  authors,
  genres,
  selectedAuthorIds,
  selectedGenreIds,
  onAuthorsChange,
  onGenresChange,
  onChange,
}: BookFormProps) {
  const t = useTranslations("books")
  const [newTagName, setNewTagName] = useState("")
  const [tags, setTags] = useState<string[]>(data?.tags || [])

  // Преобразуем авторов в опции для combobox
  const authorOptions: ComboboxOption[] = authors.map((author) => ({
    id: author.id,
    label: author.name,
  }))

  // Преобразуем жанры в опции для combobox
  const genreOptions: ComboboxOption[] = genres.map((genre) => ({
    id: genre.id,
    label: genre.name,
  }))

  const updateField = <K extends keyof Book>(field: K, value: Book[K]) => {
    onChange({ ...data, [field]: value })
  }

  const addTag = () => {
    if (newTagName.trim() && !tags.includes(newTagName.trim())) {
      const newTags = [...tags, newTagName.trim()]
      setTags(newTags)
      onChange({ ...data, tags: newTags })
      setNewTagName("")
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter((t) => t !== tag)
    setTags(newTags)
    onChange({ ...data, tags: newTags })
  }

  return (
    <>
      {/* Основное */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.main")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("fields.title")} *</Label>
            <Input
              id="title"
              placeholder={t("fields.title")}
              value={data?.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">{t("fields.subtitle")}</Label>
            <Input
              id="subtitle"
              placeholder={t("fields.subtitle")}
              value={data?.subtitle || ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("fields.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("fields.annotation")}
              value={data?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Автор и издание */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.authorAndEdition")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiCombobox
            label={t("fields.authors")}
            options={authorOptions}
            selectedIds={selectedAuthorIds}
            onChange={onAuthorsChange}
            placeholder={t("fields.authors")}
            addPlaceholder={t("fields.newAuthor")}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="published_year">{t("fields.publishedYear")}</Label>
              <Input
                id="published_year"
                type="number"
                placeholder="2024"
                value={data?.published_year || ""}
                onChange={(e) =>
                  updateField(
                    "published_year",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_publication_year">{t("fields.originalYear")}</Label>
              <Input
                id="original_publication_year"
                type="number"
                placeholder="1953"
                value={data?.original_publication_year || ""}
                onChange={(e) =>
                  updateField(
                    "original_publication_year",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">{t("fields.publisher")}</Label>
            <Input
              id="publisher"
              placeholder={t("fields.publisher")}
              value={data?.publisher || ""}
              onChange={(e) => updateField("publisher", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Характеристики */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.characteristics")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">{t("fields.format")}</Label>
              <NativeSelect
                id="format"
                value={data?.format || "paperback"}
                onChange={(e) => updateField("format", e.target.value as BookFormat)}
              >
                {bookFormats.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("fields.language")}</Label>
              <NativeSelect
                id="language"
                value={data?.language || "ru"}
                onChange={(e) => updateField("language", e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_count">{t("fields.pageCount")}</Label>
            <Input
              id="page_count"
              type="number"
              placeholder="320"
              value={data?.page_count || ""}
              onChange={(e) =>
                updateField("page_count", e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ISBN и внешние ID */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.isbnAndExternalIds")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn10">{t("fields.isbn10")}</Label>
              <Input
                id="isbn10"
                placeholder="5171134567"
                value={data?.isbn10 || ""}
                onChange={(e) => updateField("isbn10", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn13">{t("fields.isbn13")}</Label>
              <Input
                id="isbn13"
                placeholder="9785171134567"
                value={data?.isbn13 || ""}
                onChange={(e) => updateField("isbn13", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goodreads_id">{t("fields.goodreadsId")}</Label>
              <Input
                id="goodreads_id"
                placeholder="456789"
                value={data?.goodreads_id || ""}
                onChange={(e) => updateField("goodreads_id", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_books_id">{t("fields.googleBooksId")}</Label>
              <Input
                id="google_books_id"
                placeholder="ABC123"
                value={data?.google_books_id || ""}
                onChange={(e) => updateField("google_books_id", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Жанры и теги */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.genresAndTags")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiCombobox
            label={t("fields.genres")}
            options={genreOptions}
            selectedIds={selectedGenreIds}
            onChange={onGenresChange}
            placeholder={t("fields.genres")}
            addPlaceholder={t("fields.newGenre")}
          />

          <div className="space-y-2">
            <Label>{t("fields.tags")}</Label>
            <div className="flex gap-2">
              <Input
                placeholder={t("fields.addTag")}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addTag}
                aria-label={t("fields.addTag")}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Обложка */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.cover")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">{t("fields.coverUrl")}</Label>
            <Input
              id="cover_image_url"
              placeholder="https://example.com/cover.jpg"
              value={data?.cover_image_url || ""}
              onChange={(e) => updateField("cover_image_url", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
