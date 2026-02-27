export { BookForm } from "./book-form"
export { UserBookForm } from "./user-book-form"
export { BookQuotes } from "./book-quotes"

// Статусы для отображения (используются в таблицах без переводов)
export const statusColors: Record<string, string> = {
  planned: "bg-gray-500/10 text-gray-500",
  reading: "bg-blue-500/10 text-blue-500",
  completed: "bg-green-500/10 text-green-500",
  paused: "bg-yellow-500/10 text-yellow-500",
  dropped: "bg-red-500/10 text-red-500",
}

// Форматы книг (используются в таблицах без переводов)
export const formatColors: Record<string, string> = {
  paperback: "bg-purple-500/10 text-purple-500",
  hardcover: "bg-blue-500/10 text-blue-500",
  ebook: "bg-green-500/10 text-green-500",
  audiobook: "bg-pink-500/10 text-pink-500",
}
