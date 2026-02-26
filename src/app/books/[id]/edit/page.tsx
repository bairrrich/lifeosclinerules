"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { db, initializeDatabase, generateId, getTimestamp } from "@/lib/db"
import { FormActions } from "@/components/shared/form-actions"
import { 
  BookForm, 
  UserBookForm, 
  BookQuotes 
} from "@/components/books"
import type { 
  Book, UserBook, Author, Genre, BookAuthor, BookQuote, BookGenre 
} from "@/types"

interface BookEditData extends Book {
  userBook?: UserBook
  authorsList?: Author[]
  quotesList?: BookQuote[]
  genresList?: Genre[]
}

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Справочники
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  
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
        setAuthors(authorsData)
        setGenres(genresData)
        
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
        
        // Загружаем цитаты
        let quotesList: BookQuote[] = []
        if (userBook) {
          quotesList = await db.bookQuotes.where("user_book_id").equals(userBook.id).toArray()
          setUserBookId(userBook.id)
        }
        
        // Загружаем жанры
        const bookGenres = await db.bookGenres.where("book_id").equals(bookId).toArray()
        const genreIds = bookGenres.map((bg) => bg.genre_id)
        
        // Устанавливаем данные
        setBookData(book)
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

  const onSubmit = async () => {
    if (!bookData.title?.trim()) {
      alert("Введите название книги")
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
        tags: bookData.tags,
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
      alert("Ошибка при сохранении книги")
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту книгу? Это действие нельзя отменить.")) return
    
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
      alert("Ошибка при удалении книги")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="container mx-auto px-4 py-6">
          <Card><CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent></Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Редактировать книгу">
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          {/* Метаданные книги */}
          <BookForm
            data={bookData}
            authors={authors}
            genres={genres}
            onChange={setBookData}
          />
          
          {/* Пользовательские данные */}
          <UserBookForm
            data={userBookData}
            pageCount={bookData.page_count}
            onChange={setUserBookData}
          />
          
          {/* Цитаты */}
          <BookQuotes
            quotes={quotes}
            onChange={setQuotes}
          />
          
          {/* Действия */}
          <FormActions
            type="page"
            showDelete
            onDelete={onDelete}
            isDeleting={isDeleting}
            onCancel={() => router.back()}
            onSave={onSubmit}
            isSaving={isSaving}
          />
        </form>
      </div>
    </AppLayout>
  )
}