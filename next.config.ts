import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Отключаем статическую генерацию для динамических страниц
  output: "standalone",
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
    ];
  },
};

export default nextConfig;