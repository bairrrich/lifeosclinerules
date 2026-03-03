"use client"

import { useEffect } from "react"
import { useRouter } from "@/lib/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function ContentPage() {
  const router = useRouter()
  const t = useTranslations("common")

  useEffect(() => {
    // Перенаправляем на книги (раздел content разделён на книги и рецепты)
    router.replace("/books")
  }, [router])

  return (
    <AppLayout title={t("redirecting")}>
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            {t("redirecting")}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
