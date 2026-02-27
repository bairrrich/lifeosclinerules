"use client"

import { useState, useEffect } from "react"
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Loader2, LogIn } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSync, isSupabaseConfigured } from "@/lib/supabase/sync-service"
import { getSupabaseClient } from "@/lib/supabase"

export function SyncManager() {
  const { status, lastSyncAt, error, pendingChanges, isConfigured, sync, countPendingChanges } =
    useSync()

  const [isChecking, setIsChecking] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()

    // Listen for auth changes
    const supabase = getSupabaseClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    countPendingChanges()
  }, [countPendingChanges])

  const handleSync = async () => {
    setIsChecking(true)
    try {
      const result = await sync()
      if (result?.error) {
        setAuthError(result.error)
      }
    } finally {
      setIsChecking(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAuthLoading(true)
    setAuthError(null)

    const supabase = getSupabaseClient()

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setAuthError("Проверьте email для подтверждения регистрации")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        setIsLoggedIn(true)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка авторизации"
      setAuthError(message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
  }

  const isSyncing = status === "syncing" || isChecking

  // Check if Supabase is configured
  const hasSupabase = isSupabaseConfigured()

  if (!hasSupabase) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudOff className="h-5 w-5" />
            Облачная синхронизация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Синхронизация не настроена. Добавьте ключи Supabase в файл .env.local
          </p>
          <div className="bg-muted p-3 rounded-lg text-xs font-mono">
            <p>NEXT_PUBLIC_SUPABASE_URL=https://...</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show login form if not authenticated
  if (!isLoggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            Облачная синхронизация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Войдите в аккаунт для синхронизации данных между устройствами
          </p>

          <form onSubmit={handleAuth} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {authError && (
              <div className="p-2 bg-destructive/10 text-destructive rounded text-xs">
                {authError}
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isAuthLoading} className="flex-1">
                {isAuthLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {authMode === "login" ? "Войти" : "Зарегистрироваться"}
              </Button>
            </div>
          </form>

          <Button
            variant="link"
            size="sm"
            onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
            className="w-full"
          >
            {authMode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Облачная синхронизация
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Выйти
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : status === "success" ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : status === "error" ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : (
              <Cloud className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {isSyncing
                ? "Синхронизация..."
                : status === "success"
                  ? "Синхронизировано"
                  : status === "error"
                    ? "Ошибка синхронизации"
                    : "Готово к синхронизации"}
            </span>
          </div>
          <Button size="sm" onClick={handleSync} disabled={isSyncing} className="gap-2">
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Синхронизировать
          </Button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Последняя синхронизация</div>
            <div className="text-sm font-medium">
              {lastSyncAt
                ? new Date(lastSyncAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Никогда"}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Ожидают синхронизации</div>
            <div className="text-sm font-medium">{pendingChanges} записей</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            <p className="font-medium">Ошибка:</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Auto-sync hint */}
        <p className="text-xs text-muted-foreground">
          💡 Синхронизация работает в фоне при наличии интернета
        </p>
      </CardContent>
    </Card>
  )
}

// Mini sync indicator for header
export function SyncIndicator() {
  const { status, pendingChanges, sync } = useSync()
  const isSyncing = status === "syncing"

  if (!isSupabaseConfigured()) {
    return (
      <Button variant="ghost" size="icon" className="relative opacity-50">
        <CloudOff className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => sync()}
      className="relative"
      title={isSyncing ? "Синхронизация..." : `Синхронизировать (${pendingChanges} изменений)`}
    >
      {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
      {pendingChanges > 0 && !isSyncing && (
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
          {pendingChanges > 9 ? "9+" : pendingChanges}
        </span>
      )}
    </Button>
  )
}
