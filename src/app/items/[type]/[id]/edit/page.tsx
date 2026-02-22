"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowLeft, Save } from "lucide-react"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db, getEntityById, updateEntity } from "@/lib/db"
import type { ItemType } from "@/types"

const itemSchema = z.object({
  name: z.string().min(1, "Введите название"),
  category: z.string().optional(),
  description: z.string().optional(),
  usage: z.string().optional(),
  benefits: z.string().optional(),
  contraindications: z.string().optional(),
  dosage: z.string().optional(),
  form: z.string().optional(),
  manufacturer: z.string().optional(),
  composition: z.string().optional(),
  storage: z.string().optional(),
  expiration: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
})

type FormData = z.infer<typeof itemSchema>

const typeLabels: Record<ItemType, string> = {
  vitamin: "Витамин",
  medicine: "Лекарство",
  herb: "Трава",
  cosmetic: "Косметика",
  product: "Продукт",
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const type = params.type as ItemType
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(itemSchema),
  })

  useEffect(() => {
    async function loadData() {
      try {
        const item = await getEntityById(db.items, id)
        if (item) {
          reset({
            name: item.name,
            category: item.category || "",
            description: item.description || "",
            usage: item.usage || "",
            benefits: item.benefits || "",
            contraindications: item.contraindications || "",
            dosage: item.dosage || "",
            form: item.form || "",
            manufacturer: item.manufacturer || "",
            composition: item.composition || "",
            storage: item.storage || "",
            expiration: item.expiration?.split("T")[0] || "",
            notes: item.notes || "",
            tags: item.tags?.join(", ") || "",
          })
        }
      } catch (error) {
        console.error("Failed to load item:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      await updateEntity(db.items, id, {
        name: data.name,
        category: data.category || undefined,
        description: data.description,
        usage: data.usage,
        benefits: data.benefits,
        contraindications: data.contraindications,
        dosage: data.dosage,
        form: data.form,
        manufacturer: data.manufacturer,
        composition: data.composition,
        storage: data.storage,
        expiration: data.expiration,
        notes: data.notes,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      })
      router.push(`/items/${type}/${id}`)
    } catch (error) {
      console.error("Failed to update item:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="container mx-auto px-4 py-6">
          <Card><CardContent className="p-4 text-center text-muted-foreground">Загрузка...</CardContent></Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={`Редактировать: ${typeLabels[type]}`}>
      <div className="container mx-auto px-4 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Основное</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Категория</Label>
                <Input id="category" {...register("category")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea id="description" {...register("description")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Применение</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="usage">Способ применения</Label>
                <Textarea id="usage" {...register("usage")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Дозировка</Label>
                  <Input id="dosage" {...register("dosage")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="form">Форма выпуска</Label>
                  <Input id="form" {...register("form")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Здоровье</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="benefits">Польза</Label>
                <Textarea id="benefits" {...register("benefits")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contraindications">Противопоказания</Label>
                <Textarea id="contraindications" {...register("contraindications")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Дополнительно</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Производитель</Label>
                  <Input id="manufacturer" {...register("manufacturer")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiration">Срок годности</Label>
                  <Input id="expiration" type="date" {...register("expiration")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="composition">Состав</Label>
                <Textarea id="composition" {...register("composition")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage">Условия хранения</Label>
                <Input id="storage" {...register("storage")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Textarea id="notes" {...register("notes")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Теги</Label>
                <Input id="tags" placeholder="теги через запятую" {...register("tags")} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />Отмена
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />{isSaving ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}