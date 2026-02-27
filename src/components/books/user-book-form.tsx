"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect } from "@/components/ui/native-select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserBook, ReadingStatus, BookFormat } from "@/types"

// Статусы чтения
export const readingStatuses: { value: ReadingStatus; label: string; color: string }[] = [
  { value: "planned", label: "Запланировано", color: "bg-gray-500/10 text-gray-500" },
  { value: "reading", label: "Читаю", color: "bg-blue-500/10 text-blue-500" },
  { value: "completed", label: "Прочитано", color: "bg-green-500/10 text-green-500" },
  { value: "paused", label: "Пауза", color: "bg-yellow-500/10 text-yellow-500" },
  { value: "dropped", label: "Брошено", color: "bg-red-500/10 text-red-500" },
]

// Форматы владения
export const ownedFormats: { value: BookFormat; label: string }[] = [
  { value: "paperback", label: "Мягкая обложка" },
  { value: "hardcover", label: "Твёрдая обложка" },
  { value: "ebook", label: "Электронная" },
  { value: "audiobook", label: "Аудиокнига" },
]

interface UserBookFormProps {
  data?: Partial<UserBook>
  pageCount?: number
  onChange: (data: Partial<UserBook>) => void
}

export function UserBookForm({ data, pageCount, onChange }: UserBookFormProps) {
  const t = useTranslations("books")
  const updateField = <K extends keyof UserBook>(field: K, value: UserBook[K]) => {
    onChange({ ...data, [field]: value })
  }

  // Вычисляем процент прогресса
  const progressPercent =
    data?.progress_percent ??
    (data?.progress_pages && pageCount ? Math.round((data.progress_pages / pageCount) * 100) : 0)

  return (
    <>
      {/* Статус и прогресс */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userBook.status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("userBook.status")}</Label>
            <Tabs
              value={data?.status || "planned"}
              onValueChange={(value) => updateField("status", value as ReadingStatus)}
            >
              <TabsList className="grid grid-cols-5 w-full">
                {readingStatuses.map((s) => (
                  <TabsTrigger key={s.value} value={s.value} className="text-xs px-1">
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Прогресс */}
          {(data?.status === "reading" || data?.status === "paused") && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="progress_pages">{t("userBook.pages")}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="progress_pages"
                    type="number"
                    min={0}
                    max={pageCount}
                    placeholder="0"
                    value={data?.progress_pages || ""}
                    onChange={(e) => {
                      const pages = e.target.value ? parseInt(e.target.value) : undefined
                      updateField("progress_pages", pages)
                      if (pages && pageCount) {
                        updateField("progress_percent", Math.round((pages / pageCount) * 100))
                      }
                    }}
                  />
                  {pageCount && (
                    <span className="text-sm text-muted-foreground">
                      {t("userBook.pages")} {pageCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Прогресс бар */}
              {progressPercent > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("userBook.progress")}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-[width]"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Даты */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="started_at">{t("userBook.startedAt")}</Label>
              <Input
                id="started_at"
                type="date"
                value={data?.started_at?.split("T")[0] || ""}
                onChange={(e) => updateField("started_at", e.target.value || undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finished_at">{t("userBook.finishedAt")}</Label>
              <Input
                id="finished_at"
                type="date"
                value={data?.finished_at?.split("T")[0] || ""}
                onChange={(e) => updateField("finished_at", e.target.value || undefined)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Оценка и заметки */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userBook.rating")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">{t("userBook.rating")}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rating"
                type="number"
                min={1}
                max={5}
                step={0.5}
                placeholder="5"
                value={data?.rating || ""}
                onChange={(e) =>
                  updateField("rating", e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">{t("userBook.rating")} 5</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_notes">{t("userBook.notes")}</Label>
            <Textarea
              id="personal_notes"
              placeholder={t("userBook.notes")}
              value={data?.personal_notes || ""}
              onChange={(e) => updateField("personal_notes", e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Владение */}
      <Card>
        <CardHeader>
          <CardTitle>{t("userBook.isOwned")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_owned"
              checked={data?.is_owned || false}
              onChange={(e) => updateField("is_owned", e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="is_owned">{t("userBook.isOwned")}</Label>
          </div>

          {data?.is_owned && (
            <>
              <div className="space-y-2">
                <Label htmlFor="owned_format">{t("userBook.ownedFormat")}</Label>
                <NativeSelect
                  id="owned_format"
                  value={data?.owned_format || "paperback"}
                  onChange={(e) => updateField("owned_format", e.target.value as BookFormat)}
                >
                  {ownedFormats.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t("userBook.location")}</Label>
                <Input
                  id="location"
                  placeholder={t("userBook.location")}
                  value={data?.location || ""}
                  onChange={(e) => updateField("location", e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="reread_count">{t("userBook.rereadCount")}</Label>
            <Input
              id="reread_count"
              type="number"
              min={0}
              placeholder="0"
              value={data?.reread_count || ""}
              onChange={(e) =>
                updateField("reread_count", e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
