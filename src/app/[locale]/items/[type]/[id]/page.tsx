"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "@/lib/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Package,
  AlertTriangle,
  Bell,
  Plus,
} from "@/lib/icons"
import { useTranslations } from "next-intl"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { db, getEntityById, deleteEntity, createEntity } from "@/lib/db"
import type { Item, ItemType, ReminderType, ReminderPriority } from "@/types"

const typeToReminderType: Record<string, ReminderType> = {
  vitamin: "medicine",
  medicine: "medicine",
  herb: "item",
  cosmetic: "item",
  product: "food",
}

const typeLabels: Record<ItemType, string> = {
  vitamin: "Витамины",
  medicine: "Лекарства",
  herb: "Травы",
  cosmetic: "Косметика",
  product: "Продукты",
}

const typeColors: Record<ItemType, string> = {
  vitamin: "bg-purple-500/10 text-purple-500",
  medicine: "bg-red-500/10 text-red-500",
  herb: "bg-green-500/10 text-green-500",
  cosmetic: "bg-pink-500/10 text-pink-500",
  product: "bg-yellow-500/10 text-yellow-500",
}

export default function ItemDetailPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ItemType
  const id = params.id as string
  const t = useTranslations("items")

  const [item, setItem] = useState<Item | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [reminderDays, setReminderDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6])
  const [reminderStartDate, setReminderStartDate] = useState("")
  const [reminderEndDate, setReminderEndDate] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const itemData = await getEntityById(db.items, id)
        setItem(itemData || null)
      } catch (error) {
        console.error("Failed to load item:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleDelete = async () => {
    if (!item) return
    try {
      await deleteEntity(db.items, item.id)
      router.push("/items")
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const handleCreateReminder = async () => {
    if (!item) return

    await createEntity(db.reminders, {
      type: typeToReminderType[type] || "item",
      title: item.name,
      message: item.dosage || item.usage || "",
      time: reminderTime,
      days: reminderDays,
      priority: "medium" as ReminderPriority,
      is_active: true,
      sound: true,
      vibration: true,
      persistent: false,
      related_id: item.id,
      related_type: "item",
      start_date: reminderStartDate || undefined,
      end_date: reminderEndDate || undefined,
      streak: 0,
      longest_streak: 0,
      total_completed: 0,
    })

    setShowReminderDialog(false)
    router.push("/reminders")
  }

  const toggleReminderDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    )
  }

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <AppLayout title={t("detail.loading")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("detail.loading")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (!item) {
    return (
      <AppLayout title={t("detail.notFound")}>
        <div className="container mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-4 text-center text-muted-foreground">
              {t("detail.notFound")}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={typeLabels[type]}>
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("detail.back")}
        </Button>

        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{item.name}</CardTitle>
                {item.category && (
                  <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
                )}
              </div>
              <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {item.description && <p className="text-muted-foreground">{item.description}</p>}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="usage">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usage">{t("detail.usage")}</TabsTrigger>
            <TabsTrigger value="health">{t("detail.health")}</TabsTrigger>
            <TabsTrigger value="info">{t("detail.info")}</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("detail.usageMethod")}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.usage ? (
                  <p className="whitespace-pre-wrap">{item.usage}</p>
                ) : (
                  <p className="text-muted-foreground">{t("detail.notSpecified")}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("detail.dosage")}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.dosage ? (
                  <p>{item.dosage}</p>
                ) : (
                  <p className="text-muted-foreground">{t("detail.notSpecified")}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("detail.form")}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.form ? (
                  <p>{item.form}</p>
                ) : (
                  <p className="text-muted-foreground">{t("detail.notSpecified")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("detail.benefits")}</CardTitle>
              </CardHeader>
              <CardContent>
                {item.benefits ? (
                  <p className="whitespace-pre-wrap">{item.benefits}</p>
                ) : (
                  <p className="text-muted-foreground">{t("detail.notSpecified")}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  {t("detail.contraindications")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.contraindications ? (
                  <p className="whitespace-pre-wrap">{item.contraindications}</p>
                ) : (
                  <p className="text-muted-foreground">{t("detail.notSpecified")}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.manufacturer")}</p>
                    <p>{item.manufacturer || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("detail.expiration")}</p>
                    <p>{item.expiration ? formatDate(item.expiration) : "-"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{t("detail.composition")}</p>
                  <p className="whitespace-pre-wrap">{item.composition || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">{t("detail.storage")}</p>
                  <p>{item.storage || "-"}</p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{t("detail.notes")}</p>
                  <p className="whitespace-pre-wrap">{item.notes || "-"}</p>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">{t("detail.tags")}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Reminder Button */}
        <Card className="border-dashed">
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowReminderDialog(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              {t("detail.createReminder")}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("detail.delete")}
          </Button>
          <Link href={`/items/${type}/${id}/edit`} className="flex-1">
            <Button className="w-full">
              <Pencil className="h-4 w-4 mr-2" />
              {t("detail.edit")}
            </Button>
          </Link>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("detail.deleteDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("detail.deleteDialogDescription", { name: item.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                {t("detail.reminderCancel")}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {t("detail.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Reminder Dialog */}
        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t("detail.reminderDialogTitle")}</DialogTitle>
              <DialogDescription>
                {t("detail.reminderDialogDescription", { name: item.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("detail.reminderTime")}</label>
                <input
                  type="time"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("detail.reminderDays")}</label>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map((day, i) => (
                    <Button
                      key={i}
                      type="button"
                      variant={reminderDays.includes(i) ? "default" : "outline"}
                      size="sm"
                      className="px-0"
                      onClick={() => toggleReminderDay(i)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("detail.reminderStartDate")}</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={reminderStartDate}
                    onChange={(e) => setReminderStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("detail.reminderEndDate")}</label>
                  <input
                    type="date"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={reminderEndDate}
                    onChange={(e) => setReminderEndDate(e.target.value)}
                  />
                </div>
              </div>

              {item.dosage && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">{t("detail.reminderDosageLabel")}</p>
                  <p className="text-sm font-medium">{item.dosage}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
                {t("detail.reminderCancel")}
              </Button>
              <Button onClick={handleCreateReminder}>
                <Bell className="h-4 w-4 mr-2" />
                {t("detail.reminderCreate")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
