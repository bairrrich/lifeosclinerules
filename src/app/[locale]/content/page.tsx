"use client"

import { useEffect } from "react"
import { useRouter } from "@/lib/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function ContentPage() {
  const router = useRouter()

  useEffect(() => {
    // Перенаправляем на книги (раздел content разделён на книги и рецепты)
    router.replace("/books")
  }, [router])

  return (
    <AppLayout title="Перенаправление...">
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Перенаправление...
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
