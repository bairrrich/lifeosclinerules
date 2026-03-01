"use client"

import { AppLayout } from "@/components/layout/app-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SettingsProvider,
  AppearanceSettings,
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
import { useTranslations } from "next-intl"
import { Settings, ClipboardList, Package, BookOpen, ChefHat } from "@/lib/icons"

function AboutCard() {
  const t = useTranslations("settings")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("about.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{t("about.description")}</p>
        <p>{t("about.version")}: 1.0.0</p>
        <p>{t("about.technologies")}: Next.js, Dexie, shadcn/ui</p>
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const t = useTranslations("settings")

  return (
    <SettingsProvider>
      <AppLayout title={t("title")}>
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="general" className="space-y-4" aria-label={t("title")}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="general" className="text-xs sm:text-sm">
                <Settings className="h-4 w-4 hidden sm:inline sm:mr-1" />
                <span className="hidden sm:inline">{t("tabs.general")}</span>
                <Settings className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="logs" className="text-xs sm:text-sm">
                <ClipboardList className="h-4 w-4 hidden sm:inline sm:mr-1" />
                <span className="hidden sm:inline">{t("tabs.logs")}</span>
                <ClipboardList className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="items" className="text-xs sm:text-sm">
                <Package className="h-4 w-4 hidden sm:inline sm:mr-1" />
                <span className="hidden sm:inline">{t("tabs.items")}</span>
                <Package className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="books" className="text-xs sm:text-sm">
                <BookOpen className="h-4 w-4 hidden sm:inline sm:mr-1" />
                <span className="hidden sm:inline">{t("tabs.books")}</span>
                <BookOpen className="h-4 w-4 sm:hidden" />
              </TabsTrigger>
              <TabsTrigger value="recipes" className="text-xs sm:text-sm">
                <ChefHat className="h-4 w-4 hidden sm:inline sm:mr-1" />
                <span className="hidden sm:inline">{t("tabs.recipes")}</span>
                <ChefHat className="h-4 w-4 sm:hidden" />
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
              <AppearanceSettings />
              <DataStats />
              <SyncManager />
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
              <RecurringTransactions />
              <AccountsManager />
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
