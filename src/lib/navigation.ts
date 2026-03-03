import { createNavigation } from "next-intl/navigation"
import { defaultLocale, locales } from "@/lib/i18n-constants"

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "as-needed",
  defaultLocale,
})

// Re-export from next/navigation
export { useSearchParams, useParams } from "next/navigation"
