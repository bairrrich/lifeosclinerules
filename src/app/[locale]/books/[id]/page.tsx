"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, useParams } from "@/lib/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Star,
  User,
  Calendar,
  FileText,
  BookOpen,
  Quote,
  MapPin,
  Clock,
  Tag,
} from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DeleteConfirmActions } from "@/components/shared/page-actions"
import { db, initializeDatabase } from "@/lib/db"
import { statusColors } from "@/components/books"
import { bookColors } from "@/lib/theme-colors"
import type { Book, UserBook, Author, BookQuote, Genre } from "@/types"

interface BookDetails extends Book {
  userBook?: UserBook
  authorsList?: Author[]
  quotesList?: BookQuote[]
  genresList?: Genre[]
}

export default function BookDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookId = params.id as string
  const t = useTranslations("books")
  const locale = useLocale()

  const [book, setBook] = useState<BookDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        // Загружаем книгу
        const bookData = await db.books.get(bookId)
        if (!bookData) {
          setIsLoading(false)
          return
        }

        // Загружаем пользовательские данные
        const userBook = await db.userBooks.where("book_id").equals(bookId).first()

        // Загружаем авторов
        const bookAuthors = await db.bookAuthors.where("book_id").equals(bookId).toArray()
        const authors = await db.authors.toArray()
        const authorsList = bookAuthors
          .sort((a, b) => a.order - b.order)
          .map((ba) => authors.find((a) => a.id === ba.author_id))
          .filter(Boolean) as Author[]

        // Загружаем цитаты
        let quotesList: BookQuote[] = []
        if (userBook) {
          quotesList = await db.bookQuotes.where("user_book_id").equals(userBook.id).toArray()
        }

        // Загружаем жанры
        const bookGenres = await db.bookGenres.where("book_id").equals(bookId).toArray()
        const genres = await db.genres.toArray()
        const genresList = bookGenres
          .map((bg) => genres.find((g) => g.id === bg.genre_id))
          .filter(Boolean) as Genre[]

        setBook({
          ...bookData,
          userBook,
          authorsList,
          quotesList,
          genresList,
        })
      } catch (error) {
        console.error("Failed to load book:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [bookId])

  const handleDelete = async () => {
    if (!book) return

    try {
      // Удаляем пользовательские данные
      if (book.userBook) {
        await db.userBooks.delete(book.userBook.id)
        await db.bookQuotes.where("user_book_id").equals(book.userBook.id).delete()
      }

      // Удаляем связи с авторами
      await db.bookAuthors.where("book_id").equals(bookId).delete()

      // Удаляем связи с жанрами
      await db.bookGenres.where("book_id").equals(bookId).delete()

      // Удаляем книгу
      await db.books.delete(bookId)

      router.push("/books")
    } catch (error) {
      console.error("Failed to delete book:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  // Вычисляем прогресс
  const progressPercent =
    book?.userBook?.progress_percent ??
    (book?.userBook?.progress_pages && book?.page_count
      ? Math.round((book.userBook.progress_pages / book.page_count) * 100)
      : 0)

  if (isLoading) {
    return (
      <AppLayout title={t("common.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("common.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!book) {
    return (
      <AppLayout title={t("notFound")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("notFound")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={book.title}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("common.back")}
        </Button>

        {/* Заголовок */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Обложка */}
              <div className="flex h-32 w-24 shrink-0 items-center justify-center rounded bg-muted overflow-hidden">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt={book.title}
                    width={96}
                    height={144}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              {/* Информация */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold">{book.title}</h1>
                {book.subtitle && <p className="text-sm text-muted-foreground">{book.subtitle}</p>}

                {book.authorsList && book.authorsList.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{book.authorsList.map((a) => a.name).join(", ")}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  {book.userBook?.status && (
                    <Badge className={statusColors[book.userBook.status]}>
                      {t(`status.${book.userBook.status}`)}
                    </Badge>
                  )}
                  {book.userBook?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${bookColors.ratingFill} ${bookColors.rating}`} />
                      <span className="text-sm">{book.userBook.rating}</span>
                    </div>
                  )}
                </div>

                {/* Прогресс бар */}
                {book.userBook?.status === "reading" && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{t("userBook.progress")}</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-[width]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {book.userBook.progress_pages && book.page_count && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.userBook.progress_pages} {t("userBook.pages")} {book.page_count}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">{t("details")}</TabsTrigger>
            <TabsTrigger value="notes">{t("userBook.notes")}</TabsTrigger>
            <TabsTrigger value="quotes">{t("quotes.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            {/* Метаданные */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("aboutBook")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {book.published_year && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{book.published_year}</span>
                    </div>
                  )}
                  {book.page_count && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {book.page_count} {t("fields.pages")}
                      </span>
                    </div>
                  )}
                </div>

                {book.publisher && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("fields.publisher")}: </span>
                    <span>{book.publisher}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("fields.format")}: </span>
                    <span>{t(`formats.${book.format}`) || book.format}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("fields.language")}: </span>
                    <span>{t(`languages.${book.language}`) || book.language}</span>
                  </div>
                </div>

                {book.isbn13 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">ISBN-13: </span>
                    <span className="font-mono">{book.isbn13}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Жанры и теги */}
            {(book.genresList?.length || book.tags?.length) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("categories")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {book.genresList?.map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                    {book.tags?.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Описание */}
            {book.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("fields.description")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{book.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Владение */}
            {book.userBook?.is_owned && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t("inCollection")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t("fields.format")}: </span>
                    <span>{t(`formats.${book.userBook.owned_format || "paperback"}`)}</span>
                  </div>
                  {book.userBook.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{book.userBook.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Даты */}
            <Card>
              <CardContent className="p-4 space-y-2 text-sm">
                {book.userBook?.started_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("userBook.startedAt")}: {formatDate(book.userBook.started_at)}
                    </span>
                  </div>
                )}
                {book.userBook?.finished_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("userBook.finishedAt")}: {formatDate(book.userBook.finished_at)}
                    </span>
                  </div>
                )}
                <div className="text-muted-foreground">
                  {t("createdAt")}: {formatDate(book.created_at)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("userBook.notes")}</CardTitle>
              </CardHeader>
              <CardContent>
                {book.userBook?.personal_notes ? (
                  <p className="text-sm whitespace-pre-wrap">{book.userBook.personal_notes}</p>
                ) : (
                  <p className="text-muted-foreground">{t("noNotes")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes" className="mt-4">
            {book.quotesList && book.quotesList.length > 0 ? (
              <div className="space-y-3">
                {book.quotesList.map((quote) => (
                  <Card key={quote.id}>
                    <CardContent className="p-4">
                      <div className="border-l-4 border-primary/50 pl-3">
                        <Quote className="h-4 w-4 text-muted-foreground mb-2" />
                        <p className="text-sm italic">{quote.text}</p>
                        {quote.page && (
                          <p className="text-xs text-muted-foreground mt-2">
                            — {t("quotes.page")} {quote.page}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                  {t("quotes.noQuotes")}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Действия */}
        <div className="flex gap-2">
          <Button variant="destructive" size="icon" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Link href="/books" className="sm:w-[160px] w-[44px]">
            <Button variant="outline" className="w-full hover:!bg-primary/10">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">{t("common.back")}</span>
            </Button>
          </Link>
          <Link href={`/books/${bookId}/edit`} className="w-[160px]">
            <Button variant="outline" size="icon" className="w-[160px] h-10 hover:!bg-primary/10">
              <Pencil className="h-4 w-4" />
              <span className="ml-2">{t("common.edit")}</span>
            </Button>
          </Link>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("deleteDialog.description", { title: book.title })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DeleteConfirmActions
                onCancel={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
