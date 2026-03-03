import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import { Metadata, Viewport } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { PWAProvider } from "@/components/pwa-provider"
import { ToastContainer } from "@/components/ui/toast"
import { ReminderNotification } from "@/components/reminder-notification"
import { DisableRightClick } from "@/components/shared/disable-right-click"

export const metadata: Metadata = {
  title: "Life OS",
  description: "Unified application for tracking nutrition, workouts, finances and more",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life OS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(98.8% 0.004 220)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(11% 0.018 240)" },
  ],
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased" role="main">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DisableRightClick>
              <PWAProvider />
              {children}
              <ToastContainer role="alert" aria-live="polite" />
              <ReminderNotification role="status" aria-live="polite" />
            </DisableRightClick>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
