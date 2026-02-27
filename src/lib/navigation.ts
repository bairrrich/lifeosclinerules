import { createNavigation } from "next-intl/navigation"
import { defaultLocale, locales } from "@/i18n"

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "as-needed",
  defaultLocale,
})

// Re-export from next/navigation
export { useSearchParams, useParams } from "next/navigation"
