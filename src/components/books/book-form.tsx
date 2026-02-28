"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { TagManager } from "@/components/shared/forms"
import type { Book, BookFormat, Author, Genre } from "@/types"

// Форматы книг (значения)
export const bookFormatValues: BookFormat[] = ["paperback", "hardcover", "ebook", "audiobook"]

// Языки (значения)
export const languageValues = ["ru", "en", "de", "fr", "es", "it", "ja", "zh", "other"] as const
export type BookLanguage = (typeof languageValues)[number]

interface BookFormProps {
  data?: Partial<Book>
  authors: Author[]
  genres: Genre[]
  onChange: (data: Partial<Book>) => void
}

export function BookForm({ data, authors, genres, onChange }: BookFormProps) {
  const t = useTranslations("books")
  const [tags, setTags] = useState<string[]>(data?.tags || [])

  // Преобразуем авторов в опции для combobox
  const authorOptions = authors.map((author) => ({
    id: author.id,
    label: author.name,
  }))

  // Преобразуем жанры в опции для combobox
  const genreOptions = genres.map((genre) => ({
    id: genre.id,
    label: genre.name,
  }))

  const updateField = <K extends keyof Book>(field: K, value: Book[K]) => {
    onChange({ ...data, [field]: value })
  }

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
    onChange({ ...data, tags: newTags })
  }

  // Получаем выбранные ID из существующих данных
  const selectedAuthorIds = data?.authors?.map((a) => a.id) || []
  const selectedGenreIds = data?.genres?.map((g) => g.id) || []

  const handleAuthorsChange = (value: string | string[]) => {
    const ids = Array.isArray(value) ? value : [value]
    // Находим полные объекты авторов по ID и преобразуем в BookAuthorWithDetails
    const selectedAuthors = authors
      .filter((a) => ids.includes(a.id))
      .map((a) => ({
        ...a,
        book_id: data?.id || "",
        author_id: a.id,
        role: "author",
        order: 0,
      })) as any // Приводим к нужному типу
    onChange({ ...data, authors: selectedAuthors })
  }

  const handleGenresChange = (value: string | string[]) => {
    const ids = Array.isArray(value) ? value : [value]
    // Находим полные объекты жанров по ID
    const selectedGenres = genres.filter((g) => ids.includes(g.id))
    onChange({ ...data, genres: selectedGenres })
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
          <Combobox
            label={t("fields.authors")}
            options={authorOptions}
            value={selectedAuthorIds}
            onChange={handleAuthorsChange}
            mode="multiple"
            searchable={true}
            allowCustom={true}
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
              <Combobox
                options={bookFormatValues.map((f) => ({ id: f, label: t(`formats.${f}`) }))}
                value={data?.format || "paperback"}
                onChange={(value) => updateField("format", value as BookFormat)}
                allowCustom={false}
                searchable={false}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">{t("fields.language")}</Label>
              <Combobox
                options={languageValues.map((l) => ({ id: l, label: t(`languages.${l}`) }))}
                value={data?.language || "ru"}
                onChange={(value) => updateField("language", value as string)}
                allowCustom={false}
                searchable={false}
              />
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
          <Combobox
            label={t("fields.authors")}
            options={authorOptions}
            value={selectedAuthorIds}
            onChange={handleAuthorsChange}
            mode="multiple"
            searchable={true}
            allowCustom={true}
          />

          <Combobox
            label={t("fields.genres")}
            options={genreOptions}
            value={selectedGenreIds}
            onChange={handleGenresChange}
            mode="multiple"
            searchable={true}
            allowCustom={true}
          />

          <TagManager
            tags={tags}
            onChange={handleTagsChange}
            label={t("fields.tags")}
            placeholder={t("fields.addTag")}
          />
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
