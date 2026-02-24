"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Тип для события beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

// Проверка, установлено ли приложение
const getIsInstalledInitial = () => {
  if (typeof window === "undefined") return false
  return window.matchMedia("(display-mode: standalone)").matches
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  // Инициализируем состояние сразу, чтобы избежать setState в effect
  const [isInstalled, setIsInstalled] = useState(getIsInstalledInitial)

  useEffect(() => {
    // Регистрация Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration.scope)
        })
        .catch((error) => {
          console.log("SW registration failed:", error)
        })
    }

    // Обработка события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Показываем промпт только если не было отказов ранее
      const dismissed = localStorage.getItem("pwa-install-dismissed")
      if (!dismissed) {
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Обработка успешной установки
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem("pwa-install-dismissed", "true")
  }

  if (isInstalled || !showInstallPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[calc(960px-2rem)] mx-auto">
      <Card className="border-primary/20 bg-background/95 backdrop-blur shadow-lg">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Download className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Установить Life OS</p>
            <p className="text-xs text-muted-foreground">
              Работает офлайн и быстрее запускается
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleInstall}>
              Установить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}