"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "@/lib/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логируем ошибку
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Ошибка приложения</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-xs text-left bg-muted p-3 rounded mb-4 overflow-auto max-h-40 text-destructive">
              {error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Попробовать снова
            </Button>
            <Link href="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                На главную
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
