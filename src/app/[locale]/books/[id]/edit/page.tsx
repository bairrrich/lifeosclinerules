"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { db, initializeDatabase, generateId, getTimestamp } from "@/lib/db"
import { PageActions } from "@/components/shared/page-actions"
import { BookForm, UserBookForm, BookQuotes } from "@/components/books"
import type {
  Book,
  UserBook,
  Author,
  Genre,
  BookAuthor,
  BookQuote,
  BookGenre,
  BookAuthorWithDetails,
} from "@/types"

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const t = useTranslations("books")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Справочники
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [publishers, setPublishers] = useState<string[]>([])

  // Данные
  const [bookData, setBookData] = useState<Partial<Book>>({})
  const [userBookData, setUserBookData] = useState<Partial<UserBook>>({})
  const [quotes, setQuotes] = useState<BookQuote[]>([])
  const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([])
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([])

  // ID пользователя книги
  const [userBookId, setUserBookId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        // Загружаем справочники
        const authorsData = await db.authors.toArray()
        const genresData = await db.genres.toArray()
        const booksData = await db.books.toArray()

        // Собираем уникальных издателей
        const uniquePublishers = [
          ...new Set(booksData.map((b) => b.publisher).filter(Boolean)),
        ] as string[]

        setAuthors(authorsData)
        setGenres(genresData)
        setPublishers(uniquePublishers)

        // Загружаем книгу
        const book = await db.books.get(bookId)
        if (!book) {
          setIsLoading(false)
          return
        }

        // Загружаем пользовательские данные
        const userBook = await db.userBooks.where("book_id").equals(bookId).first()

        // Загружаем авторов
        const bookAuthors = await db.bookAuthors.where("book_id").equals(bookId).toArray()
        const authorIds = bookAuthors.sort((a, b) => a.order - b.order).map((ba) => ba.author_id)

        // Загружаем полные данные авторов
        const authorDetails = await Promise.all(authorIds.map((id) => db.authors.get(id)))
        const authorsWithDetails: BookAuthorWithDetails[] = authorDetails
          .filter((a): a is Author => !!a)
          .map((author, index) => ({
            id: author.id, // Используем ID автора, а не composite ID
            book_id: bookId,
            author_id: author.id,
            role: "author" as const,
            order: index,
            name: author.name,
            name_original: author.name_original,
            birth_year: author.birth_year,
            death_year: author.death_year,
            bio: author.bio,
            photo_url: author.photo_url,
            goodreads_author_id: author.goodreads_author_id,
            created_at: author.created_at,
            updated_at: author.updated_at,
          }))

        // Загружаем цитаты
        let quotesList: BookQuote[] = []
        if (userBook) {
          quotesList = await db.bookQuotes.where("user_book_id").equals(userBook.id).toArray()
          setUserBookId(userBook.id)
        }

        // Загружаем жанры
        const bookGenres = await db.bookGenres.where("book_id").equals(bookId).toArray()
        const genreIds = bookGenres.map((bg) => bg.genre_id)

        // Загружаем полные данные жанров
        const genreDetails = await Promise.all(genreIds.map((id) => db.genres.get(id)))
        const genresWithDetails = genreDetails.filter((g): g is Genre => !!g)

        // Устанавливаем данные
        setBookData({ ...book, authors: authorsWithDetails, genres: genresWithDetails })
        setUserBookData(userBook || { status: "planned" })
        setQuotes(quotesList)
        setSelectedAuthorIds(authorIds)
        setSelectedGenreIds(genreIds)
      } catch (error) {
        console.error("Failed to load book:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [bookId])

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
      toast.error(t("edit.validation.titleRequired"))
      return
    }

    setIsSaving(true)
    try {
      const now = getTimestamp()

      // 1. Обновляем книгу
      await db.books.update(bookId, {
        title: bookData.title,
        subtitle: bookData.subtitle,
        description: bookData.description,
        isbn10: bookData.isbn10,
        isbn13: bookData.isbn13,
        published_year: bookData.published_year,
        original_publication_year: bookData.original_publication_year,
        publisher: bookData.publisher,
        language: bookData.language,
        page_count: bookData.page_count,
        format: bookData.format,
        cover_image_url: bookData.cover_image_url,
        updated_at: now,
      })

      // 2. Обновляем авторов
      await db.bookAuthors.where("book_id").equals(bookId).delete()
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

      // 3. Обновляем жанры
      await db.bookGenres.where("book_id").equals(bookId).delete()
      for (const genreId of selectedGenreIds) {
        const bookGenre: BookGenre = {
          id: generateId(),
          book_id: bookId,
          genre_id: genreId,
          created_at: now,
          updated_at: now,
        }
        await db.bookGenres.add(bookGenre)
      }

      // 4. Обновляем пользовательские данные
      if (userBookId) {
        await db.userBooks.update(userBookId, {
          status: userBookData.status,
          rating: userBookData.rating,
          progress_pages: userBookData.progress_pages,
          progress_percent: userBookData.progress_percent,
          started_at: userBookData.started_at,
          finished_at: userBookData.finished_at,
          personal_notes: userBookData.personal_notes,
          tags: userBookData.tags,
          is_owned: userBookData.is_owned,
          owned_format: userBookData.owned_format,
          location: userBookData.location,
          reread_count: userBookData.reread_count,
          updated_at: now,
        })

        // Обновляем цитаты
        await db.bookQuotes.where("user_book_id").equals(userBookId).delete()
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
      } else {
        // Создаём пользовательские данные если их нет
        const newUserBookId = generateId()
        const userBook: UserBook = {
          id: newUserBookId,
          book_id: bookId,
          status: userBookData.status || "planned",
          rating: userBookData.rating,
          progress_pages: userBookData.progress_pages,
          progress_percent: userBookData.progress_percent,
          started_at: userBookData.started_at,
          finished_at: userBookData.finished_at,
          personal_notes: userBookData.personal_notes,
          tags: userBookData.tags,
          is_owned: userBookData.is_owned,
          owned_format: userBookData.owned_format,
          location: userBookData.location,
          reread_count: userBookData.reread_count,
          created_at: now,
          updated_at: now,
        }
        await db.userBooks.add(userBook)

        // Сохраняем цитаты
        for (const quote of quotes) {
          const savedQuote: BookQuote = {
            ...quote,
            id: generateId(),
            user_book_id: newUserBookId,
            created_at: now,
            updated_at: now,
          }
          await db.bookQuotes.add(savedQuote)
        }
      }

      router.push(`/books/${bookId}`)
    } catch (error) {
      console.error("Failed to update book:", error)
      toast.error(t("edit.error.failedToUpdate"))
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm(t("edit.delete.confirm"))) return

    setIsDeleting(true)
    try {
      // Удаляем все связанные данные
      await db.bookAuthors.where("book_id").equals(bookId).delete()
      await db.bookGenres.where("book_id").equals(bookId).delete()

      if (userBookId) {
        await db.bookQuotes.where("user_book_id").equals(userBookId).delete()
        await db.userBooks.delete(userBookId)
      }

      await db.books.delete(bookId)

      router.push("/books")
    } catch (error) {
      console.error("Failed to delete book:", error)
      toast.error(t("edit.error.failedToDelete"))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title={t("edit.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("edit.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={t("edit.title")}>
      <div className="container mx-auto px-4 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          {/* Метаданные книги */}
          <BookForm
            data={bookData}
            authors={authors}
            genres={genres}
            publishers={publishers}
            onChange={setBookData}
            onAuthorsChange={handleAuthorsChange}
            onGenresChange={handleGenresChange}
          />

          {/* Пользовательские данные */}
          <UserBookForm
            data={userBookData}
            pageCount={bookData.page_count}
            onChange={setUserBookData}
          />

          {/* Цитаты */}
          <BookQuotes quotes={quotes} onChange={setQuotes} />

          {/* Действия */}
          <PageActions
            variant="page"
            showDelete={true}
            onSimpleDelete={onDelete}
            isDeleting={isDeleting}
            onCancel={() => router.back()}
            onSimpleSave={onSubmit}
            isSaving={isSaving}
          />
        </form>
      </div>
    </AppLayout>
  )
}
