"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SettingsProvider,
  ThemeSwitcher,
  DataStats,
  BackupManager,
  ExportManager,
  DangerZone,
  AccountsManager,
  CategoriesManager,
  UnitsManager,
  ItemsManager,
  BooksManager,
  RecipesManager,
} from "@/components/settings"
import { RecurringTransactions } from "@/components/finance/recurring-transactions"
import { SyncManager } from "@/components/settings/sync-manager"

function AboutCard() {
  return (
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
  )
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <AppLayout title="Настройки">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="general" className="space-y-4" aria-label="Разделы настроек">
            <TabsList className="grid w-full grid-cols-5" role="tablist">
              <TabsTrigger
                value="general"
                role="tab"
                aria-selected={true}
                id="tab-general"
                aria-controls="panel-general"
              >
                Общие
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                role="tab"
                aria-selected={false}
                id="tab-logs"
                aria-controls="panel-logs"
              >
                Учёт
              </TabsTrigger>
              <TabsTrigger
                value="items"
                role="tab"
                aria-selected={false}
                id="tab-items"
                aria-controls="panel-items"
              >
                Каталог
              </TabsTrigger>
              <TabsTrigger
                value="books"
                role="tab"
                aria-selected={false}
                id="tab-books"
                aria-controls="panel-books"
              >
                Книги
              </TabsTrigger>
              <TabsTrigger
                value="recipes"
                role="tab"
                aria-selected={false}
                id="tab-recipes"
                aria-controls="panel-recipes"
              >
                Рецепты
              </TabsTrigger>
            </TabsList>

            {/* Вкладка "Общие" */}
            <TabsContent
              value="general"
              className="space-y-6"
              role="tabpanel"
              id="panel-general"
              aria-labelledby="tab-general"
            >
              <SyncManager />
              <ThemeSwitcher />
              <DataStats />
              <BackupManager />
              <ExportManager />
              <DangerZone />
              <AboutCard />
            </TabsContent>

            {/* Вкладка "Учёт" */}
            <TabsContent
              value="logs"
              className="space-y-6"
              role="tabpanel"
              id="panel-logs"
              aria-labelledby="tab-logs"
            >
              <AccountsManager />
              <RecurringTransactions />
              <CategoriesManager />
              <UnitsManager />
            </TabsContent>

            {/* Вкладка "Каталог" */}
            <TabsContent
              value="items"
              className="space-y-6"
              role="tabpanel"
              id="panel-items"
              aria-labelledby="tab-items"
            >
              <ItemsManager />
            </TabsContent>

            {/* Вкладка "Книги" */}
            <TabsContent
              value="books"
              className="space-y-6"
              role="tabpanel"
              id="panel-books"
              aria-labelledby="tab-books"
            >
              <BooksManager />
            </TabsContent>

            {/* Вкладка "Рецепты" */}
            <TabsContent
              value="recipes"
              className="space-y-6"
              role="tabpanel"
              id="panel-recipes"
              aria-labelledby="tab-recipes"
            >
              <RecipesManager />
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </SettingsProvider>
  )
}
