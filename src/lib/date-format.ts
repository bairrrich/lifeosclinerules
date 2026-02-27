import { useLocale } from "next-intl"

/**
 * Format a date using the current locale
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  const locale = typeof window !== "undefined" ? document.documentElement.lang : "en"
  return dateObj.toLocaleDateString(locale, options)
}

/**
 * React hook to format dates with the current locale
 */
export function useDateFormat() {
  const locale = useLocale()

  const format = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString(locale, options)
  }

  return { format, locale }
}
