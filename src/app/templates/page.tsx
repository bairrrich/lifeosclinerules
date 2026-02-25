"use client"

import { useEffect, useState } from "react"
import { Plus, Copy, Trash2, Star, Utensils, Dumbbell, Droplet, Moon, Smile } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, initializeDatabase, createEntity, deleteEntity } from "@/lib/db"
import type { Template } from "@/types"

const templateTypes = [
  { key: "food" as const, label: "Еда", icon: Utensils, color: "text-green-500" },
  { key: "workout" as const, label: "Тренировка", icon: Dumbbell, color: "text-blue-500" },
  { key: "water" as const, label: "Вода", icon: Droplet, color: "text-cyan-500" },
  { key: "sleep" as const, label: "Сон", icon: Moon, color: "text-purple-500" },
  { key: "mood" as const, label: "Настроение", icon: Smile, color: "text-yellow-500" },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "food" as Template["type"],
    data: {} as Record<string, unknown>,
  })

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

  async function createTemplate() {
    if (!newTemplate.name.trim()) return

    await createEntity(db.templates, {
      name: newTemplate.name.trim(),
      type: newTemplate.type,
      data: newTemplate.data,
      is_favorite: false,
      use_count: 0,
    })

    setNewTemplate({ name: "", type: "food", data: {} })
    setShowCreateDialog(false)
    loadTemplates()
  }

  async function deleteTemplate(id: string) {
    if (!confirm("Удалить этот шаблон?")) return
    await deleteEntity(db.templates, id)
    loadTemplates()
  }

  async function toggleFavorite(template: Template) {
    await db.templates.update(template.id, { is_favorite: !template.is_favorite })
    loadTemplates()
  }

  async function useTemplate(template: Template) {
    await db.templates.update(template.id, { use_count: (template.use_count || 0) + 1 })
    
    // Здесь можно добавить логику применения шаблона
    // Например, создать запись на основе шаблона
    alert(`Шаблон "${template.name}" применён!`)
    loadTemplates()
  }

  const getTypeInfo = (type: Template["type"]) => {
    return templateTypes.find(t => t.key === type) || templateTypes[0]
  }

  const groupedTemplates = {
    favorite: templates.filter(t => t.is_favorite),
    food: templates.filter(t => t.type === "food" && !t.is_favorite),
    workout: templates.filter(t => t.type === "workout" && !t.is_favorite),
    water: templates.filter(t => t.type === "water" && !t.is_favorite),
    sleep: templates.filter(t => t.type === "sleep" && !t.is_favorite),
    mood: templates.filter(t => t.type === "mood" && !t.is_favorite),
  }

  return (
    <div className="min-h-screen bg-light">
      <AppLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">Шаблоны</h1>
              <p className="text-dark-lighter text-sm">Быстрые шаблоны для частых записей</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-dark-lighter">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-light-dark rounded-full flex items-center justify-center mx-auto mb-4">
                <Copy className="h-8 w-8 text-dark-lighter" />
              </div>
              <h3 className="text-lg font-medium text-dark mb-2">Нет шаблонов</h3>
              <p className="text-dark-lighter text-sm mb-4">Создайте шаблоны для быстрого добавления частых записей</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать первый шаблон
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Избранное */}
              {groupedTemplates.favorite.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Избранное
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedTemplates.favorite.map(template => {
                      const typeInfo = getTypeInfo(template.type)
                      const Icon = typeInfo.icon
                      return (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                                <h3 className="font-medium">{template.name}</h3>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => toggleFavorite(template)}
                              >
                                <Star className={`h-4 w-4 ${template.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                              </Button>
                            </div>
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
                                  className="h-8 w-8 text-dark-lighter hover:text-red-500"
                                  onClick={() => deleteTemplate(template.id)}
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
              {templateTypes.map(type => {
                const items = groupedTemplates[type.key as keyof typeof groupedTemplates]
                if (items.length === 0) return null
                
                const Icon = type.icon
                return (
                  <div key={type.key}>
                    <h2 className="text-lg font-semibold text-dark mb-3 flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      {type.label}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map(template => {
                        const typeInfo = getTypeInfo(template.type)
                        const Icon = typeInfo.icon
                        return (
                          <Card key={template.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                                  <h3 className="font-medium">{template.name}</h3>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => toggleFavorite(template)}
                                >
                                  <Star className={`h-4 w-4 ${template.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                                </Button>
                              </div>
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
                                    className="h-8 w-8 text-dark-lighter hover:text-red-500"
                                    onClick={() => deleteTemplate(template.id)}
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
            <DialogTitle>Создать шаблон</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Название шаблона</Label>
              <Input
                placeholder="Например: Завтрак - овсянка"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Тип</Label>
              <div className="grid grid-cols-5 gap-2">
                {templateTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setNewTemplate({ ...newTemplate, type: type.key as Template["type"] })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        newTemplate.type === type.key
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Отмена
            </Button>
            <Button onClick={createTemplate} disabled={!newTemplate.name.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}