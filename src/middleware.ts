import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "./i18n/index"

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
})

export const config = {
  matcher: ["/", "/(ru|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
}
