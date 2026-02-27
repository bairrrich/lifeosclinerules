"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { BookOpen, Plus, Search, Star, Calendar, FileText, TrendingUp } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db, initializeDatabase } from "@/lib/db"
import { statusColors, statusLabels } from "@/components/books"
import type { Book, UserBook, Author, BookAuthor, ReadingStatus } from "@/types"

// Фильтры статуса
const statusFilters: { value: ReadingStatus | "all"; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "reading", label: "Читаю" },
  { value: "planned", label: "Запланировано" },
  { value: "completed", label: "Прочитано" },
  { value: "paused", label: "Пауза" },
]

interface BookWithDetails extends Book {
  userBook?: UserBook
  authorsList?: Author[]
}

export default function BooksPage() {
  const t = useTranslations("books")
  const [isLoading, setIsLoading] = useState(true)
  const [books, setBooks] = useState<BookWithDetails[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatus, setActiveStatus] = useState<ReadingStatus | "all">("all")

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDatabase()

        // Загружаем книги
        const allBooks = await db.books.toArray()

        // Загружаем пользовательские данные
        const userBooks = await db.userBooks.toArray()

        // Загружаем авторов
        const authors = await db.authors.toArray()
        const bookAuthors = await db.bookAuthors.toArray()

        // Объединяем данные
        const booksWithDetails: BookWithDetails[] = allBooks.map((book) => {
          const ub = userBooks.find((ub) => ub.book_id === book.id)
          const baList = bookAuthors.filter((ba) => ba.book_id === book.id)
          const authorsList = baList
            .map((ba) => authors.find((a) => a.id === ba.author_id))
            .filter(Boolean) as Author[]

          return {
            ...book,
            userBook: ub,
            authorsList,
          }
        })

        setBooks(booksWithDetails)
      } catch (error) {
        console.error("Failed to load books:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Фильтрация
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authorsList?.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = activeStatus === "all" || book.userBook?.status === activeStatus

    return matchesSearch && matchesStatus
  })

  // Статистика
  const stats = {
    total: books.length,
    reading: books.filter((b) => b.userBook?.status === "reading").length,
    completed: books.filter((b) => b.userBook?.status === "completed").length,
    planned: books.filter((b) => b.userBook?.status === "planned").length,
    paused: books.filter((b) => b.userBook?.status === "paused").length,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <AppLayout title={t("list.title")}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Статистика */}
        <div className="grid grid-cols-5 gap-2">
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              {t("list.stats.total")}
            </div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.reading}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              {t("list.stats.reading")}
            </div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="hidden sm:inline">{t("list.stats.completed")}</span>
              <span className="sm:hidden">{t("list.stats.completed")}</span>
            </div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-500">{stats.planned}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              <span className="hidden sm:inline">{t("list.stats.planned")}</span>
              <span className="sm:hidden">{t("list.stats.planned")}</span>
            </div>
          </Card>
          <Card className="p-2 sm:p-3 text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500">{stats.paused}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">
              {t("list.stats.paused")}
            </div>
          </Card>
        </div>

        {/* Фильтры по статусу */}
        <Tabs
          value={activeStatus}
          onValueChange={(value) => setActiveStatus(value as ReadingStatus | "all")}
          aria-label={t("list.filters.all")}
        >
          <TabsList
            className="grid grid-cols-5 w-full h-auto"
            role="tablist"
            aria-label={t("list.filters.all")}
          >
            {statusFilters.map((filter) => (
              <TabsTrigger
                key={filter.value}
                value={filter.value}
                className="text-xs sm:text-sm px-1 sm:px-3 py-2"
                role="tab"
                aria-selected={activeStatus === filter.value}
                aria-controls={`panel-${filter.value}`}
                id={`tab-${filter.value}`}
              >
                <span className="hidden sm:inline">{t(`list.filters.${filter.value}`)}</span>
                <span className="sm:hidden text-[10px]">
                  {t(`list.filters.${filter.value}`).slice(0, 4)}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("list.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Список книг */}
        {isLoading ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("list.loading")}
            </CardContent>
          </Card>
        ) : filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {books.length === 0 ? t("list.empty.library") : t("list.empty.noResults")}
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                aria-label={`${t("list.title")}: ${book.title}`}
              >
                <Card className="hover:bg-accent transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* Обложка */}
                      <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-muted overflow-hidden">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                        )}
                      </div>

                      {/* Контент */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{book.title}</h3>
                            {book.authorsList && book.authorsList.length > 0 && (
                              <p className="text-sm text-muted-foreground truncate">
                                {book.authorsList.map((a) => a.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                            {book.userBook?.rating && (
                              <div className="flex items-center gap-1 shrink-0">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm">{book.userBook.rating}</span>
                              </div>
                            )}
                            {book.userBook?.status && (
                              <Badge
                                className={`${statusColors[book.userBook.status]} whitespace-nowrap text-[10px] sm:text-xs`}
                              >
                                <span className="hidden sm:inline">
                                  {statusLabels[book.userBook.status]}
                                </span>
                                <span className="sm:hidden">
                                  {book.userBook.status === "planned"
                                    ? t("list.stats.planned")
                                    : book.userBook.status === "completed"
                                      ? t("list.stats.completed")
                                      : book.userBook.status === "reading"
                                        ? t("list.stats.reading")
                                        : book.userBook.status === "paused"
                                          ? t("list.stats.paused")
                                          : book.userBook.status === "dropped"
                                            ? t("status.dropped")
                                            : book.userBook.status}
                                </span>
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Мета информация */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {book.published_year && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{book.published_year}</span>
                            </div>
                          )}
                          {book.page_count && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>
                                {book.page_count} {t("list.pages")}
                              </span>
                            </div>
                          )}
                          {/* Прогресс для читаемых книг */}
                          {book.userBook?.status === "reading" &&
                            book.userBook.progress_percent && (
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{book.userBook.progress_percent}%</span>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
