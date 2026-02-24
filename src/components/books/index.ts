export { BookForm, bookFormats, languages } from "./book-form"
export { UserBookForm, readingStatuses, ownedFormats } from "./user-book-form"
export { BookQuotes } from "./book-quotes"

// Статусы для отображения
export const statusColors: Record<string, string> = {
  planned: "bg-gray-500/10 text-gray-500",
  reading: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  paused: "bg-yellow-500/10 text-yellow-500",
  dropped: "bg-red-500/10 text-red-500",
}

export const statusLabels: Record<string, string> = {
  planned: "Запланировано",
  reading: "Читаю",
  completed: "Прочитано",
  paused: "Пауза",
  dropped: "Брошено",
}

// Форматы книг
export const formatLabels: Record<string, string> = {
  paperback: "Мягкая обложка",
  hardcover: "Твёрдая обложка",
  ebook: "Электронная",
  audiobook: "Аудиокнига",
}