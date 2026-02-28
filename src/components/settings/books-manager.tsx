"use client"

import { Book, BookOpen, CheckCircle, Bookmark } from "@/lib/icons"
import { useTranslations } from "next-intl"
import { StatsGrid } from "@/components/shared"
import { useSettings } from "./settings-context"

export function BooksManager() {
  const { stats } = useSettings()
  const t = useTranslations("settings")

  return (
    <StatsGrid
      title={t("books.title")}
      description={t("books.description")}
      icon={Book}
      stats={[
        { value: stats.books, label: t("books.totalBooks"), icon: Book },
        { value: stats.booksReading, label: t("books.reading"), icon: BookOpen },
        { value: stats.booksCompleted, label: t("books.completed"), icon: CheckCircle },
        { value: stats.booksPlanned, label: t("books.planned"), icon: Bookmark },
      ]}
      columns={4}
    />
  )
}
