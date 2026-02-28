"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/lib/navigation"
import { useTranslations } from "next-intl"
import { ArrowLeft, Save } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { db, initializeDatabase, generateId, getTimestamp } from "@/lib/db"
import { BookForm, UserBookForm, BookQuotes } from "@/components/books"
import type {
  Book,
  UserBook,
  Author,
  Genre,
  BookAuthor,
  BookQuote,
  BookFormat,
  ReadingStatus,
} from "@/types"

export default function NewBookPage() {
  const router = useRouter()
  const t = useTranslations("books")
  const [isLoading, setIsLoading] = useState(false)

  // Справочники
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<Genre[]>([])

  // Данные книги
  const [bookData, setBookData] = useState<Partial<Book>>({
    language: "ru",
    format: "paperback" as BookFormat,
  })

  // Пользовательские данные
  const [userBookData, setUserBookData] = useState<Partial<UserBook>>({
    status: "planned" as ReadingStatus,
  })

  // Цитаты
  const [quotes, setQuotes] = useState<BookQuote[]>([])

  // Выбранные авторы (IDs)
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([])
  // Выбранные жанры (IDs)
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([])

  useEffect(() => {
    async function loadData() {
      await initializeDatabase()
      const authorsData = await db.authors.toArray()
      const genresData = await db.genres.toArray()
      setAuthors(authorsData)
      setGenres(genresData)
    }
    loadData()
  }, [])

  // Обработчик изменения авторов
  const handleAuthorsChange = async (selectedIds: string[], newAuthors?: string[]) => {
    setSelectedAuthorIds(selectedIds)

    // Если есть новые авторы, добавляем их в базу
    if (newAuthors && newAuthors.length > 0) {
      const now = getTimestamp()
      const newAuthorIds: string[] = []

      for (const authorName of newAuthors) {
        const authorId = generateId()
        const newAuthor: Author = {
          id: authorId,
          name: authorName,
          created_at: now,
          updated_at: now,
        }
        await db.authors.add(newAuthor)
        newAuthorIds.push(authorId)
      }

      // Обновляем список авторов и выбранные ID
      const updatedAuthors = await db.authors.toArray()
      setAuthors(updatedAuthors)
      setSelectedAuthorIds([...selectedIds, ...newAuthorIds])
    }
  }

  // Обработчик изменения жанров
  const handleGenresChange = async (selectedIds: string[], newGenres?: string[]) => {
    setSelectedGenreIds(selectedIds)

    // Если есть новые жанры, добавляем их в базу
    if (newGenres && newGenres.length > 0) {
      const now = getTimestamp()
      const newGenreIds: string[] = []

      for (const genreName of newGenres) {
        const genreId = generateId()
        const newGenre: Genre = {
          id: genreId,
          name: genreName,
          created_at: now,
          updated_at: now,
        }
        await db.genres.add(newGenre)
        newGenreIds.push(genreId)
      }

      // Обновляем список жанров и выбранные ID
      const updatedGenres = await db.genres.toArray()
      setGenres(updatedGenres)
      setSelectedGenreIds([...selectedIds, ...newGenreIds])
    }
  }

  const onSubmit = async () => {
    if (!bookData.title?.trim()) {
      alert(t("new.validation.titleRequired"))
      return
    }

    setIsLoading(true)
    try {
      const now = getTimestamp()

      // 1. Создаём книгу
      const bookId = generateId()
      const book: Book = {
        id: bookId,
        title: bookData.title,
        subtitle: bookData.subtitle,
        description: bookData.description,
        isbn10: bookData.isbn10,
        isbn13: bookData.isbn13,
        published_year: bookData.published_year,
        original_publication_year: bookData.original_publication_year,
        publisher: bookData.publisher,
        language: bookData.language || "ru",
        page_count: bookData.page_count,
        format: bookData.format || "paperback",
        cover_image_url: bookData.cover_image_url,
        tags: bookData.tags,
        created_at: now,
        updated_at: now,
      }

      await db.books.add(book)

      // 2. Создаём связи с авторами
      for (let i = 0; i < selectedAuthorIds.length; i++) {
        const bookAuthor: BookAuthor = {
          id: generateId(),
          book_id: bookId,
          author_id: selectedAuthorIds[i],
          role: "author",
          order: i,
          created_at: now,
          updated_at: now,
        }
        await db.bookAuthors.add(bookAuthor)
      }

      // 3. Создаём пользовательские данные
      const userBookId = generateId()
      const userBook: UserBook = {
        id: userBookId,
        book_id: bookId,
        status: userBookData.status || "planned",
        rating: userBookData.rating,
        progress_pages: userBookData.progress_pages,
        progress_percent: userBookData.progress_percent,
        started_at: userBookData.started_at,
        finished_at: userBookData.finished_at,
        personal_notes: userBookData.personal_notes,
        is_owned: userBookData.is_owned,
        owned_format: userBookData.owned_format,
        location: userBookData.location,
        reread_count: userBookData.reread_count,
        created_at: now,
        updated_at: now,
      }

      await db.userBooks.add(userBook)

      // 4. Сохраняем цитаты
      for (const quote of quotes) {
        const savedQuote: BookQuote = {
          ...quote,
          id: generateId(),
          user_book_id: userBookId,
          created_at: now,
          updated_at: now,
        }
        await db.bookQuotes.add(savedQuote)
      }

      router.push("/books")
    } catch (error) {
      console.error("Failed to create book:", error)
      alert(t("new.error.failedToCreate"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout title={t("new.title")}>
      <div className="container mx-auto px-4 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          {/* Метаданные книги */}
          <BookForm data={bookData} authors={authors} genres={genres} onChange={setBookData} />

          {/* Пользовательские данные */}
          <UserBookForm
            data={userBookData}
            pageCount={bookData.page_count}
            onChange={setUserBookData}
          />

          {/* Цитаты */}
          <BookQuotes quotes={quotes} onChange={setQuotes} />

          {/* Действия */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("new.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? t("new.actions.saving") : t("new.actions.save")}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
