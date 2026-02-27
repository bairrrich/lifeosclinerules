import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Отключаем статическую генерацию для динамических страниц
  output: "standalone",
  // Отключаем предупреждение о middleware
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Оптимизация импортов пакетов для tree-shaking
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-progress",
      "@radix-ui/react-label",
    ],
  },
  // Принудительно отключаем кэширование
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  // Отключаем кэширование изображений
  images: {
    unoptimized: true,
  },
  // Headers для отключения кэширования
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
