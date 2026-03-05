"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSection, TagManager } from "@/components/shared/forms"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ru, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { bookStatusColors } from "@/lib/theme-colors"
import type { UserBook, ReadingStatus, BookFormat } from "@/types"

// Локализованные placeholder для дат
const datePlaceholders: Record<string, string> = {
  ru: "дд.мм.гггг",
  en: "mm/dd/yyyy",
}

interface UserBookFormProps {
  data?: Partial<UserBook>
  pageCount?: number
  onChange: (data: Partial<UserBook>) => void
}

export function UserBookForm({ data, pageCount, onChange }: UserBookFormProps) {
  const t = useTranslations("books")
  const locale = useLocale()

  // Статусы чтения с переводами
  const readingStatuses: { value: ReadingStatus; label: string; color: string }[] = [
    { value: "planned", label: t("status.planned"), color: bookStatusColors.planned.light },
    { value: "reading", label: t("status.reading"), color: bookStatusColors.reading.light },
    { value: "completed", label: t("status.completed"), color: bookStatusColors.completed.light },
    { value: "paused", label: t("status.paused"), color: bookStatusColors.paused.light },
    { value: "dropped", label: t("status.dropped"), color: bookStatusColors.dropped.light },
  ]

  // Форматы владения с переводами
  const ownedFormats: { value: BookFormat; label: string }[] = [
    { value: "paperback", label: t("formats.paperback") },
    { value: "hardcover", label: t("formats.hardcover") },
    { value: "ebook", label: t("formats.ebook") },
    { value: "audiobook", label: t("formats.audiobook") },
  ]

  const updateField = <K extends keyof UserBook>(field: K, value: UserBook[K]) => {
    onChange({ ...data, [field]: value })
  }

  const [tags, setTags] = useState<string[]>(data?.tags || [])

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags)
    onChange({ ...data, tags: newTags })
  }

  // Получаем текущую локаль для date-fns
  const dateFnsLocale = locale === "ru" ? ru : enUS

  // Вычисляем процент прогресса
  const progressPercent =
    data?.progress_percent ??
    (data?.progress_pages && pageCount ? Math.round((data.progress_pages / pageCount) * 100) : 0)

  return (
    <>
      {/* Статус и прогресс */}
      <FormSection title={t("userBook.status")}>
        <div className="space-y-4">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data?.started_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data?.started_at ? (
                      format(new Date(data.started_at), "LLL dd, y", { locale: dateFnsLocale })
                    ) : (
                      <span>{t("userBook.startedAt")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="bottom" align="start">
                  <Calendar
                    mode="single"
                    selected={data?.started_at ? new Date(data.started_at) : undefined}
                    onSelect={(date) =>
                      updateField("started_at", date ? format(date, "yyyy-MM-dd") : undefined)
                    }
                    initialFocus
                    locale={dateFnsLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="finished_at">{t("userBook.finishedAt")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data?.finished_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data?.finished_at ? (
                      format(new Date(data.finished_at), "LLL dd, y", { locale: dateFnsLocale })
                    ) : (
                      <span>{t("userBook.finishedAt")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" side="bottom" align="start">
                  <Calendar
                    mode="single"
                    selected={data?.finished_at ? new Date(data.finished_at) : undefined}
                    onSelect={(date) =>
                      updateField("finished_at", date ? format(date, "yyyy-MM-dd") : undefined)
                    }
                    initialFocus
                    locale={dateFnsLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Оценка, владение и заметки */}
      <FormSection title={t("userBook.rating")}>
        <div className="space-y-4">
          {/* Оценка, перечитывания, владение в одной строке */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rating">{t("userBook.rating")}</Label>
              <Combobox
                options={[
                  { id: "0", label: "–" },
                  { id: "1", label: "1" },
                  { id: "2", label: "2" },
                  { id: "3", label: "3" },
                  { id: "4", label: "4" },
                  { id: "5", label: "5" },
                ]}
                value={data?.rating?.toString() || ""}
                onChange={(value) =>
                  updateField("rating", value ? parseInt(value as string) : undefined)
                }
                placeholder="5"
                allowCustom={false}
                searchable={false}
              />
            </div>

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

            <div className="space-y-2">
              <Label>{t("userBook.isOwned")}</Label>
              <div className="flex items-center h-10 gap-2">
                <input
                  type="checkbox"
                  id="is_owned"
                  checked={data?.is_owned || false}
                  onChange={(e) => updateField("is_owned", e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="is_owned" className="font-normal text-sm">
                  {t("userBook.isOwned")}
                </Label>
              </div>
            </div>
          </div>

          {/* Формат и местоположение, если в собственности */}
          {data?.is_owned && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owned_format">{t("userBook.ownedFormat")}</Label>
                <Combobox
                  options={ownedFormats.map((f) => ({ id: f.value, label: f.label }))}
                  value={data?.owned_format || "paperback"}
                  onChange={(value) => updateField("owned_format", value as BookFormat)}
                  allowCustom={false}
                  searchable={false}
                />
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
            </div>
          )}

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

          <TagManager
            tags={tags}
            onChange={handleTagsChange}
            label={t("fields.tags")}
            placeholder={t("fields.addTag")}
          />
        </div>
      </FormSection>
    </>
  )
}
