"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "@/lib/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Moon, Plus, Settings } from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { PageActions, DeleteConfirmActions } from "@/components/shared/page-actions"
import { AddSleepDialog } from "@/components/dialogs/add-sleep-dialog"
import { db, initializeDatabase, createEntity, updateEntity, deleteEntity } from "@/lib/db"
import type { SleepLog } from "@/types"
import { moduleColors, priorityColors, sleepColors } from "@/lib/theme-colors"

const qualityLabels: Record<number, string> = {
  1: "veryPoor",
  2: "poor",
  3: "okay",
  4: "good",
  5: "excellent",
}

const qualityColors: Record<number, string> = {
  1: sleepColors.veryPoor,
  2: sleepColors.poor,
  3: sleepColors.okay,
  4: sleepColors.good,
  5: sleepColors.excellent,
}

export default function SleepPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SleepContent />
    </Suspense>
  )
}

function SleepContent() {
  const searchParams = useSearchParams()
  const t = useTranslations("sleep")
  const locale = useLocale()
  const dateFnsLocale = locale === "ru" ? ru : enUS
  const [isLoading, setIsLoading] = useState(true)
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<SleepLog | null>(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    start_time: "23:00",
    end_time: "07:00",
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  // Открыть диалог добавления если передан параметр add=true
  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setIsAddDialogOpen(true)
      // Clear the query parameter after opening to allow re-opening the dialog
      const url = new URL(window.location.href)
      url.searchParams.delete("add")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  async function loadData() {
    try {
      await initializeDatabase()
      const logs = await db.sleepLogs.orderBy("date").reverse().limit(30).toArray()
      setSleepLogs(logs)
    } catch (error) {
      console.error("Failed to load sleep data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function calculateDuration(start: string, end: string): number {
    const [startH, startM] = start.split(":").map(Number)
    const [endH, endM] = end.split(":").map(Number)

    let startMinutes = startH * 60 + startM
    let endMinutes = endH * 60 + endM

    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }

    return endMinutes - startMinutes
  }

  async function updateSleepLog() {
    if (!editingLog) return

    const duration = calculateDuration(formData.start_time, formData.end_time)

    await updateEntity(db.sleepLogs, editingLog.id, {
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      duration_min: duration,
      quality: formData.quality,
      notes: formData.notes || undefined,
    })

    setIsEditDialogOpen(false)
    setEditingLog(null)
    resetForm()
    loadData()
  }

  async function deleteSleepLog() {
    if (!editingLog) return

    await deleteEntity(db.sleepLogs, editingLog.id)

    setIsDeleteDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingLog(null)
    resetForm()
    loadData()
  }

  function resetForm() {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      start_time: "23:00",
      end_time: "07:00",
      quality: 3,
      notes: "",
    })
  }

  function openEditDialog(log: SleepLog) {
    setEditingLog(log)
    setFormData({
      date: log.date,
      start_time: log.start_time,
      end_time: log.end_time,
      quality: log.quality,
      notes: log.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours} ${t("hour")} ${mins} ${t("minute")}`
  }

  const getWeekAverage = (): number => {
    const weekLogs = sleepLogs.slice(0, 7)
    if (weekLogs.length === 0) return 0
    return Math.round(weekLogs.reduce((sum, log) => sum + log.duration_min, 0) / weekLogs.length)
  }

  const lastNight = sleepLogs[0]

  return (
    <AppLayout title={t("title")}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Last Night Summary */}
        <Card>
          <CardContent className="p-6">
            {lastNight ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${moduleColors.sleep.light}`}
                  >
                    <Moon className={`h-7 w-7 ${qualityColors[lastNight.quality]}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {formatDuration(lastNight.duration_min)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lastNight.start_time} → {lastNight.end_time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${qualityColors[lastNight.quality]}`}>
                    {t(`quality.${qualityLabels[lastNight.quality]}`)}
                  </div>
                  <div className="text-sm text-muted-foreground">{t("fields.quality")}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <Moon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("empty.noSleep")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{formatDuration(getWeekAverage())}</div>
              <div className="text-sm text-muted-foreground">{t("stats.weekAverage")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{sleepLogs.length}</div>
              <div className="text-sm text-muted-foreground">{t("stats.recordsCount")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Week Chart */}
        {sleepLogs.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">{t("weekChart")}</h3>
              <div className="flex items-end justify-between h-24 gap-1">
                {sleepLogs
                  .slice(0, 7)
                  .reverse()
                  .map((log, i) => {
                    const height = Math.min(100, (log.duration_min / 480) * 100)
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t transition-[height] ${
                            log.quality >= 4
                              ? priorityColors.high.DEFAULT
                              : log.quality >= 3
                                ? priorityColors.medium.DEFAULT
                                : priorityColors.low.DEFAULT
                          }`}
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(log.date).toLocaleDateString(locale, { weekday: "short" })}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History */}
        <div>
          <h2 className="text-lg font-semibold mb-3">{t("history")}</h2>
          {isLoading ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.loading")}
              </CardContent>
            </Card>
          ) : sleepLogs.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                {t("empty.noRecords")}
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {sleepLogs.slice(0, 10).map((log) => (
                <Card key={log.id} className="group">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${moduleColors.sleep.light}`}
                    >
                      <Moon className={`h-5 w-5 ${qualityColors[log.quality]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{formatDuration(log.duration_min)}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.start_time} → {log.end_time}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {new Date(log.date).toLocaleDateString(locale, {
                          day: "numeric",
                          month: "short",
                        })}
                      </div>
                      <div className={`text-xs ${qualityColors[log.quality]}`}>
                        {qualityLabels[log.quality]}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(log)}
                      aria-label="Редактировать запись"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Dialog */}
        <AddSleepDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSuccess={() => {}}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.editTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">{t("dialogs.dateLabel")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(new Date(formData.date), "LLL dd, y", { locale: dateFnsLocale })
                      ) : (
                        <span>{t("dialogs.dateLabel")}</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="bottom" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) =>
                        setFormData({ ...formData, date: date ? format(date, "yyyy-MM-dd") : "" })
                      }
                      initialFocus
                      locale={dateFnsLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">{t("dialogs.bedtimeLabel")}</Label>
                  <Input
                    id="edit-start"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end">{t("dialogs.wakeTimeLabel")}</Label>
                  <Input
                    id="edit-end"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("dialogs.qualityLabel")}</Label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map((q) => (
                    <Button
                      key={q}
                      variant={formData.quality === q ? "default" : "outline"}
                      onClick={() => setFormData({ ...formData, quality: q })}
                      className="flex-1"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t(`quality.${qualityLabels[formData.quality]}`)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">{t("dialogs.notesLabel")}</Label>
                <Input
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("dialogs.notesPlaceholder")}
                />
              </div>

              <div className="text-center text-muted-foreground">
                {t("dialogs.duration")}:{" "}
                {formatDuration(calculateDuration(formData.start_time, formData.end_time))}
              </div>
            </div>
            <PageActions
              variant="dialog"
              showDelete={true}
              onSimpleDelete={() => setIsDeleteDialogOpen(true)}
              onCancel={() => setIsEditDialogOpen(false)}
              onSimpleSave={updateSleepLog}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialogs.deleteTitle")}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">{t("dialogs.deleteConfirm")}</p>
            <DeleteConfirmActions
              onCancel={() => setIsDeleteDialogOpen(false)}
              onConfirm={deleteSleepLog}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
