"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  onChange: (data: Partial<Book>) => void
}

export function BookForm({ data, authors, genres, onChange }: BookFormProps) {
  const [newAuthorName, setNewAuthorName] = useState("")
  const [newGenreName, setNewGenreName] = useState("")
  
  // Локальное состояние для авторов и жанров (для UI)
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    data?.authors?.map(a => a.author_id || "") || []
  )
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    data?.genres?.map(g => g.id) || []
  )
  const [tags, setTags] = useState<string[]>(data?.tags || [])

  const updateField = <K extends keyof Book>(field: K, value: Book[K]) => {
    onChange({ ...data, [field]: value })
  }

  const addTag = () => {
    if (newGenreName.trim() && !tags.includes(newGenreName.trim())) {
      const newTags = [...tags, newGenreName.trim()]
      setTags(newTags)
      onChange({ ...data, tags: newTags })
      setNewGenreName("")
    }
  }

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag)
    setTags(newTags)
    onChange({ ...data, tags: newTags })
  }

  return (
    <>
      {/* Основное */}
      <Card>
        <CardHeader>
          <CardTitle>Основное</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input
              id="title"
              placeholder="Название книги"
              value={data?.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Подзаголовок</Label>
            <Input
              id="subtitle"
              placeholder="Подзаголовок книги"
              value={data?.subtitle || ""}
              onChange={(e) => updateField("subtitle", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              placeholder="Аннотация или краткое описание..."
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
          <CardTitle>Автор и издание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Автор(ы)</Label>
            <div className="flex gap-2">
              <NativeSelect
                value=""
                onChange={(e) => {
                  const authorId = e.target.value
                  if (authorId && !selectedAuthors.includes(authorId)) {
                    setSelectedAuthors([...selectedAuthors, authorId])
                  }
                }}
              >
                <option value="">Выберите автора...</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </NativeSelect>
            </div>
            {selectedAuthors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedAuthors.map((authorId) => {
                  const author = authors.find((a) => a.id === authorId)
                  return author ? (
                    <Badge key={authorId} variant="secondary" className="gap-1">
                      {author.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setSelectedAuthors(
                            selectedAuthors.filter((id) => id !== authorId)
                          )
                        }
                      />
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="published_year">Год издания</Label>
              <Input
                id="published_year"
                type="number"
                placeholder="2024"
                value={data?.published_year || ""}
                onChange={(e) =>
                  updateField("published_year", e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="original_publication_year">Год оригинала</Label>
              <Input
                id="original_publication_year"
                type="number"
                placeholder="1953"
                value={data?.original_publication_year || ""}
                onChange={(e) =>
                  updateField("original_publication_year", e.target.value ? parseInt(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publisher">Издательство</Label>
            <Input
              id="publisher"
              placeholder="Издательство"
              value={data?.publisher || ""}
              onChange={(e) => updateField("publisher", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Характеристики */}
      <Card>
        <CardHeader>
          <CardTitle>Характеристики</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Формат</Label>
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
              <Label htmlFor="language">Язык</Label>
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
            <Label htmlFor="page_count">Количество страниц</Label>
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
          <CardTitle>ISBN и внешние ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn10">ISBN-10</Label>
              <Input
                id="isbn10"
                placeholder="5171134567"
                value={data?.isbn10 || ""}
                onChange={(e) => updateField("isbn10", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isbn13">ISBN-13</Label>
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
              <Label htmlFor="goodreads_id">Goodreads ID</Label>
              <Input
                id="goodreads_id"
                placeholder="456789"
                value={data?.goodreads_id || ""}
                onChange={(e) => updateField("goodreads_id", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_books_id">Google Books ID</Label>
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
          <CardTitle>Жанры и теги</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Жанры</Label>
            <NativeSelect
              value=""
              onChange={(e) => {
                const genreId = e.target.value
                if (genreId && !selectedGenres.includes(genreId)) {
                  setSelectedGenres([...selectedGenres, genreId])
                }
              }}
            >
              <option value="">Выберите жанр...</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </NativeSelect>
            {selectedGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedGenres.map((genreId) => {
                  const genre = genres.find((g) => g.id === genreId)
                  return genre ? (
                    <Badge key={genreId} variant="secondary" className="gap-1">
                      {genre.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setSelectedGenres(
                            selectedGenres.filter((id) => id !== genreId)
                          )
                        }
                      />
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Теги</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Новый тег..."
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
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
          <CardTitle>Обложка</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover_image_url">URL обложки</Label>
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