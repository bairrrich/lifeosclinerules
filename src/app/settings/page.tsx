"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Monitor, Download, Upload, Trash2, Database, Plus, Save, Edit2 } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { db, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import { seedDatabase, reseedDatabase, cleanupDuplicateCategories } from "@/lib/db/seed"
import type { Account } from "@/types"

// Типы аккаунтов с иконками
const accountTypes = [
  { value: "cash", label: "💵 Наличные" },
  { value: "card", label: "💳 Карта" },
  { value: "bank", label: "🏦 Счёт" },
  { value: "deposit", label: "📈 Вклад" },
  { value: "investment", label: "📊 Инвестиции" },
  { value: "crypto", label: "₿ Крипто" },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState({
    logs: 0,
    items: 0,
    content: 0,
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "card" as Account["type"],
    balance: 0,
    currency: "RUB",
  })

  useEffect(() => {
    setMounted(true)
    loadStats()
    loadAccounts()
  }, [])

  const loadStats = async () => {
    const [logs, items, content] = await Promise.all([
      db.logs.count(),
      db.items.count(),
      db.content.count(),
    ])
    setStats({ logs, items, content })
  }

  const loadAccounts = async () => {
    const accs = await db.accounts.toArray()
    setAccounts(accs)
  }

  const handleCreateAccount = async () => {
    if (!newAccount.name.trim()) return
    
    await createEntity(db.accounts, {
      name: newAccount.name,
      type: newAccount.type,
      balance: newAccount.balance,
      currency: newAccount.currency,
    })
    
    setNewAccount({ name: "", type: "card", balance: 0, currency: "RUB" })
    loadAccounts()
  }

  const handleUpdateAccount = async () => {
    if (!editingAccount) return
    
    await updateEntity(db.accounts, editingAccount.id, {
      name: editingAccount.name,
      type: editingAccount.type,
      balance: editingAccount.balance,
      currency: editingAccount.currency,
    })
    
    setEditingAccount(null)
    loadAccounts()
  }

  const handleDeleteAccount = async (id: string) => {
    if (confirm("Удалить аккаунт?")) {
      await deleteEntity(db.accounts, id)
      loadAccounts()
    }
  }

  const handleExport = async () => {
    try {
      const data = {
        logs: await db.logs.toArray(),
        items: await db.items.toArray(),
        content: await db.content.toArray(),
        categories: await db.categories.toArray(),
        tags: await db.tags.toArray(),
        accounts: await db.accounts.toArray(),
        exportedAt: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `life-os-backup-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.logs) await db.logs.bulkPut(data.logs)
        if (data.items) await db.items.bulkPut(data.items)
        if (data.content) await db.content.bulkPut(data.content)
        if (data.categories) await db.categories.bulkPut(data.categories)
        if (data.tags) await db.tags.bulkPut(data.tags)
        if (data.accounts) await db.accounts.bulkPut(data.accounts)

        window.location.reload()
      } catch (error) {
        console.error("Import failed:", error)
      }
    }
    input.click()
  }

  const handleClearData = async () => {
    if (confirm("Вы уверены? Все данные будут удалены без возможности восстановления!")) {
      await Promise.all([
        db.logs.clear(),
        db.items.clear(),
        db.content.clear(),
        db.categories.clear(),
        db.tags.clear(),
        db.accounts.clear(),
      ])
      window.location.reload()
    }
  }

  const handleSeedData = async () => {
    const result = await seedDatabase()
    if (result) {
      window.location.reload()
    } else {
      alert("База данных уже содержит данные. Сначала очистите данные.")
    }
  }

  const handleReseedData = async () => {
    if (confirm("Пересоздать базу данных? Все текущие данные будут удалены и заменены тестовыми!")) {
      await reseedDatabase()
      window.location.reload()
    }
  }

  const handleCleanupDuplicates = async () => {
    const count = await cleanupDuplicateCategories()
    if (count > 0) {
      alert(`Удалено ${count} дубликатов категорий`)
      window.location.reload()
    } else {
      alert("Дубликаты не найдены")
    }
  }

  return (
    <AppLayout title="Настройки">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="logs">Учёт</TabsTrigger>
            <TabsTrigger value="items">Каталог</TabsTrigger>
            <TabsTrigger value="content">Контент</TabsTrigger>
          </TabsList>

          {/* Вкладка "Общие" */}
          <TabsContent value="general" className="space-y-6">
            {/* Theme */}
            <Card>
              <CardHeader>
                <CardTitle>Оформление</CardTitle>
                <CardDescription>Настройте внешний вид приложения</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Тема</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={mounted && theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Светлая
                    </Button>
                    <Button
                      variant={mounted && theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Темная
                    </Button>
                    <Button
                      variant={mounted && theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      Системная
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Данные</CardTitle>
                <CardDescription>Статистика хранилища</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-muted">
                    <div className="text-2xl font-bold">{stats.logs}</div>
                    <div className="text-sm text-muted-foreground">Записей</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <div className="text-2xl font-bold">{stats.items}</div>
                    <div className="text-sm text-muted-foreground">Каталог</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted">
                    <div className="text-2xl font-bold">{stats.content}</div>
                    <div className="text-sm text-muted-foreground">Контент</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup */}
            <Card>
              <CardHeader>
                <CardTitle>Резервное копирование</CardTitle>
                <CardDescription>Экспорт и импорт данных</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                  <Button variant="outline" onClick={handleImport} className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Импорт
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Опасная зона</CardTitle>
                <CardDescription>Необратимые действия</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" onClick={handleSeedData} className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Заполнить тестовыми данными
                </Button>
                <Button variant="outline" onClick={handleReseedData} className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Пересоздать тестовые данные
                </Button>
                <Button variant="outline" onClick={handleCleanupDuplicates} className="w-full">
                  Очистить дубликаты категорий
                </Button>
                <Button variant="destructive" onClick={handleClearData} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Очистить все данные
                </Button>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>О приложении</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Life OS — единое приложение для учета различных аспектов жизни.</p>
                <p>Версия: 1.0.0</p>
                <p>Технологии: Next.js, Dexie, shadcn/ui</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка "Учёт" */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Финансовые аккаунты</CardTitle>
                <CardDescription>Управление счетами и картами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Список аккаунтов */}
                {accounts.map((account) => (
                  <div key={account.id} className="p-4 rounded-xl bg-muted space-y-3">
                    {editingAccount?.id === account.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={editingAccount.name}
                            onChange={(e) => setEditingAccount({ ...editingAccount, name: e.target.value })}
                            placeholder="Название"
                          />
                          <select
                            className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            value={editingAccount.type}
                            onChange={(e) => setEditingAccount({ ...editingAccount, type: e.target.value as Account["type"] })}
                          >
                            {accountTypes.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            type="number"
                            value={editingAccount.balance}
                            onChange={(e) => setEditingAccount({ ...editingAccount, balance: Number(e.target.value) })}
                            placeholder="Баланс"
                          />
                          <Input
                            value={editingAccount.currency}
                            onChange={(e) => setEditingAccount({ ...editingAccount, currency: e.target.value })}
                            placeholder="Валюта"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateAccount}>
                            <Save className="h-4 w-4 mr-1" />
                            Сохранить
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingAccount(null)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {accountTypes.find(t => t.value === account.type)?.label} • {account.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Баланс: {account.balance.toLocaleString()} {account.currency}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => setEditingAccount(account)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteAccount(account.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Форма добавления */}
                <div className="p-4 rounded-xl border-2 border-dashed space-y-3">
                  <div className="text-sm font-medium">Добавить аккаунт</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="Название"
                    />
                    <select
                      className="flex h-10 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                      value={newAccount.type}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as Account["type"] })}
                    >
                      {accountTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                      placeholder="Начальный баланс"
                    />
                    <Input
                      value={newAccount.currency}
                      onChange={(e) => setNewAccount({ ...newAccount, currency: e.target.value })}
                      placeholder="Валюта (RUB)"
                    />
                  </div>
                  <Button onClick={handleCreateAccount} disabled={!newAccount.name.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка "Каталог" */}
          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Каталог</CardTitle>
                <CardDescription>Настройки каталога веществ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Настройки каталога пока не реализованы. Скоро здесь появятся опции для управления типами веществ.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Вкладка "Контент" */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Контент</CardTitle>
                <CardDescription>Настройки контента</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Настройки контента пока не реализованы. Скоро здесь появятся опции для управления книгами и рецептами.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}