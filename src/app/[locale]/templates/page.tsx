"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "@/components/ui/toast"
import {
  Plus,
  Copy,
  Trash2,
  Star,
  Utensils,
  Dumbbell,
  Droplet,
  Moon,
  Smile,
  Edit2,
  Check,
} from "@/lib/icons"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { moduleColors, uiColors } from "@/lib/theme-colors"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, createEntity, deleteEntity } from "@/lib/db"
import type { Template, WaterLog, SleepLog, MoodLog, JSONValue, Log } from "@/types"
import { LogType } from "@/types"
import {
  FoodTemplateForm,
  WorkoutTemplateForm,
  WaterTemplateForm,
  SleepTemplateForm,
  MoodTemplateForm,
  getMoodOptions,
  FoodTemplateData,
  WorkoutTemplateData,
  WaterTemplateData,
  SleepTemplateData,
  MoodTemplateData,
} from "@/components/templates/template-forms"
import { useRouter } from "@/lib/navigation"
import { PageActions, DeleteConfirmActions } from "@/components/shared/page-actions"

function getTemplateTypes(t: any) {
  return [
    { key: "food" as const, label: t("types.food"), icon: Utensils, color: moduleColors.food.text },
    {
      key: "workout" as const,
      label: t("types.workout"),
      icon: Dumbbell,
      color: moduleColors.workout.text,
    },
    {
      key: "water" as const,
      label: t("types.water"),
      icon: Droplet,
      color: moduleColors.water.text,
    },
    { key: "sleep" as const, label: t("types.sleep"), icon: Moon, color: moduleColors.sleep.text },
    { key: "mood" as const, label: t("types.mood"), icon: Smile, color: moduleColors.mood.text },
  ]
}

// Дефолтные данные для каждого типа
const getDefaultData = (type: Template["type"]) => {
  switch (type) {
    case "food":
      return { title: "" } as FoodTemplateData
    case "workout":
      return { title: "" } as WorkoutTemplateData
    case "water":
      return { amount_ml: 250, type: "water" } as WaterTemplateData
    case "sleep":
      return { start_time: "23:00", end_time: "07:00", quality: 3 } as SleepTemplateData
    case "mood":
      return { mood: "good", energy: 3, stress: 3, activities: [] } as MoodTemplateData
    default:
      return {}
  }
}

export default function TemplatesPage() {
  const router = useRouter()
  const t = useTranslations("templates")
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)

  // Состояния для создания шаблона
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateType, setNewTemplateType] = useState<Template["type"]>("food")
  const [newTemplateData, setNewTemplateData] = useState<Record<string, unknown>>(
    getDefaultData("food")
  )

  // Состояния для редактирования шаблона
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editTemplateName, setEditTemplateName] = useState("")
  const [editTemplateData, setEditTemplateData] = useState<Record<string, unknown>>({})

  // Состояния для удаления
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Состояния для применения шаблона
  const [showApplyDialog, setShowApplyDialog] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState<Template | null>(null)
  const [applySuccess, setApplySuccess] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    setLoading(true)
    try {
      const data = await db.templates.toArray()
      setTemplates(data)
    } catch (error) {
      console.error("Failed to load templates:", error)
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // Создание шаблона
  // ========================================

  function openCreateDialog(type: Template["type"] = "food") {
    setNewTemplateType(type)
    setNewTemplateName("")
    setNewTemplateData(getDefaultData(type))
    setShowCreateDialog(true)
  }

  async function createTemplate() {
    if (!newTemplateName.trim()) return

    await createEntity(db.templates, {
      name: newTemplateName.trim(),
      type: newTemplateType,
      data: newTemplateData as JSONValue,
      is_favorite: false,
      use_count: 0,
    })

    setShowCreateDialog(false)
    loadTemplates()
  }

  // ========================================
  // Редактирование шаблона
  // ========================================

  function openEditDialog(template: Template) {
    setEditingTemplate(template)
    setEditTemplateName(template.name)
    setEditTemplateData(template.data as Record<string, unknown>)
    setShowEditDialog(true)
  }

  async function updateTemplate() {
    if (!editingTemplate || !editTemplateName.trim()) return

    await db.templates.update(editingTemplate.id, {
      name: editTemplateName.trim(),
      data: editTemplateData as JSONValue,
      updated_at: new Date().toISOString(),
    })

    setShowEditDialog(false)
    setEditingTemplate(null)
    loadTemplates()
  }

  // ========================================
  // Удаление шаблона
  // ========================================

  function openDeleteDialog(template: Template) {
    setEditingTemplate(template)
    setShowDeleteDialog(true)
  }

  async function deleteTemplate() {
    if (!editingTemplate) return

    await deleteEntity(db.templates, editingTemplate.id)

    setShowDeleteDialog(false)
    setShowEditDialog(false)
    setEditingTemplate(null)
    loadTemplates()
  }

  // ========================================
  // Избранное
  // ========================================

  async function toggleFavorite(template: Template) {
    await db.templates.update(template.id, { is_favorite: !template.is_favorite })
    loadTemplates()
  }

  // ========================================
  // Применение шаблона
  // ========================================

  async function useTemplate(template: Template) {
    // Увеличиваем счётчик использований
    await db.templates.update(template.id, { use_count: (template.use_count || 0) + 1 })

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const time = now.toTimeString().slice(0, 5)
    const dateTime = `${today}T${time}`

    try {
      switch (template.type) {
        case "food": {
          const data = template.data as unknown as FoodTemplateData
          await createEntity(db.logs, {
            type: LogType.FOOD,
            date: dateTime,
            title: data.title || template.name,
            calories: data.calories,
            metadata: {
              calories: data.calories,
              protein: data.protein,
              fat: data.fat,
              carbs: data.carbs,
            },
          } as Partial<Log>)
          break
        }

        case "workout": {
          const data = template.data as unknown as WorkoutTemplateData
          await createEntity(db.logs, {
            type: LogType.WORKOUT,
            date: dateTime,
            title: data.title || template.name,
            metadata: {
              duration: data.duration,
              intensity: data.intensity,
              subcategory: data.subcategory,
              equipment: data.equipment ? [data.equipment] : undefined,
              goal: data.goal,
              calories_burned: data.calories_burned,
              exercises_count: data.exercises_count,
              sets_count: data.sets_count,
              reps_count: data.reps_count,
              total_weight: data.total_weight,
            },
          } as Partial<Log>)
          break
        }

        case "water": {
          const data = template.data as unknown as WaterTemplateData
          await createEntity(db.waterLogs, {
            date: today,
            amount_ml: data.amount_ml,
            time: time,
            type: data.type || "water",
          } as WaterLog)

          // Обновляем цель по воде
          const goal = await db.goals.where("type").equals("water").first()
          if (goal) {
            await db.goals.update(goal.id, {
              current_value: (goal.current_value || 0) + data.amount_ml,
            })
          }
          break
        }

        case "sleep": {
          const data = template.data as unknown as SleepTemplateData
          // Расчёт длительности
          const [startH, startM] = data.start_time.split(":").map(Number)
          const [endH, endM] = data.end_time.split(":").map(Number)
          let startMinutes = startH * 60 + startM
          let endMinutes = endH * 60 + endM
          if (endMinutes < startMinutes) endMinutes += 24 * 60
          const duration = endMinutes - startMinutes

          await createEntity(db.sleepLogs, {
            date: today,
            start_time: data.start_time,
            end_time: data.end_time,
            duration_min: duration,
            quality: data.quality || 3,
            notes: data.notes,
          } as SleepLog)
          break
        }

        case "mood": {
          const data = template.data as unknown as MoodTemplateData
          await createEntity(db.moodLogs, {
            date: now.toISOString(),
            mood: data.mood,
            energy: data.energy || 3,
            stress: data.stress || 3,
            activities: data.activities,
            notes: data.notes,
          } as MoodLog)
          break
        }
      }

      setApplySuccess(true)
      setApplyingTemplate(template)
      setShowApplyDialog(true)

      loadTemplates()
    } catch (error) {
      console.error("Failed to apply template:", error)
      toast.error("Ошибка при применении шаблона")
    }
  }

  const getTypeInfo = (type: Template["type"]) => {
    return getTemplateTypes(t).find((t) => t.key === type) || getTemplateTypes(t)[0]
  }

  const groupedTemplates = {
    favorite: templates.filter((t) => t.is_favorite),
    food: templates.filter((t) => t.type === "food" && !t.is_favorite),
    workout: templates.filter((t) => t.type === "workout" && !t.is_favorite),
    water: templates.filter((t) => t.type === "water" && !t.is_favorite),
    sleep: templates.filter((t) => t.type === "sleep" && !t.is_favorite),
    mood: templates.filter((t) => t.type === "mood" && !t.is_favorite),
  }

  // Рендер формы в зависимости от типа
  const renderTemplateForm = (
    type: Template["type"],
    data: Record<string, unknown>,
    onChange: (data: Record<string, unknown>) => void
  ) => {
    switch (type) {
      case "food":
        return (
          <FoodTemplateForm
            data={data as unknown as FoodTemplateData}
            onChange={(d) => onChange(d as unknown as Record<string, unknown>)}
          />
        )
      case "workout":
        return (
          <WorkoutTemplateForm
            data={data as unknown as WorkoutTemplateData}
            onChange={(d) => onChange(d as unknown as Record<string, unknown>)}
          />
        )
      case "water":
        return (
          <WaterTemplateForm
            data={data as unknown as WaterTemplateData}
            onChange={(d) => onChange(d as unknown as Record<string, unknown>)}
          />
        )
      case "sleep":
        return (
          <SleepTemplateForm
            data={data as unknown as SleepTemplateData}
            onChange={(d) => onChange(d as unknown as Record<string, unknown>)}
          />
        )
      case "mood":
        return (
          <MoodTemplateForm
            data={data as unknown as MoodTemplateData}
            onChange={(d) => onChange(d as unknown as Record<string, unknown>)}
          />
        )
    }
  }

  // Получить краткое описание данных шаблона
  const getTemplateSummary = (template: Template): string => {
    const data = template.data as Record<string, unknown>

    switch (template.type) {
      case "food": {
        const d = data as unknown as FoodTemplateData
        const parts: string[] = []
        if (d.calories) parts.push(`${d.calories} ${t("units.kcal")}`)
        if (d.portion_size) parts.push(`${d.portion_size} ${t("units.g")}`)
        return parts.join(" • ") || d.title || t("noData")
      }
      case "workout": {
        const d = data as unknown as WorkoutTemplateData
        const parts: string[] = []
        if (d.duration) parts.push(`${d.duration} ${t("units.min")}`)
        if (d.calories_burned) parts.push(`${d.calories_burned} ${t("units.kcal")}`)
        return parts.join(" • ") || d.title || t("noData")
      }
      case "water": {
        const d = data as unknown as WaterTemplateData
        return `${d.amount_ml} мл • ${t(`types.${d.type || "water"}`)}`
      }
      case "sleep": {
        const d = data as unknown as SleepTemplateData
        return `${d.start_time} → ${d.end_time}`
      }
      case "mood": {
        const d = data as unknown as MoodTemplateData
        const moodInfo = getMoodOptions(t).find((m) => m.value === d.mood)
        return `${moodInfo?.emoji || "😐"} ${d.mood ? t(`mood.${d.mood}`) : t("noData")}`
      }
      default:
        return t("noData")
    }
  }

  return (
    <div className="min-h-screen bg-light">
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">{t("header.title")}</h1>
              <p className="text-dark-lighter text-sm">{t("header.subtitle")}</p>
            </div>
            <Button onClick={() => openCreateDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t("actions.create")}
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-dark-lighter">{t("empty.loading")}</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-light-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Copy className="h-8 w-8 text-dark-lighter" />
              </div>
              <h3 className="text-lg font-medium text-dark mb-2">{t("empty.noTemplates")}</h3>
              <p className="text-dark-lighter text-sm mb-4">{t("empty.createHint")}</p>
              <Button onClick={() => openCreateDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                {t("actions.createFirst")}
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Избранное */}
              {groupedTemplates.favorite.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                    <Star
                      className={`h-5 w-5 ${uiColors.favorite.DEFAULT} ${uiColors.favorite.fill}`}
                    />
                    {t("sections.favorite")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTemplates.favorite.map((template) => {
                      const typeInfo = getTypeInfo(template.type)
                      const Icon = typeInfo.icon
                      return (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg bg-light-dark`}>
                                  <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                                </div>
                                <div>
                                  <h3 className="font-medium">{template.name}</h3>
                                  <p className="text-xs text-dark-lighter">
                                    {t(`types.${template.type}`)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleFavorite(template)}
                                aria-label={
                                  template.is_favorite
                                    ? t("actions.removeFromFavorite")
                                    : t("actions.addToFavorite")
                                }
                              >
                                <Star
                                  className={`h-4 w-4 ${uiColors.favorite.fill} ${uiColors.favorite.DEFAULT}`}
                                />
                              </Button>
                            </div>

                            <p className="text-sm text-dark-lighter mb-3">
                              {getTemplateSummary(template)}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-dark-lighter">
                                {t("sections.usedCount", { count: template.use_count || 0 })}
                              </span>
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => useTemplate(template)}
                                >
                                  {t("actions.apply")}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditDialog(template)}
                                  aria-label={t("actions.edit")}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`h-8 w-8 text-dark-lighter ${uiColors.delete.hover}`}
                                  onClick={() => openDeleteDialog(template)}
                                  aria-label={t("actions.delete")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* По категориям */}
              {getTemplateTypes(t).map((type) => {
                const items = groupedTemplates[
                  type.key as keyof typeof groupedTemplates
                ] as Template[]
                if (items.length === 0) return null

                const Icon = type.icon
                return (
                  <div key={type.key}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${type.color}`} />
                        {type.label}
                      </h2>
                      <Button variant="ghost" size="sm" onClick={() => openCreateDialog(type.key)}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t("add")}
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((template) => {
                        const typeInfo = getTypeInfo(template.type)
                        const Icon = typeInfo.icon
                        return (
                          <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-lg bg-light-dark`}>
                                    <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{template.name}</h3>
                                    <p className="text-xs text-dark-lighter">{typeInfo.label}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleFavorite(template)}
                                  aria-label={
                                    template.is_favorite
                                      ? "Удалить из избранного"
                                      : "Добавить в избранное"
                                  }
                                >
                                  <Star
                                    className={`h-4 w-4 ${template.is_favorite ? `${uiColors.favorite.fill} ${uiColors.favorite.DEFAULT}` : ""}`}
                                  />
                                </Button>
                              </div>

                              <p className="text-sm text-dark-lighter mb-3">
                                {getTemplateSummary(template)}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-dark-lighter">
                                  Использований: {template.use_count || 0}
                                </span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => useTemplate(template)}
                                  >
                                    Применить
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => openEditDialog(template)}
                                    aria-label="Редактировать шаблон"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 text-dark-lighter ${uiColors.delete.hover}`}
                                    onClick={() => openDeleteDialog(template)}
                                    aria-label="Удалить шаблон"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </AppLayout>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.createTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("dialogs.nameLabel")}</Label>
              <Input
                placeholder={t("dialogs.namePlaceholder")}
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("dialogs.typeLabel")}</Label>
              <div className="grid grid-cols-5 gap-2">
                {getTemplateTypes(t).map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => {
                        setNewTemplateType(type.key as Template["type"])
                        setNewTemplateData(getDefaultData(type.key))
                      }}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-[border-color,background-color] duration-200 ${
                        newTemplateType === type.key
                          ? "border-primary bg-primary/5"
                          : "border-light-darker hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <span className="text-xs">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {renderTemplateForm(newTemplateType, newTemplateData, setNewTemplateData)}
          </div>
          <PageActions
            variant="dialog"
            onCancel={() => setShowCreateDialog(false)}
            onSimpleSave={createTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.editTitle")}</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t("dialogs.nameLabel")}</Label>
                <Input
                  placeholder={t("dialogs.namePlaceholder")}
                  value={editTemplateName}
                  onChange={(e) => setEditTemplateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("dialogs.typeLabel")}</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                  {(() => {
                    const typeInfo = getTypeInfo(editingTemplate.type)
                    const Icon = typeInfo.icon
                    return (
                      <>
                        <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                        <span>{t(`types.${editingTemplate.type}`)}</span>
                      </>
                    )
                  })()}
                </div>
              </div>

              {renderTemplateForm(editingTemplate.type, editTemplateData, setEditTemplateData)}
            </div>
          )}
          <PageActions
            variant="dialog"
            showDelete={true}
            onSimpleDelete={() => setShowDeleteDialog(true)}
            onCancel={() => setShowEditDialog(false)}
            onSimpleSave={updateTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialogs.deleteTitle")}</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-muted-foreground">
            {t.rich("dialogs.deleteConfirm", { name: editingTemplate?.name || "" })}
          </p>
          <DeleteConfirmActions
            onCancel={() => setShowDeleteDialog(false)}
            onConfirm={deleteTemplate}
          />
        </DialogContent>
      </Dialog>

      {/* Apply Success Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${uiColors.success.DEFAULT}`}>
              <Check className="h-5 w-5" />
              {t("apply.success")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t.rich("apply.success", { name: applyingTemplate?.name || "" })}
            </p>
            {applyingTemplate && (
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowApplyDialog(false)
                    // Можно добавить переход к соответствующему разделу
                  }}
                >
                  {t("apply.stay")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowApplyDialog(false)
                    // Переход к соответствующему разделу
                    const routes: Record<string, string> = {
                      food: "/logs/food",
                      workout: "/logs/workout",
                      water: "/water",
                      sleep: "/sleep",
                      mood: "/mood",
                    }
                    router.push(routes[applyingTemplate.type])
                  }}
                >
                  {t("apply.goToRecord")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
